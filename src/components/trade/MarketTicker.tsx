"use client";

import { useEffect, useMemo } from "react";
import { useTrades, startTradesStream } from "@/store/trades";

type Props = {
    symbol: string;
    label?: string;
};

function formatSymbol(sym: string): string {
    if (!sym) return "-";
    const upper = sym.toUpperCase();
    // naive split by USDT/USDC… keeps prefix/base visually similar to Binance style
    const suffixes = ["USDT", "USDC", "USD", "BTC", "ETH"];
    const sfx = suffixes.find((s) => upper.endsWith(s));
    return sfx ? `${upper.slice(0, -sfx.length)}/${sfx}` : upper;
}

function formatNumber(n?: number, digits = 2): string {
    if (n === undefined || Number.isNaN(n)) return "-";
    return n.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

export default function MarketTicker({ symbol, label }: Props) {
    // Start shared trades stream once
    useEffect(() => {
        startTradesStream();
    }, []);

    // Normalize for store key (incoming trades are keyed without slash, uppercased)
    const normalize = (s: string) => s.replaceAll("/", "").toUpperCase();
    const key = normalize(symbol);
    const lastPrice = useTrades((st) => st.getLastPrice(key));
    const trades = useTrades((st) => st.getTrades(key));
    const isUp = useMemo(() => {
        if (trades.length < 2) return undefined as boolean | undefined;
        const [latest, prev] = trades;
        return latest.price >= prev.price;
    }, [trades]);

    return (
        <div className="bg-surface border border-surface-grid rounded-md px-4 py-3 text-chart">
            <div className="flex items-center gap-4">
                {/* Left: Pair & name */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-up/70" />
                    <div className="min-w-0">
                        <div className="text-lg font-semibold truncate">{formatSymbol(symbol)}</div>
                        <div className="text-xs opacity-70 truncate">{label ?? "Paper Trading"}</div>
                    </div>
                </div>

                {/* Price only with up/down color */}
                <div className={`text-2xl font-bold tabular-nums ${isUp === undefined ? "" : isUp ? "text-up" : "text-down"}`}>{formatNumber(lastPrice, 2)}</div>

                {/* Right stats (placeholders for now) */}
                <div className="ml-auto grid grid-cols-4 gap-6 text-sm">
                    <div>
                        <div className="opacity-70">24h High</div>
                        <div className="tabular-nums">-</div>
                    </div>
                    <div>
                        <div className="opacity-70">24h Low</div>
                        <div className="tabular-nums">-</div>
                    </div>
                    <div>
                        <div className="opacity-70">24h Volume(Base)</div>
                        <div className="tabular-nums">-</div>
                    </div>
                    <div>
                        <div className="opacity-70">24h Volume(Quote)</div>
                        <div className="tabular-nums">-</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
