import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";
import { notifyUser } from "@/lib/push";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const { postId, content } = await req.json();

    const comment = await prisma.comment.create({
      data: { content, postId, authorId: user.id },
      include: { author: true },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (post && post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          title: "Новый комментарий",
          message: `${user.name || "Кто-то"} прокомментировал ваш пост: ${content.slice(0, 50)}${content.length > 50 ? "..." : ""}`,
          link: "/feed",
          userId: post.authorId,
        },
      });
      await notifyUser(post.authorId, {
        title: "Новый комментарий 💬",
        body: `${user.name || "Кто-то"}: ${content.slice(0, 80)}`,
        link: "/feed",
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    logError("comments_POST", error);
    return jsonError("Failed to create comment", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const { id } = await req.json();
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (comment.authorId !== user.id && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("comments_DELETE", error);
    return jsonError("Failed to delete comment", 500);
  }
}
