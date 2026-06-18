import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const { endpoint, keys, userAgent } = await req.json();
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return jsonError("Invalid subscription", 400);
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth, userAgent: userAgent || null, userId: user.id },
      create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent: userAgent || null, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("push_subscribe_POST", error);
    return jsonError("Failed to subscribe", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const { endpoint } = await req.json();
    if (!endpoint) return jsonError("Missing endpoint", 400);

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("push_subscribe_DELETE", error);
    return jsonError("Failed to unsubscribe", 500);
  }
}
