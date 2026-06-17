import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN", "PARENT");

    const stats = {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      comments: await prisma.comment.count(),
      likes: await prisma.like.count(),
      archiveItems: await prisma.archiveItem.count(),
      messages: await prisma.message.count(),
      events: await prisma.event.count(),
      memories: await prisma.memory.count(),
    };

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole("SUPER_ADMIN");
    const { action, data } = await req.json();

    if (action === "delete_user") {
      await prisma.user.delete({ where: { id: data.userId } });
      return NextResponse.json({ success: true });
    }

    if (action === "change_role") {
      await prisma.user.update({
        where: { id: data.userId },
        data: { role: data.role },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
