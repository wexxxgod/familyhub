import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, Role } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    if (!user.familyId) return NextResponse.json([]);

    const pets = await prisma.pet.findMany({
      where: { familyId: user.familyId },
      include: { owner: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pets);
  } catch (error) {
    logError("pets_GET", error);
    return jsonError("Failed to fetch pets", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    if (!user.familyId) return jsonError("Family not found", 400);

    const data = await req.json();
    const pet = await prisma.pet.create({
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        photo: data.photo || null,
        notes: data.notes || null,
        ownerId: user.id,
        familyId: user.familyId,
      },
    });
    return NextResponse.json(pet);
  } catch (error) {
    logError("pets_POST", error);
    return jsonError("Failed to create pet", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const { id } = await req.json();
    const pet = await prisma.pet.findUnique({ where: { id } });
    if (!pet) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (pet.ownerId !== user.id && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.pet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("pets_DELETE", error);
    return jsonError("Failed to delete pet", 500);
  }
}
