import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Supported intervals – keep in sync with TradeChart INTERVALS
const ALLOWED_INTERVALS = ["1s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1mo"] as const;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const interval = (searchParams.get("interval") || "1m").trim();

    if (!ALLOWED_INTERVALS.some((iv) => iv === interval)) {
        return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
    }

    // Build absolute path to mock JSON file inside fe/api/mock/klines
    const filePath = path.join(process.cwd(), "src", "app", "api", "mock", "klines", `BTC:USDT_${interval}.json`);

    try {
        const fileContents = await fs.readFile(filePath, "utf-8");
        const jsonData = JSON.parse(fileContents);
        return NextResponse.json(jsonData);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }
}
