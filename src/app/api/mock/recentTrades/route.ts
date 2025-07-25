import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const symbol = (searchParams.get("symbol") || "BTC:USDT").trim();
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    if (isNaN(limit) || limit <= 0) {
        return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
    }

    // Build absolute path to mock JSON file inside fe/api/mock/recentTrades
    const filePath = path.join(process.cwd(), "src", "app", "api", "mock", "recentTrades", `${symbol}.json`);

    try {
        const fileContents = await fs.readFile(filePath, "utf-8");
        const trades = JSON.parse(fileContents);

        // Return the latest `limit` trades, newest first
        const slicedTrades = Array.isArray(trades) ? trades.slice(-limit).reverse() : [];

        return NextResponse.json(slicedTrades);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }
}
