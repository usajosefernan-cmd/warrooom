import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export async function GET() {
  try {
    const db = readDB();
    const sortedLogs = [...db.ai_logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return NextResponse.json(sortedLogs);
  } catch (error) {
    console.error("Error reading AI logs:", error);
    return NextResponse.json({ error: "Error reading AI logs" }, { status: 500 });
  }
}
