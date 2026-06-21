import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";
import { notifyUser } from "@/lib/push";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    if (!user.familyId) {
      return NextResponse.json([]);
    }

    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 50);

    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
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

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    return NextResponse.json({ posts, nextCursor: hasMore ? posts[posts.length - 1]?.id : null });
  } catch (error) {
    logError("posts_GET", error);
    return jsonError("Failed to fetch posts", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const { content, image, images, video, document, tags, visibility } = await req.json();

    const post = await prisma.post.create({
      data: {
        content,
        image,
        images: images || [],
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

    const familyMembers = await prisma.user.findMany({
      where: { familyId: user.familyId, id: { not: user.id } },
      select: { id: true },
    });

    const pushPromises: Promise<void>[] = [];
    for (const member of familyMembers) {
      await prisma.notification.create({
        data: {
          type: "POST",
          title: "Новый пост",
          message: `${user.name || "Кто-то"} опубликовал новый пост: ${(content || "").slice(0, 50)}${(content || "").length > 50 ? "..." : ""}`,
          link: "/feed",
          userId: member.id,
        },
      });
      pushPromises.push(
        notifyUser(member.id, {
          title: `Новый пост от ${user.name || "FamilyHub"} 📝`,
          body: (content || "Без текста").slice(0, 120),
          link: "/feed",
        }),
      );
    }
    await Promise.allSettled(pushPromises);

    return NextResponse.json(post);
  } catch (error) {
    logError("posts_POST", error);
    return jsonError("Failed to create post", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const { id, content, tags, images } = await req.json();
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post.authorId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        ...(images !== undefined && { images }),
      },
      include: { author: true, comments: { include: { author: true } }, likes: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    logError("posts_PATCH", error);
    return jsonError("Failed to update post", 500);
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
