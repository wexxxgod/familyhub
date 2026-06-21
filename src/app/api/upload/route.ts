import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser, logError, jsonError } from "@/lib/auth-helpers";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/svg+xml",
  "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm", "audio/aac", "audio/flac",
  "video/mp4", "video/webm", "video/ogg", "video/quicktime",
  "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip", "application/x-rar-compressed", "application/x-7z-compressed",
  "text/plain", "text/csv",
];

const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

    let buffer = Buffer.from(await file.arrayBuffer());

    if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      try {
        const sharp = (await import("sharp")).default;
        const compressed = await sharp(buffer)
          .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        buffer = Buffer.from(compressed);
      } catch {}
    }

    const mimeType = file.type;
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ url: dataUrl, name: file.name, size: buffer.length });
  } catch (error) {
    logError("upload", error);
    return jsonError("Upload failed", 500);
  }
}
