import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser, logError, jsonError } from "@/lib/auth-helpers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowedTypes.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

    let buffer = Buffer.from(await file.arrayBuffer());
    let ext = "jpg";

    if (file.type.startsWith("image/")) {
      try {
        const sharp = (await import("sharp")).default;
        const compressed = await sharp(buffer)
          .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        buffer = Buffer.from(compressed);
      } catch {}
    } else if (file.type === "application/pdf") {
      ext = "pdf";
    }

    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}`, name: file.name, size: buffer.length });
  } catch (error) {
    logError("upload", error);
    return jsonError("Upload failed", 500);
  }
}
