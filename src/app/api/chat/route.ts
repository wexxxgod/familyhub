import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError } from "@/lib/auth-helpers";

const ALLOWED_TYPES_SET = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/svg+xml",
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg", "audio/mp4", "audio/webm", "audio/aac", "audio/flac", "audio/x-m4a", "audio/x-flac", "audio/3gpp", "audio/x-ms-wma",
  "video/mp4", "video/webm", "video/ogg", "video/quicktime",
  "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip", "application/x-rar-compressed", "application/x-7z-compressed",
  "text/plain", "text/csv",
]);

function normalizeMimeType(raw: string): string {
  return raw.split(";")[0].trim().toLowerCase();
}

const MAX_SIZE = 50 * 1024 * 1024;

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

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      return await handleFormDataPost(req, user);
    }

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

async function handleFormDataPost(req: NextRequest, user: { id: string; familyId: string | null }) {
  const formData = await req.formData();
  const content = (formData.get("content") as string) || "";
  const uploadedFile = formData.get("file") as File | null;

  if (!content.trim() && !uploadedFile) {
    return NextResponse.json({ error: "Сообщение не может быть пустым" }, { status: 400 });
  }

  if (!uploadedFile) {
    const message = await prisma.message.create({
      data: { content: content.trim(), senderId: user.id },
      include: { sender: true },
    });
    return NextResponse.json(message);
  }

  if (uploadedFile.size > MAX_SIZE)
    return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });

  const mimeType = normalizeMimeType(uploadedFile.type);
  if (!ALLOWED_TYPES_SET.has(mimeType))
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  let buffer = Buffer.from(await uploadedFile.arrayBuffer());
  let finalMime = mimeType;
  let isImage = mimeType.startsWith("image/");

  if (isImage && mimeType !== "image/svg+xml") {
    try {
      const sharp = (await import("sharp")).default;
      const compressed = await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      buffer = Buffer.from(compressed);
      finalMime = "image/jpeg";
    } catch {}
  }

  const base64 = buffer.toString("base64");
  const dataUrl = `data:${finalMime};base64,${base64}`;

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      image: isImage ? dataUrl : null,
      file: !isImage ? JSON.stringify({ url: dataUrl, name: uploadedFile.name, type: mimeType }) : null,
      senderId: user.id,
    },
    include: { sender: true },
  });

  const parsed = message.file ? { ...message, file: JSON.parse(message.file) } : message;
  // Не возвращаем base64 в POST-ответе — фронтенд использует локальный URL,
  // а реальные данные подтянутся через GET-опрос (лимит Vercel 4.5MB на ответ)
  if (parsed.image) parsed.image = "__pending__";
  if (parsed.file) parsed.file = { name: parsed.file.name, type: parsed.file.type, url: "__pending__" };
  return NextResponse.json(parsed);
}
