import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const items = await prisma.archiveItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch archive" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const item = await prisma.archiveItem.create({
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        category: data.category,
        year: data.year ? parseInt(data.year) : null,
        tags: data.tags || [],
        uploadedById: user.id,
      },
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to create archive item" }, { status: 500 });
  }
}
