import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/db-utils";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDefaultUserId();
    const { id } = await params;
    const reservation = await prisma.reservation.findFirst({
      where: { id, userId },
    });
    if (!reservation)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Reservation GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDefaultUserId();
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.reservation.findFirst({
      where: { id, userId },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (body.currentAmount != null)
      updateData.currentAmount = new Decimal(body.currentAmount);
    if (body.name != null) updateData.name = body.name;
    if (body.targetAmount != null)
      updateData.targetAmount = new Decimal(body.targetAmount);
    if (body.deadline != null) updateData.deadline = body.deadline ? new Date(body.deadline) : null;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Reservation PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDefaultUserId();
    const { id } = await params;

    const existing = await prisma.reservation.findFirst({
      where: { id, userId },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reservation DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete reservation" },
      { status: 500 }
    );
  }
}
