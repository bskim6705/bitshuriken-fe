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

    // Build absolute path to mock JSON file inside fe/api/mock/orderbook
    const filePath = path.join(process.cwd(), "src", "app", "api", "mock", "orderbook", `${symbol}.json`);

    try {
        const fileContents = await fs.readFile(filePath, "utf-8");
        const jsonData = JSON.parse(fileContents);

        // Slice asks and bids according to the requested limit (default 100)
        const slicedData = {
            ...jsonData,
            bids: Array.isArray(jsonData.bids) ? jsonData.bids.slice(0, limit) : [],
            asks: Array.isArray(jsonData.asks) ? jsonData.asks.slice(0, limit) : [],
        };

        return NextResponse.json(slicedData);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }
}
