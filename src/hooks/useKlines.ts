import { useEffect, useMemo, useState } from "react";
import type { Kline } from "@/types";

/**
 * Supported time intervals for kline aggregation.
 */
export const INTERVALS = ["1s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1mo"] as const;

export type Interval = (typeof INTERVALS)[number];

function intervalMs(iv: Interval): number {
    const m = iv.match(/^(\d+)(s|m|h|d|w|mo)$/i);
    if (!m) return 60_000; // default 1m
    const n = Number(m[1]);
    const unit = m[2].toLowerCase();
    switch (unit) {
        case "s":
            return n * 1000;
        case "m":
            return n * 60_000;
        case "h":
            return n * 60 * 60_000;
        case "d":
            return n * 24 * 60 * 60_000;
        case "w":
            return n * 7 * 24 * 60 * 60_000;
        case "mo":
            return n * 30 * 24 * 60 * 60_000;
        default:
            return 60_000;
    }
}

/**
 * Aggregate 1s kline objects into the selected interval on the client.
 */
function aggregateToInterval(rawSeconds: Kline[], iv: Interval): Kline[] {
    if (iv === "1s") return rawSeconds;
    const bucketSize = intervalMs(iv);
    const buckets = new Map<number, Kline>();
    for (const k of rawSeconds) {
        const b = Math.floor(k.openTime / bucketSize) * bucketSize;
        const existing = buckets.get(b);
        if (!existing) {
            buckets.set(b, {
                openTime: b,
                open: k.open,
                high: k.high,
                low: k.low,
                close: k.close,
                volume: k.volume,
                closeTime: b + bucketSize - 1,
            });
        } else {
            const high = Math.max(parseFloat(existing.high), parseFloat(k.high)).toString();
            const low = Math.min(parseFloat(existing.low), parseFloat(k.low)).toString();
            const close = k.close;
            const volume = (parseFloat(existing.volume) + parseFloat(k.volume)).toString();
            buckets.set(b, {
                openTime: existing.openTime,
                open: existing.open,
                high,
                low,
                close,
                volume,
                closeTime: existing.closeTime,
            });
        }
    }
    return Array.from(buckets.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, v]) => v);
}

/**
 * Hook that provides aggregated klines and manages REST fetch + WS live updates.
 * This keeps the chart component focused purely on rendering.
 */
export function useKlines(symbol: string) {
    const [interval, setInterval] = useState<Interval>("1m");
    const [klines, setKlines] = useState<Kline[]>([]);

    // Fetch historical klines (1s granularity from backend) and aggregate
    useEffect(() => {
        let cancelled = false;
        async function fetchKlines() {
            try {
                const base = process.env.NEXT_PUBLIC_API_URL ?? "localhost:3001";
                const url = `http://${base}/kline/klines?symbol=${symbol}&interval=${interval}&limit=500`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to fetch klines: ${res.status}`);
                const json = (await res.json()) as Kline[];
                if (!cancelled) {
                    setKlines(aggregateToInterval(json, interval));
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetchKlines();
        return () => {
            cancelled = true;
        };
    }, [symbol, interval]);

    // Live updates from trades WS for the current interval
    useEffect(() => {
        const ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_API_URL ?? "localhost:3001"}/trades`);
        const bucketSize = intervalMs(interval);
        const bucket = (ts: number) => Math.floor(ts / bucketSize) * bucketSize;

        ws.onmessage = (event) => {
            try {
                const t = JSON.parse(event.data) as {
                    symbol: string;
                    price: string | number;
                    qty: string | number;
                    timestamp?: number;
                };
                if (t.symbol !== symbol) return;
                const price = typeof t.price === "string" ? parseFloat(t.price) : t.price;
                const qty = typeof t.qty === "string" ? parseFloat(t.qty) : t.qty;
                const ts = t.timestamp ?? Date.now();
                const bOpen = bucket(ts);
                const bClose = bOpen + bucketSize - 1;

                setKlines((prev) => {
                    if (prev.length === 0) {
                        return [
                            {
                                openTime: bOpen,
                                open: price.toString(),
                                high: price.toString(),
                                low: price.toString(),
                                close: price.toString(),
                                volume: qty.toString(),
                                closeTime: bClose,
                            },
                        ];
                    }
                    const last = prev[prev.length - 1];
                    if (last.openTime === bOpen) {
                        const high = Math.max(parseFloat(last.high), price).toString();
                        const low = Math.min(parseFloat(last.low), price).toString();
                        const close = price.toString();
                        const volume = (parseFloat(last.volume) + qty).toString();
                        const updated: Kline = { openTime: last.openTime, open: last.open, high, low, close, volume, closeTime: bClose };
                        return [...prev.slice(0, -1), updated];
                    }
                    // next bucket
                    return [...prev, { openTime: bOpen, open: last.close, high: price.toString(), low: price.toString(), close: price.toString(), volume: qty.toString(), closeTime: bClose }];
                });
            } catch {
                // ignore malformed payloads
            }
        };

        return () => ws.close();
    }, [symbol, interval]);

    return useMemo(() => ({ klines, interval, setInterval, intervals: INTERVALS }), [klines, interval]);
}
