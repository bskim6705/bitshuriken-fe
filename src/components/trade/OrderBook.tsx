"use client";

import { useEffect, useState } from "react";

interface OrderLevel {
    price: string;
    size: string;
}

export default function OrderBook() {
    const [asks, setAsks] = useState<OrderLevel[]>([]);
    const [bids, setBids] = useState<OrderLevel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchOrderBook() {
            try {
                const res = await fetch("/api/mock/orderbook?symbol=BTC:USDT&limit=15", { cache: "no-cache" });
                const data = await res.json();
                if (data.asks && data.bids) {
                    // Convert to typed structure
                    setAsks(
                        data.asks.map((item: string[]) => ({
                            price: item[0],
                            size: item[1],
                        }))
                    );
                    setBids(
                        data.bids.map((item: string[]) => ({
                            price: item[0],
                            size: item[1],
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to load orderbook", err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrderBook();
    }, []);

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-2">Order Book</h2>
            {loading ? (
                <div className="text-gray-500 text-sm flex-1 flex items-center justify-center">Loading...</div>
            ) : (
                <div className="flex-1 flex flex-col text-xs font-mono overflow-auto">
                    <div className="grid grid-cols-3 gap-1 text-gray-500 pb-1 border-b border-gray-200 sticky top-0 bg-gray-50">
                        <span className="text-right">Price (USDT)</span>
                        <span className="text-right">Size (BTC)</span>
                        <span className="text-right">Total</span>
                    </div>

                    {/*
                     * Asks (sell orders)
                     * Row spacing is controlled via Tailwind `py-*` utility below.
                     * Adjust here if you need finer vertical spacing tweaks later.
                     */}
                    {asks
                        .slice()
                        .reverse()
                        .map((level, idx) => {
                            const total = asks
                                .slice()
                                .reverse()
                                .slice(0, idx + 1)
                                .reduce((acc, l) => acc + parseFloat(l.size), 0);
                            return (
                                <div key={`ask-${idx}`} className="grid grid-cols-3 gap-1 py-px text-red-600">
                                    <span className="text-right">{parseFloat(level.price).toLocaleString()}</span>
                                    <span className="text-right">{parseFloat(level.size).toFixed(3)}</span>
                                    <span className="text-right">{total.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
                                </div>
                            );
                        })}

                    {/*
                     * Bids (buy orders)
                     * Same row spacing adjustment as asks.
                     */}
                    {bids.map((level, idx) => {
                        const total = bids.slice(0, idx + 1).reduce((acc, l) => acc + parseFloat(l.size), 0);
                        return (
                            <div key={`bid-${idx}`} className="grid grid-cols-3 gap-1 py-px text-green-600">
                                <span className="text-right">{parseFloat(level.price).toLocaleString()}</span>
                                <span className="text-right">{parseFloat(level.size).toFixed(3)}</span>
                                <span className="text-right">{total.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
