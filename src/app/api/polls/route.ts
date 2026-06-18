import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    if (!user.familyId) return NextResponse.json([]);

    const polls = await prisma.poll.findMany({
      where: { author: { familyId: user.familyId } },
      include: { votes: true, author: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(polls);
  } catch (error) {
    logError("polls_GET", error);
    return jsonError("Failed to fetch polls", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
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
  } catch (error) {
    logError("polls_POST", error);
    return jsonError("Failed to create poll", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const { id } = await req.json();
    const poll = await prisma.poll.findUnique({ where: { id } });
    if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (poll.authorId !== user.id && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.poll.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("polls_DELETE", error);
    return jsonError("Failed to delete poll", 500);
  }
}
