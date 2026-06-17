import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        bio: data.bio,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        image: data.image,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const [profile, posts, comments, likesAgg] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true, name: true, email: true, image: true,
          role: true, bio: true, phone: true, dateOfBirth: true, createdAt: true,
        },
      }),
      prisma.post.count({ where: { authorId: user.id } }),
      prisma.comment.count({ where: { authorId: user.id } }),
      prisma.like.count({ where: { userId: user.id } }),
    ]);
    return NextResponse.json({ ...profile, stats: { posts, comments, likes: likesAgg } });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
