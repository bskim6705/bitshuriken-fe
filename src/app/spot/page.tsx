import OrderBook from "../../components/trade/OrderBook";
import TradeChart from "../../components/trade/TradeChart";
import TradePanel from "../../components/trade/TradePanel";
import RecentTrades from "../../components/trade/RecentTrades";
import TradeTabs from "../../components/trade/TradeTabs";

export default function TradePage() {
    return (
        <main className="flex min-h-screen flex-col">
            {/* Top Section */}
            <section className="flex flex-1 gap-4 border-b border-gray-200 p-4">
                {/* Order Book */}
                <div className="w-1/4 bg-gray-50 p-4 rounded shadow-sm flex flex-col">
                    <OrderBook />
                </div>

                {/* Chart */}
                <div className="flex-1 bg-gray-50 p-4 rounded shadow-sm flex flex-col">
                    <TradeChart />
                </div>

                {/* Right Column: Trade Panel + Recent Trades */}
                <div className="w-1/4 flex flex-col gap-4">
                    {/* Trade Panel */}
                    <div className="bg-gray-50 p-4 rounded shadow-sm flex-1 flex flex-col">
                        <TradePanel />
                    </div>

                    {/* Recent Trades */}
                    <div className="bg-gray-50 rounded shadow-sm h-48">
                        <RecentTrades />
                    </div>
                </div>
            </section>

            {/* Bottom Section (Tabbed) */}
            <section className="p-4 flex-none">
                <div className="bg-gray-50 p-4 rounded shadow-sm">
                    <TradeTabs />
                </div>
            </section>
        </main>
    );
}
