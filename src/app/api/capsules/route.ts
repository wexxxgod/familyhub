import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const capsules = await prisma.timeCapsule.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(capsules);
  } catch {
    return NextResponse.json({ error: "Failed to fetch capsules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const capsule = await prisma.timeCapsule.create({
      data: {
        title: data.title,
        message: data.message,
        openDate: new Date(data.openDate),
        authorId: user.id,
      },
    });
    return NextResponse.json(capsule);
  } catch {
    return NextResponse.json({ error: "Failed to create capsule" }, { status: 500 });
  }
}
