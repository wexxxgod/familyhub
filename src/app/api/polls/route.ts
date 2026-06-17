import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const polls = await prisma.poll.findMany({
      include: { votes: true, author: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(polls);
  } catch {
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
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
