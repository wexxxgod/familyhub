import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ status: "ok", users: count, db: process.env.DATABASE_URL?.slice(0, 40) + "..." });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e?.message || String(e) }, { status: 500 });
  }
}
