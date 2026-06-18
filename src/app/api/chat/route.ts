import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: { sender: true, receiver: true },
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

    const { content, receiverId, chatRoomId } = await req.json();

    if (receiverId) {
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { familyId: true },
      });
      if (!receiver || receiver.familyId !== user.familyId) {
        return NextResponse.json({ error: "Нельзя отправить сообщение пользователю из другой семьи" }, { status: 403 });
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId,
        chatRoomId,
      },
      include: { sender: true },
    });

    return NextResponse.json(message);
  } catch (error) {
    logError("send_message", error);
    return jsonError("Failed to send message", 500);
  }
}
