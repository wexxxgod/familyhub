import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const petId = searchParams.get("petId");
    if (!petId) return jsonError("petId required", 400);

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.familyId !== user.familyId) return jsonError("Not found", 404);

    const photos = await prisma.petPhoto.findMany({
      where: { petId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(photos);
  } catch (error) {
    logError("pet_photos_GET", error);
    return jsonError("Failed to fetch photos", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const data = await req.json();
    if (!data.petId || !data.url) return jsonError("petId and url required", 400);

    const pet = await prisma.pet.findUnique({ where: { id: data.petId } });
    if (!pet || pet.familyId !== user.familyId) return jsonError("Not found", 404);

    const photo = await prisma.petPhoto.create({
      data: {
        url: data.url,
        caption: data.caption || null,
        petId: data.petId,
      },
    });
    return NextResponse.json(photo);
  } catch (error) {
    logError("pet_photos_POST", error);
    return jsonError("Failed to add photo", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return jsonError("id required", 400);

    const photo = await prisma.petPhoto.findUnique({ where: { id } });
    if (!photo) return jsonError("Not found", 404);

    const pet = await prisma.pet.findUnique({ where: { id: photo.petId } });
    if (!pet || pet.familyId !== user.familyId) return jsonError("Forbidden", 403);

    await prisma.petPhoto.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("pet_photos_DELETE", error);
    return jsonError("Failed to delete photo", 500);
  }
}
