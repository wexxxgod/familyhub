import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await req.json();

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    await prisma.like.create({ data: { postId, userId: user.id } });

    if (post && post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: "LIKE",
          title: "Новый лайк",
          message: `${user.name || "Кто-то"} оценил ваш пост`,
          link: "/feed",
          userId: post.authorId,
        },
      });
    }

    return NextResponse.json({ liked: true });
  } catch {
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
