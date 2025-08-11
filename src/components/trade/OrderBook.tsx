"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTrades, startTradesStream } from "@/store/trades";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";

interface OrderLevel {
    price: string;
    size: string;
}

export default function OrderBook() {
    const [asks, setAsks] = useState<OrderLevel[]>([]);
    const [bids, setBids] = useState<OrderLevel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    type ViewMode = "ALL" | "ASKS" | "BIDS";
    const [view, setView] = useState<ViewMode>("ALL");
    // View/price UI removed for now; focusing on containers only

    useEffect(() => {
        // Establish a WebSocket connection to the backend order-book stream
        const socket = new WebSocket(`ws://${process.env.NEXT_PUBLIC_API_URL ?? "localhost:3001"}/orderbook?symbol=BTCUSDT`);

        interface RawOrder {
            side: "BUY" | "SELL";
            price: string | number;
            qty: number;
        }

        socket.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);

                // Normalize various possible payload shapes into a flat RawOrder[] array
                let rawOrders: RawOrder[] = [];
                if (Array.isArray(payload)) {
                    rawOrders = payload as RawOrder[];
                } else if (payload.orderBook) {
                    const { bids = {}, asks = {} } = payload.orderBook as {
                        bids: Record<string, RawOrder[]>;
                        asks: Record<string, RawOrder[]>;
                    };
                    const flatten = (obj: Record<string, RawOrder[]>) => Object.values(obj).reduce<RawOrder[]>((acc, arr) => acc.concat(arr), []);
                    rawOrders = [...flatten(bids), ...flatten(asks)];
                } else if (payload.orders) {
                    rawOrders = payload.orders as RawOrder[];
                }

                if (!rawOrders?.length) {
                    // Ignore empty payloads
                    return;
                }

                const asksMap = new Map<string, number>();
                const bidsMap = new Map<string, number>();

                rawOrders.forEach((o) => {
                    const priceStr = o.price.toString();
                    const qty = o.qty;
                    if (o.side === "SELL") {
                        asksMap.set(priceStr, (asksMap.get(priceStr) ?? 0) + qty);
                    } else {
                        bidsMap.set(priceStr, (bidsMap.get(priceStr) ?? 0) + qty);
                    }
                });

                const asksArr = Array.from(asksMap.entries())
                    .map(([price, size]) => ({ price, size: size.toString() }))
                    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                    .slice(0, 15);

                const bidsArr = Array.from(bidsMap.entries())
                    .map(([price, size]) => ({ price, size: size.toString() }))
                    .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
                    .slice(0, 15);

                setAsks(asksArr);
                setBids(bidsArr);
                setLoading(false);
            } catch (err) {
                console.warn("[OrderBook] Invalid payload", err);
            }
        };

        socket.onerror = () => console.error("[OrderBook] WebSocket error");

        socket.onclose = () => {
            console.log("[OrderBook] WebSocket closed");
        };
    }, []);

    // Current price (zustand) placed between asks/bids containers
    useEffect(() => {
        startTradesStream();
    }, []);
    const symbolKey = "BTCUSDT";
    const lastPrice = useTrades((s) => s.getLastPrice(symbolKey));
    const trades = useTrades((s) => s.getTrades(symbolKey));
    const isUp = useMemo(() => {
        if (trades.length < 2) return undefined as boolean | undefined;
        const [latest, prev] = trades;
        return latest.price >= prev.price;
    }, [trades]);
    const colorClass = isUp === undefined ? "" : isUp ? "text-up" : "text-down";
    const lastPriceText = useMemo(() => {
        if (lastPrice === undefined || Number.isNaN(lastPrice)) return "-";
        return lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }, [lastPrice]);

    // Simple row renderers
    const askRows = asks.map((level, idx) => (
        <div key={`ask-${idx}`} className="grid grid-cols-3 gap-1 py-px text-red-600">
            <span className="text-left">{parseFloat(level.price).toLocaleString()}</span>
            <span className="text-right">{parseFloat(level.size).toFixed(3)}</span>
            <span className="text-right" />
        </div>
    ));

    const bidRows = bids.map((level, idx) => (
        <div key={`bid-${idx}`} className="grid grid-cols-3 gap-1 py-px text-green-600">
            <span className="text-left">{parseFloat(level.price).toLocaleString()}</span>
            <span className="text-right">{parseFloat(level.size).toFixed(3)}</span>
            <span className="text-right" />
        </div>
    ));

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Orderbook</h2>
                <div className="space-x-1">
                    {(["ALL", "ASKS", "BIDS"] as ViewMode[]).map((mode) => (
                        <button key={mode} onClick={() => setView(mode)} className={`px-2 py-0.5 rounded text-xs ${view === mode ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}>
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-gray-500 text-sm flex-1 flex items-center justify-center">Loading...</div>
            ) : (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Single column header */}
                    <div className="grid grid-cols-3 gap-1 text-gray-500 py-1 text-[10px] md:text-xs">
                        <span className="text-left">Price</span>
                        <span className="text-right">Size</span>
                        <span className="text-right">Total</span>
                    </div>
                    {view === "ALL" ? (
                        <>
                            {/* Asks half */}
                            <div data-role="asks-container" className="asks-container flex-1 overflow-auto">
                                <div className="flex flex-col h-full">
                                    <div className="mt-auto flex flex-col text-[10px] md:text-xs">{askRows}</div>
                                </div>
                            </div>
                            {/* Current price occupies space */}
                            <div className="grid grid-cols-3 gap-1 py-1" data-role="current-price-row">
                                <span className={`col-span-3 flex items-center gap-2 font-extrabold tabular-nums text-xs md:text-sm ${colorClass}`}>
                                    {isUp === undefined ? null : isUp ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
                                    {lastPriceText}
                                </span>
                            </div>
                            {/* Bids half */}
                            <div data-role="bids-container" className="bids-container flex-1 overflow-auto">
                                <div className="flex flex-col text-[10px] md:text-xs">{bidRows}</div>
                            </div>
                        </>
                    ) : view === "ASKS" ? (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div data-role="asks-container" className="asks-container flex-1 overflow-auto">
                                <div className="flex flex-col h-full">
                                    <div className="mt-auto flex flex-col text-[10px] md:text-xs">{askRows}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1 py-1" data-role="current-price-row">
                                <span className={`col-span-3 flex items-center gap-2 font-extrabold tabular-nums text-xs md:text-sm ${colorClass}`}>
                                    {isUp === undefined ? null : isUp ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
                                    {lastPriceText}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="grid grid-cols-3 gap-1 py-1" data-role="current-price-row">
                                <span className={`col-span-3 flex items-center gap-2 font-extrabold tabular-nums text-xs md:text-sm ${colorClass}`}>
                                    {isUp === undefined ? null : isUp ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
                                    {lastPriceText}
                                </span>
                            </div>
                            <div data-role="bids-container" className="bids-container flex-1 overflow-auto">
                                <div className="flex flex-col text-[10px] md:text-xs">{bidRows}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
