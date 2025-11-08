import OrderBook from '@/components/trade/OrderBook';
import TradeChart from '@/components/trade/TradeChart';
import TradePanel from '@/components/trade/TradePanel';
import RecentTrades from '@/components/trade/RecentTrades';
import TradeTabs from '@/components/trade/TradeTabs';
import MarketTicker from '@/components/trade/MarketTicker';

type Props = { params: { symbol?: string } };

export default async function SpotSymbolPage({ params }: Props) {
    const { symbol: raw } = await params;
    const symbol = (raw ?? 'BTCUSDT').toUpperCase();
    return (
        <main className="min-h-screen flex flex-col p-3">
            {/* 위/아래 분리: 아래는 TradeTabs, 위 영역은 고정 높이 */}
            <section className="flex-none h-[90vh] flex flex-row gap-3 min-h-0">
                {/* 왼쪽 영역 */}
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                    {/* MarketTicker */}
                    <div>
                        <MarketTicker symbol={symbol} />
                    </div>
                    {/* 같은 줄: OrderBook | TradeChart */}
                    <div className="flex gap-3 min-h-0 flex-1 overflow-hidden">
                        <div className="w-[30%] p-3 rounded border border-surface-grid bg-surface text-chart h-full min-h-0 flex flex-col">
                            <OrderBook />
                        </div>
                        <div className="flex-1 p-3 rounded border border-surface-grid bg-surface text-chart min-h-0 flex flex-col overflow-hidden">
                            <TradeChart symbol={symbol} />
                        </div>
                    </div>
                </div>

                {/* 오른쪽 영역 w-[22.5%] */}
                <div className="w-[22.5%] flex flex-col gap-3 min-h-0">
                    {/* TradePanel */}
                    <div className="p-3 rounded border border-surface-grid bg-surface text-chart">
                        <TradePanel />
                    </div>
                    {/* 남는 공간 RecentTrades */}
                    <div className="flex-1 min-h-0 p-3 rounded border border-surface-grid bg-surface text-chart overflow-hidden">
                        <RecentTrades symbol={symbol} />
                    </div>
                </div>
            </section>

            {/* 하단 TradeTabs */}
            <section className="flex-none mt-3">
                <div className="p-3 rounded border border-surface-grid bg-surface text-chart min-h-100">
                    <TradeTabs />
                </div>
            </section>
        </main>
    );
}
