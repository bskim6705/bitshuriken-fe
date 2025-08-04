"use client";

import { useEffect, useState } from "react";
import { Trade } from "@/types";

/**
 * Real-time trade history table.
 * Subscribes to the backend WebSocket and renders the latest trades (max 100).
 */
export default function RecentTrades() {
    const [trades, setTrades] = useState<Trade[]>([]);

    useEffect(() => {
        const socket = new WebSocket(`ws://${process.env.NEXT_PUBLIC_API_URL ?? "localhost:3001"}/trades`);

        socket.onmessage = (event) => {
            try {
                const trade: Trade = JSON.parse(event.data);
                setTrades((prev) => {
                    const next = [trade, ...prev];
                    // Keep only the most recent 100 entries to avoid unbounded growth
                    return next.slice(0, 100);
                });
            } catch {
                console.warn("[RecentTrades] Invalid trade payload", event.data);
            }
        };

        socket.onerror = () => {
            console.error("[RecentTrades] WebSocket error");
        };

        return () => {
            socket.close();
        };
    }, []);

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
                        <th className="px-2 py-1">Price</th>
                        <th className="px-2 py-1">Amount</th>
                        <th className="px-2 py-1">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {trades.map((t, idx) => (
                        <tr key={idx} className="text-right text-gray-200 whitespace-nowrap">
                            <td className={`px-2 py-1 ${t.maker.side === "BUY" ? "text-green-600" : "text-red-600"}`}>{t.price}</td>
                            <td className="px-2 py-1 text-black">{t.qty}</td>
                            <td className="px-2 py-1 text-black">{formatTime(t.timestamp)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
