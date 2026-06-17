import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
    });
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        type: data.type || "CUSTOM",
        remindAt: data.remindAt ? new Date(data.remindAt) : null,
        createdById: user.id,
      },
    });
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
