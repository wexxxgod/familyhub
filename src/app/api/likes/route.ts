import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";
import { notifyUser } from "@/lib/push";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

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
      await notifyUser(post.authorId, {
        title: "Новый лайк ❤️",
        body: `${user.name || "Кто-то"} оценил ваш пост`,
        link: "/feed",
      });
    }

    return NextResponse.json({ liked: true });
  } catch (error) {
    logError("likes_POST", error);
    return jsonError("Failed to toggle like", 500);
  }
}
