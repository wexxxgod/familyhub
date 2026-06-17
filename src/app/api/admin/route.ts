import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireRole("SUPER_ADMIN", "PARENT");
    if (!user.familyId) return NextResponse.json({ error: "Нет семьи" }, { status: 400 });

    const familyFilter = { familyId: user.familyId };

    const stats = {
      users: await prisma.user.count({ where: familyFilter }),
      posts: await prisma.post.count({ where: { author: familyFilter } }),
      comments: await prisma.comment.count({ where: { author: familyFilter } }),
      likes: await prisma.like.count({ where: { user: familyFilter } }),
      archiveItems: await prisma.archiveItem.count({ where: { uploadedBy: familyFilter } }),
      events: await prisma.event.count({ where: { createdBy: familyFilter } }),
      memories: await prisma.memory.count({ where: { author: familyFilter } }),
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
