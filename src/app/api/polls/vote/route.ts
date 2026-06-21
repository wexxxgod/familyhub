import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const { pollId, option } = await req.json();
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { author: { select: { familyId: true } } },
    });
    if (!poll) return NextResponse.json({ error: "Опрос не найден" }, { status: 404 });
    if (poll.author.familyId !== user.familyId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!poll.options.includes(option)) return NextResponse.json({ error: "Недопустимый вариант" }, { status: 400 });

    const existing = await prisma.pollVote.findUnique({
      where: { pollId_userId: { pollId, userId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Вы уже проголосовали" }, { status: 400 });
    }
    const vote = await prisma.pollVote.create({
      data: { option, pollId, userId: user.id },
    });
    return NextResponse.json(vote);
  } catch (error) {
    logError("polls_vote_POST", error);
    return jsonError("Failed to vote", 500);
  }
}
