import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const cookieHeader = headers().get("cookie") || "(empty)";
  const envSecret = process.env.NEXTAUTH_SECRET ? "set" : "missing";

  const allHeaders: Record<string, string> = {};
  try {
    headers().forEach((value, key) => {
      allHeaders[key] = value;
    });
  } catch {}

  return NextResponse.json({
    envSecret,
    cookieHeader: cookieHeader.substring(0, 200),
    allHeaders,
  });
}
