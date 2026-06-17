import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.familyId) return NextResponse.json([]);

    const members = await prisma.familyMember.findMany({
      where: { familyId: user.familyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(members);
  } catch {
    return NextResponse.json({ error: "Failed to fetch family tree" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.familyId) return NextResponse.json({ error: "Вы не в семье" }, { status: 400 });

    const data = await req.json();
    const member = await prisma.familyMember.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        parentId: data.parentId || null,
        familyId: user.familyId,
      },
    });

    return NextResponse.json(member);
  } catch {
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
