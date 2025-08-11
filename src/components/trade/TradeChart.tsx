"use client";

import { useEffect, useRef } from "react";
// Using v5 API of lightweight-charts
import { createChart, CandlestickSeries, HistogramSeries, ColorType, UTCTimestamp, LineStyle, ISeriesApi } from "lightweight-charts";
import { useKlines, INTERVALS } from "@/hooks/useKlines";
import type { Kline } from "@/types";
// minimal structural type to access setStretchFactor without relying on generics
type PaneWithStretch = { setStretchFactor?: (factor: number) => void };

/**
 * Kline object returned from backend.
 * All numeric price/volume fields are strings to preserve precision.
 */
// Kline type is imported from '@/types'

// intervals are imported from useKlines

/** Convert kline objects → lightweight-charts candlestick series data */
function transformData(raw: Kline[]) {
    return raw.map((k) => ({
        time: (k.openTime / 1000) as UTCTimestamp,
        open: parseFloat(k.open),
        high: parseFloat(k.high),
        low: parseFloat(k.low),
        close: parseFloat(k.close),
    }));
}

// Volume series data is prepared inside the effect to use current theme colors

// All data fetching and aggregation are handled by useKlines hook

export default function TradeChart({ symbol = "BTCUSDT" }: { symbol?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const themeRef = useRef({
        bg: "#000000",
        grid: "#1f1f1f",
        text: "#cbd5e1",
        up: "#26a69a",
        down: "#ef5350",
    });

    const { klines, interval, setInterval } = useKlines(symbol);

    // Initialize chart once
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Read theme colors from CSS variables (Tailwind v4 @theme)
        const root = getComputedStyle(document.documentElement);
        themeRef.current = {
            bg: (root.getPropertyValue("--color-chart-bg") || "#000000").trim(),
            grid: (root.getPropertyValue("--color-chart-grid") || "#1f1f1f").trim(),
            text: (root.getPropertyValue("--color-font-main") || "#cbd5e1").trim(),
            up: (root.getPropertyValue("--color-up") || "#26a69a").trim(),
            down: (root.getPropertyValue("--color-down") || "#ef5350").trim(),
        };

        const chart = createChart(container, {
            width: container.clientWidth,
            height: container.clientHeight || 300,
            layout: { textColor: themeRef.current.text, background: { type: ColorType.Solid, color: themeRef.current.bg } },
            grid: { vertLines: { color: themeRef.current.grid }, horzLines: { color: themeRef.current.grid } },
            timeScale: { timeVisible: true, secondsVisible: false },
        });
        chartRef.current = chart;

        const cSeries = chart.addSeries(CandlestickSeries, {
            upColor: themeRef.current.up,
            downColor: themeRef.current.down,
            borderUpColor: themeRef.current.up,
            borderDownColor: themeRef.current.down,
            wickUpColor: themeRef.current.up,
            wickDownColor: themeRef.current.down,
            priceLineVisible: true,
            priceLineColor: themeRef.current.text,
            priceLineWidth: 1,
            priceLineStyle: LineStyle.Dashed,
        });
        candleSeriesRef.current = cSeries;

        const vSeries = chart.addSeries(HistogramSeries, { priceFormat: { type: "volume" } }, 1);
        volumeSeriesRef.current = vSeries;

        // Make volume pane shorter
        const panes = chart.panes();
        const volumePane = panes[1] as PaneWithStretch | undefined;
        volumePane?.setStretchFactor?.(0.3);

        const handleResize = () => chart.applyOptions({ width: container.clientWidth });
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
            volumeSeriesRef.current = null;
        };
    }, []);

    // Update series data when rawData changes
    useEffect(() => {
        candleSeriesRef.current?.setData(transformData(klines));
        const vol = klines.map((k) => {
            const open = parseFloat(k.open);
            const close = parseFloat(k.close);
            const up = close >= open;
            return { time: (k.openTime / 1000) as UTCTimestamp, value: parseFloat(k.volume), color: up ? themeRef.current.up : themeRef.current.down };
        });
        volumeSeriesRef.current?.setData(vol as unknown as Parameters<typeof volumeSeriesRef.current.setData>[0]);

        // Update current price line color based on last candle direction (same logic as volume color)
        const last = klines[klines.length - 1];
        if (last && candleSeriesRef.current) {
            const open = parseFloat(last.open);
            const close = parseFloat(last.close);
            const up = close >= open;
            candleSeriesRef.current.applyOptions({ priceLineColor: up ? themeRef.current.up : themeRef.current.down });
        }
    }, [klines]);

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
