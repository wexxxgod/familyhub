import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  } catch {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post.authorId !== user.id && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
