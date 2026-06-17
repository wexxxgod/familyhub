import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.familyId) return NextResponse.json([]);

    const items = await prisma.archiveItem.findMany({
      where: { uploadedBy: { familyId: user.familyId } },
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

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    const item = await prisma.archiveItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.uploadedById !== user.id && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.archiveItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete archive item" }, { status: 500 });
  }
}
