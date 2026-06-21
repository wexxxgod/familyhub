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

    const parsed = messages.map((m) => ({
      ...m,
      file: m.file ? JSON.parse(m.file) : null,
    }));

    return NextResponse.json(parsed);
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

    const { content, image, file, fileName, fileType } = await req.json();

    if (!content?.trim() && !image && !file) {
      return NextResponse.json({ error: "Сообщение не может быть пустым" }, { status: 400 });
    }

    const cleanFileType = fileType ? fileType.split(";")[0].trim().toLowerCase() : "application/octet-stream";

    const message = await prisma.message.create({
      data: {
        content: content?.trim() || "",
        image: image || null,
        file: file ? JSON.stringify({ url: file, name: fileName || "file", type: cleanFileType }) : null,
        senderId: user.id,
      },
      include: { sender: true },
    });

    const parsed = message.file ? { ...message, file: JSON.parse(message.file) } : message;

    return NextResponse.json(parsed);
  } catch (error) {
    logError("send_message", error);
    return jsonError("Failed to send message", 500);
  }
}
