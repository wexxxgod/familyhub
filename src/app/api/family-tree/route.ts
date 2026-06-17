import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const members = await prisma.familyMember.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(members);
  } catch {
    return NextResponse.json({ error: "Failed to fetch family tree" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const member = await prisma.familyMember.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        parentId: data.parentId || null,
      },
    });

    return NextResponse.json(member);
  } catch {
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
