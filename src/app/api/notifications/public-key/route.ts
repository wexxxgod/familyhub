import { NextResponse } from "next/server";
import { getVAPIDPublicKey } from "@/lib/push";

export async function GET() {
  return NextResponse.json({ publicKey: getVAPIDPublicKey() });
}
