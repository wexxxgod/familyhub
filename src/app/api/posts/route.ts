import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    if (!user.familyId) {
      return NextResponse.json([]);
    }

    const posts = await prisma.post.findMany({
      where: {
        author: { familyId: user.familyId },
      },
      include: {
        author: true,
        comments: { include: { author: true } },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    logError("posts_GET", error);
    return jsonError("Failed to fetch posts", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const { content, image, video, document, tags, visibility } = await req.json();

    const post = await prisma.post.create({
      data: {
        content,
        image,
        video,
        document,
        tags: tags || [],
        visibility: visibility || "FAMILY_ONLY",
        authorId: user.id,
      },
      include: { author: true, comments: true, likes: true },
    });

    await prisma.activityLog.create({
      data: { action: "CREATE_POST", details: `Post created by ${user.name}`, userId: user.id },
    });

    return NextResponse.json(post);
  } catch (error) {
    logError("posts_POST", error);
    return jsonError("Failed to create post", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const { id } = await req.json();
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post.authorId !== user.id && user.role !== Role.SUPER_ADMIN && user.role !== Role.PARENT) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("posts_DELETE", error);
    return jsonError("Failed to delete post", 500);
  }
}
