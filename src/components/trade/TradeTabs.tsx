"use client";
import { useState } from "react";
import OpenOrders from "./OpenOrders";
import OrderHistory from "./OrderHistory";
import TradeHistory from "./TradeHistory";

const TABS = ["Open Orders", "Order History", "Trade History"] as const;

type Tab = (typeof TABS)[number];

export default function TradeTabs() {
    const [activeTab, setActiveTab] = useState<Tab>("Open Orders");

    const renderContent = () => {
        switch (activeTab) {
            case "Order History":
                return <OrderHistory />;
            case "Trade History":
                return <TradeHistory />;
            default:
                return <OpenOrders />;
        }
    };

    return (
        <div>
            <nav className="flex space-x-4 border-b mb-4">
                {TABS.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-sm font-medium focus:outline-none transition-colors ${activeTab === tab ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}>
                        {tab}
                    </button>
                ))}
            </nav>
            {renderContent()}
        </div>
    );
}
