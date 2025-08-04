"use client";

import { useState } from "react";

export default function TradePanel() {
    const [orderType, setOrderType] = useState<"Market" | "Limit">("Market");
    const [amount, setAmount] = useState<string>("");

    // TODO: Replace with real balance logic
    const fakeMaxAmount = 1.0; // placeholder max amount

    const quickAmounts: { label: string; value: number }[] = [
        { label: "10%", value: 0.1 },
        { label: "25%", value: 0.25 },
        { label: "50%", value: 0.5 },
        { label: "MAX", value: 1 },
    ];

    const handleQuickAmount = (ratio: number) => {
        setAmount((fakeMaxAmount * ratio).toString());
    };

    return (
        <div className="flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Trade Panel</h2>

            {/* Order type toggle */}
            <div className="flex space-x-4 mb-3">
                {(["Market", "Limit"] as const).map((type) => (
                    <button key={type} onClick={() => setOrderType(type)} className={`px-3 py-1 text-sm font-medium rounded transition-colors focus:outline-none ${orderType === type ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700"}`}>
                        {type}
                    </button>
                ))}
            </div>

            {/* Inputs */}
            <div className="space-y-2 mb-4 text-sm">
                <div className="flex flex-col">
                    <label htmlFor="amount" className="text-xs text-gray-600 mb-1">
                        Amount
                    </label>
                    <input id="amount" type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300" />

                    {/* Quick amount buttons */}
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {quickAmounts.map((qa) => (
                            <button key={qa.label} type="button" onClick={() => handleQuickAmount(qa.value)} className="w-full py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                                {qa.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="price" className="text-xs text-gray-600 mb-1">
                        Price
                    </label>
                    <input id="price" type="number" placeholder="0.0" className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300" />
                </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
                <button className="py-2 rounded bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors">Buy</button>
                <button className="py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">Sell</button>
            </div>
        </div>
    );
}
