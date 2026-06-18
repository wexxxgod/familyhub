import { NextResponse } from "next/server";

export async function GET() {
  const spki = Buffer.from(process.env.VAPID_PUBLIC_KEY!, "base64url");
  const raw = spki.subarray(spki.length - 65);
  const publicKey = raw.toString("base64");
  return NextResponse.json({ publicKey });
}
