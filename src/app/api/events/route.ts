import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    if (!user.familyId) return NextResponse.json([]);

    const events = await prisma.event.findMany({
      where: { createdBy: { familyId: user.familyId } },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    logError("events_GET", error);
    return jsonError("Failed to fetch events", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const data = await req.json();
    const eventDate = safeDate(data.date);
    if (!eventDate) return jsonError("Укажите корректную дату", 400);
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: eventDate,
        type: data.type || "CUSTOM",
        remindAt: data.remindAt ? safeDate(data.remindAt) : null,
        createdById: user.id,
      },
    });
    return NextResponse.json(event);
  } catch (error) {
    logError("events_POST", error);
    return jsonError("Failed to create event", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const { id, title, date, type, description } = await req.json();
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (event.createdById !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(date !== undefined && { date: safeDate(date)! }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    logError("events_PATCH", error);
    return jsonError("Failed to update event", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    const { id } = await req.json();
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (event.createdById !== user.id && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("events_DELETE", error);
    return jsonError("Failed to delete event", 500);
  }
}
