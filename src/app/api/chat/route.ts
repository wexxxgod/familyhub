import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    if (!user.familyId) return jsonError("Family not found", 404);

    const familyUserIds = await prisma.user.findMany({
      where: { familyId: user.familyId },
      select: { id: true },
    });

    const messages = await prisma.message.findMany({
      where: { senderId: { in: familyUserIds.map((u) => u.id) } },
      include: { sender: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    logError("get_messages", error);
    return jsonError("Failed to fetch messages", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    if (!user.familyId) return jsonError("Family not found", 404);

    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Сообщение не может быть пустым" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { content: content.trim(), senderId: user.id },
      include: { sender: true },
    });

    return NextResponse.json(message);
  } catch (error) {
    logError("send_message", error);
    return jsonError("Failed to send message", 500);
  }
}
