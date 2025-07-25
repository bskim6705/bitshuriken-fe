"use client";

import { useEffect, useRef, useState } from "react";
// Using v5 API of lightweight-charts
import { createChart, CandlestickSeries, HistogramSeries } from "lightweight-charts";
// minimal structural type to access setStretchFactor without relying on generics
type PaneWithStretch = { setStretchFactor?: (factor: number) => void };

// Raw kline array type as provided by backend (see README for details)
// [ openTime, open, high, low, close, volume, closeTime, quoteAssetVol, trades, buyBaseVol, buyQuoteVol, ignore ]
export type RawKline = [number, string, string, string, string, string, number, string, number, string, string, string];

// Temporary stub data – will be replaced by real data fetched from backend
const SAMPLE_DATA: RawKline[] = [[1499040000000, "0.01634790", "0.80000000", "0.01575800", "0.01577100", "148976.11427815", 1499644799999, "2434.19055334", 308, "1756.87402397", "28.46694368", "0"]];

// Supported intervals for mock klines – must match file names inside /api/mock/klines
const INTERVALS = ["1s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1mo"] as const;

type Interval = (typeof INTERVALS)[number];

/**
 * Convert raw kline data coming from backend → lightweight-charts format.
 */
function transformData(raw: RawKline[]) {
    return raw.map((k) => ({
        // lightweight-charts expects Unix timestamp in seconds
        time: k[0] / 1000,
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
    }));
}

function transformVolumeData(raw: RawKline[]) {
    return raw.map((k) => {
        const open = parseFloat(k[1]);
        const close = parseFloat(k[4]);
        const up = close >= open;
        return {
            time: k[0] / 1000,
            value: parseFloat(k[5]),
            color: up ? "#26a69a" : "#ef5350",
        };
    });
}

export default function TradeChart() {
    const containerRef = useRef<HTMLDivElement>(null);

    // UI state – current selected interval
    const [interval, setInterval] = useState<Interval>("1m");

    // Fetched kline data (raw format coming from backend)
    const [rawData, setRawData] = useState<RawKline[]>(SAMPLE_DATA);

    // Fetch klines whenever interval changes
    useEffect(() => {
        let cancelled = false;
        async function fetchKlines() {
            try {
                const res = await fetch(`/api/mock/klines?interval=${interval}`);
                if (!res.ok) throw new Error(`Failed to fetch klines: ${res.status}`);
                const json = (await res.json()) as RawKline[];
                if (!cancelled) {
                    setRawData(json);
                }
            } catch (e) {
                // In case of error, keep sample data (no-op)
                console.error(e);
            }
        }
        fetchKlines();
        return () => {
            cancelled = true;
        };
    }, [interval]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Initial chart dimensions use the container size
        const chart = createChart(container, {
            width: container.clientWidth,
            height: container.clientHeight || 300,
            layout: {
                textColor: "#d1d4dc",
                background: { type: "solid", color: "transparent" },
            },
            grid: {
                vertLines: { color: "#2f3b50" },
                horzLines: { color: "#2f3b50" },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            attributionLogo: { visible: false },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries);
        candlestickSeries.setData(transformData(rawData));

        // Volume histogram in second pane (pane index 1)
        const volumeSeries = chart.addSeries(
            HistogramSeries,
            {
                priceFormat: { type: "volume" },
            },
            1 // paneIndex; creates pane if missing
        );
        volumeSeries.setData(transformVolumeData(rawData));

        // Make volume pane shorter
        const panes = chart.panes();
        const volumePane = panes[1] as PaneWithStretch | undefined;
        volumePane?.setStretchFactor?.(0.3);

        // Responsiveness
        const handleResize = () => {
            chart.applyOptions({ width: container.clientWidth });
        };
        window.addEventListener("resize", handleResize);

        // Cleanup when component unmounts
        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [rawData]);

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-2">Chart</h2>

            {/* Interval selector */}
            <div className="mb-3 flex flex-wrap gap-3 text-sm select-none">
                {INTERVALS.map((iv) => (
                    <button key={iv} onClick={() => setInterval(iv)} className={`transition-colors focus:outline-none ${interval === iv ? "font-bold text-indigo-500" : "text-gray-400 hover:text-indigo-300"}`}>
                        {iv}
                    </button>
                ))}
            </div>

            {/* Chart gets rendered into this div */}
            <div ref={containerRef} className="flex-1" />
        </div>
    );
}
