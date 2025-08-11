import Link from "next/link";
import Image from "next/image";

export default function Home() {
    return (
        <div className="bg-app text-app">
            {/* Hero Section */}
            <section className="mx-auto max-w-7xl px-4 pt-16 pb-12">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-chart text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                            Paper Trade, <br />
                            Real Signals.
                        </h1>
                        <p className="text-chart/90 text-lg md:text-xl leading-relaxed max-w-2xl">Trade on a realistic simulation that mirrors live market dynamics. Configure fees, slippage, and execution latency — then validate your strategy in real time via our OpenAPI.</p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/spot" className="px-5 py-3 rounded-md bg-up text-black font-semibold text-sm md:text-base">
                                Start Spot
                            </Link>
                            <Link href="/futures" className="px-5 py-3 rounded-md border border-chart-grid text-chart hover:text-up text-sm md:text-base">
                                Explore Futures
                            </Link>
                            <Link href="/account" className="px-5 py-3 rounded-md border border-chart-grid text-chart hover:text-up text-sm md:text-base">
                                My Account
                            </Link>
                        </div>
                        <div className="mt-8 grid sm:grid-cols-3 gap-3 text-chart/80 text-sm">
                            <div className="rounded-md border border-chart-grid p-3">Live trades & orderbook feed</div>
                            <div className="rounded-md border border-chart-grid p-3">Fee & slippage tuning</div>
                            <div className="rounded-md border border-chart-grid p-3">Latency & fill simulation</div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-3 rounded-xl bg-[#26a69a]/10 blur-xl" />
                        <div className="relative rounded-xl overflow-hidden border border-chart-grid">
                            <Image src="/hero-paper.svg" alt="Paper trading hero" width={960} height={540} priority />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="mx-auto max-w-7xl px-4 pb-16">
                <h2 className="text-chart text-2xl md:text-3xl font-bold mb-6">Why BitShuriken Paper</h2>
                <div className="grid md:grid-cols-4 gap-4 text-chart">
                    <div className="bg-chart border border-chart-grid rounded-lg p-5">
                        <h3 className="font-semibold mb-2">Configurable Fees</h3>
                        <p className="text-chart/80 text-sm">Set maker/taker fees and stress-test PnL sensitivity.</p>
                    </div>
                    <div className="bg-chart border border-chart-grid rounded-lg p-5">
                        <h3 className="font-semibold mb-2">Realistic Slippage</h3>
                        <p className="text-chart/80 text-sm">Model slippage to emulate orderbook impact on fills.</p>
                    </div>
                    <div className="bg-chart border border-chart-grid rounded-lg p-5">
                        <h3 className="font-semibold mb-2">Latency Control</h3>
                        <p className="text-chart/80 text-sm">Simulate execution delays and verify robustness.</p>
                    </div>
                    <div className="bg-chart border border-chart-grid rounded-lg p-5">
                        <h3 className="font-semibold mb-2">OpenAPI Integration</h3>
                        <p className="text-chart/80 text-sm">Stream live trades and validate your strategy on the fly.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
