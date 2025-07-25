"use client";

import { useEffect, useState } from "react";

interface RecentTrade {
    id: number;
    price: string;
    qty: string;
    time: number;
    isBuyerMaker: boolean; // true → sell (red), false → buy (green)
}

export default function RecentTrades() {
    const [trades, setTrades] = useState<RecentTrade[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;
        async function fetchTrades() {
            try {
                const res = await fetch("/api/mock/recentTrades?symbol=BTC:USDT&limit=1000", { cache: "no-cache" });
                if (!res.ok) throw new Error(`Failed to fetch recent trades: ${res.status}`);
                const data = (await res.json()) as RecentTrade[];
                if (!cancelled) setTrades(data);
            } catch (err) {
                console.error("Failed to load recent trades", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchTrades();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-2">Recent Trades</h2>
            {loading ? (
                <div className="text-gray-500 text-sm flex-1 flex items-center justify-center">Loading...</div>
            ) : (
                <div className="max-h-40 overflow-y-auto text-xs font-mono">
                    <div className="grid grid-cols-3 gap-1 text-gray-500 pb-1 border-b border-gray-200 sticky top-0 bg-gray-50">
                        <span className="text-right">Price (USDT)</span>
                        <span className="text-right">Qty (BTC)</span>
                        <span className="text-right">Time</span>
                    </div>
                    {trades.map((t) => (
                        <div key={t.id} className="grid grid-cols-3 gap-1 py-px">
                            <span className={`text-right ${t.isBuyerMaker ? "text-red-600" : "text-green-600"}`}>{parseFloat(t.price).toLocaleString()}</span>
                            <span className="text-right">{parseFloat(t.qty).toFixed(6)}</span>
                            <span className="text-right text-gray-500">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
