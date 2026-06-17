import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const memories = await prisma.memory.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(memories);
  } catch {
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const memory = await prisma.memory.create({
      data: {
        title: data.title,
        content: data.content,
        image: data.image,
        year: data.year ? parseInt(data.year) : null,
        authorId: user.id,
      },
    });
    return NextResponse.json(memory);
  } catch {
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    const memory = await prisma.memory.findUnique({ where: { id } });
    if (!memory) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (memory.authorId !== user.id && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.memory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
