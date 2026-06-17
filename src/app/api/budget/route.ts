import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const entries = await prisma.budgetEntry.findMany({
      orderBy: { date: "desc" },
      take: 100,
    });
    const goals = await prisma.budgetGoal.findMany();
    return NextResponse.json({ entries, goals });
  } catch {
    return NextResponse.json({ error: "Failed to fetch budget" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const entry = await prisma.budgetEntry.create({
      data: {
        title: data.title,
        amount: data.amount,
        type: data.type || "expense",
        category: data.category || "Прочее",
        description: data.description,
        authorId: user.id,
      },
    });
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}
