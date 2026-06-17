import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.familyId) return NextResponse.json([]);

    const polls = await prisma.poll.findMany({
      where: { author: { familyId: user.familyId } },
      include: { votes: true, author: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(polls);
  } catch {
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const poll = await prisma.poll.create({
      data: {
        question: data.question,
        options: data.options,
        authorId: user.id,
      },
      include: { votes: true, author: true },
    });
    return NextResponse.json(poll);
  } catch {
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    const poll = await prisma.poll.findUnique({ where: { id } });
    if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (poll.authorId !== user.id && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.poll.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete poll" }, { status: 500 });
  }
}
