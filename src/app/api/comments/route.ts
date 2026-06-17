import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId, content } = await req.json();

    const comment = await prisma.comment.create({
      data: { content, postId, authorId: user.id },
      include: { author: true },
    });

    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
