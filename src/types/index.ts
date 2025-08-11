export interface Trade {
    symbol: string;
    price: number;
    qty: number;
    timestamp?: number;
    maker: { side: "BUY" | "SELL" };
}

/**
 * Candlestick (OHLCV) data point returned from backend.
 * Prices and volume are strings to avoid precision loss in JS.
 */
export interface Kline {
    /** Start time of the candle in milliseconds since epoch */
    openTime: number;
    /** Open price as string */
    open: string;
    /** High price as string */
    high: string;
    /** Low price as string */
    low: string;
    /** Close price as string */
    close: string;
    /** Base asset volume as string */
    volume: string;
    /** End time of the candle in milliseconds since epoch */
    closeTime: number;
}
