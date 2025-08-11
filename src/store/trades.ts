"use client";

// Centralized trades stream store using a single WebSocket connection.
// Keeps per-symbol recent trades and last price for lightweight consumption.

import { create } from "zustand";
import type { Trade } from "@/types";

type TradesState = {
    connected: boolean;
    error?: string;
    // Per-symbol rolling trades window
    tradesBySymbol: Map<string, Trade[]>;
    // Per-symbol last trade price
    lastPriceBySymbol: Map<string, number>;
    getTrades: (symbol: string) => Trade[];
    getLastPrice: (symbol: string) => number | undefined;
};

const MAX_KEEP = 100; // keep last N trades per symbol
const EMPTY_TRADES: Trade[] = []; // stable reference for missing symbols

export const useTrades = create<TradesState>((set, get) => ({
    connected: false,
    error: undefined,
    tradesBySymbol: new Map<string, Trade[]>(),
    lastPriceBySymbol: new Map<string, number>(),
    getTrades: (symbol: string) => get().tradesBySymbol.get(symbol) ?? EMPTY_TRADES,
    getLastPrice: (symbol: string) => get().lastPriceBySymbol.get(symbol),
}));

let ws: WebSocket | null = null;

/**
 * Start the single trades WebSocket connection (idempotent).
 */
export function startTradesStream() {
    if (typeof window === "undefined") return; // SSR guard
    if (ws) return; // already started

    const url = `ws://${process.env.NEXT_PUBLIC_API_URL ?? "localhost:3001"}/trades`;
    ws = new WebSocket(url);

    ws.onopen = () => {
        useTrades.setState({ connected: true, error: undefined });
    };

    // Incoming frames are guaranteed to have string price/qty
    type IncomingTrade = {
        symbol: string;
        price: string;
        qty: string;
        maker?: { side?: "SELL" | "BUY" };
        timestamp?: number;
    };

    const normalizeSymbol = (s: string) => s.replaceAll("/", "").toUpperCase();
    const toNumber = (s: string) => parseFloat(s);

    ws.onmessage = (event) => {
        try {
            const raw = JSON.parse(event.data) as IncomingTrade;
            const symbolKey = normalizeSymbol(raw.symbol);
            const priceNum = toNumber(raw.price);
            const qtyNum = toNumber(raw.qty);
            if (Number.isNaN(priceNum) || Number.isNaN(qtyNum)) return;

            const normalizedTrade: Trade = {
                symbol: symbolKey,
                price: priceNum,
                qty: qtyNum,
                timestamp: typeof raw.timestamp === "number" ? raw.timestamp : undefined,
                maker: { side: raw?.maker?.side === "SELL" ? "SELL" : "BUY" },
            };

            useTrades.setState((prev) => {
                const tradesMap = new Map(prev.tradesBySymbol);
                const lastPriceMap = new Map(prev.lastPriceBySymbol);

                const list = tradesMap.get(symbolKey) ?? [];
                const next = [normalizedTrade, ...list].slice(0, MAX_KEEP);
                tradesMap.set(symbolKey, next);

                lastPriceMap.set(symbolKey, priceNum);

                return { tradesBySymbol: tradesMap, lastPriceBySymbol: lastPriceMap };
            });
        } catch {
            // ignore malformed frames
        }
    };

    ws.onerror = () => {
        useTrades.setState({ error: "ws-error" });
    };

    ws.onclose = () => {
        useTrades.setState({ connected: false });
        ws = null;
    };
}

/**
 * Stop the trades stream if running.
 */
export function stopTradesStream() {
    if (ws) {
        ws.close();
        ws = null;
    }
}
