import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    }

    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (comment.authorId !== user.id && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
