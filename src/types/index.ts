export interface Trade {
    symbol: string;
    price: number;
    qty: number;
    timestamp?: number;
    maker: { side: "BUY" | "SELL" };
}
