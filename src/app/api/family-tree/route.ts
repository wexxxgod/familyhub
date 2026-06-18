import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    if (!user.familyId) return NextResponse.json([]);

    const members = await prisma.familyMember.findMany({
      where: { familyId: user.familyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    logError("family_tree_GET", error);
    return jsonError("Failed to fetch family tree", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    if (!user.familyId) return NextResponse.json({ error: "Вы не в семье" }, { status: 400 });

    const data = await req.json();
    const member = await prisma.familyMember.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        dateOfBirth: data.dateOfBirth ? safeDate(data.dateOfBirth) : null,
        parentId: data.parentId || null,
        familyId: user.familyId,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    logError("family_tree_POST", error);
    return jsonError("Failed to create member", 500);
  }
}
