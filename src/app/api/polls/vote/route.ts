import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { pollId, option } = await req.json();
    const existing = await prisma.pollVote.findUnique({
      where: { pollId_userId: { pollId, userId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 });
    }
    const vote = await prisma.pollVote.create({
      data: { option, pollId, userId: user.id },
    });
    return NextResponse.json(vote);
  } catch {
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
