"use client";

import { useEffect } from "react";
import { useTrades, startTradesStream } from "@/store/trades";

/**
 * Real-time trade history table.
 * Subscribes to the backend WebSocket and renders the latest trades (max 100).
 */
export default function RecentTrades({ symbol = "BTCUSDT" }: { symbol?: string }) {
    // Start stream once; store is idempotent and keeps a single WS
    useEffect(() => {
        startTradesStream();
    }, []);

    const trades = useTrades((s) => s.getTrades(symbol));

    const formatTime = (ts?: number) =>
        ts
            ? new Date(ts).toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
              })
            : "-";

    return (
        <div className="overflow-y-auto overflow-x-auto h-full text-xs">
            <table className="min-w-full">
                <thead className="sticky top-0 bg-gray-900 text-gray-400">
                    <tr>
                        <th className="text-left px-2 py-1">Price</th>
                        <th className="text-right px-2 py-1">Amount</th>
                        <th className="text-right px-2 py-1">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {trades.map((t, idx) => (
                        <tr key={idx} className="text-right text-gray-200 whitespace-nowrap">
                            <td className={`text-left px-2 py-1 ${t.maker.side === "BUY" ? "text-green-600" : "text-red-600"}`}>{t.price}</td>
                            <td className="text-right px-2 py-1 text-chart">{t.qty}</td>
                            <td className="text-right px-2 py-1 text-chart">{formatTime(t.timestamp)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
