import { NextResponse } from "next/server";
import { getVAPIDPublicKey } from "@/lib/push";
import { logError, jsonError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const publicKey = getVAPIDPublicKey();
    if (!publicKey) return jsonError("VAPID keys not configured", 500);
    return NextResponse.json({ publicKey });
  } catch (error) {
    logError("notifications_public-key_GET", error);
    return jsonError("Failed to get public key", 500);
  }
}
