import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    if (!user.familyId) return NextResponse.json([]);

    const items = await prisma.archiveItem.findMany({
      where: { uploadedBy: { familyId: user.familyId } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    logError("archive_GET", error);
    return jsonError("Failed to fetch archive", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const data = await req.json();
    const item = await prisma.archiveItem.create({
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        images: data.images || [],
        category: data.category,
        year: data.year ? safeInt(data.year) : null,
        tags: data.tags || [],
        uploadedById: user.id,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    logError("archive_POST", error);
    return jsonError("Failed to create archive item", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const data = await req.json();
    const item = await prisma.archiveItem.findUnique({ where: { id: data.id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.uploadedById !== user.id && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const updated = await prisma.archiveItem.update({
      where: { id: data.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.year !== undefined && { year: data.year ? safeInt(data.year) : null }),
        ...(data.tags !== undefined && { tags: data.tags }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    logError("archive_PATCH", error);
    return jsonError("Failed to update archive item", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const { id } = await req.json();
    const item = await prisma.archiveItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.uploadedById !== user.id && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.archiveItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("archive_DELETE", error);
    return jsonError("Failed to delete archive item", 500);
  }
}
