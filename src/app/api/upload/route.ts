import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url: dataUrl, name: file.name, size: file.size });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
