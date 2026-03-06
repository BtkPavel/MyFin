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
    const debt = await prisma.debt.findFirst({
      where: { id, userId },
    });
    if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(debt);
  } catch (error) {
    console.error("Debt GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debt" },
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

    const existing = await prisma.debt.findFirst({
      where: { id, userId },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (body.type != null) updateData.type = body.type;
    if (body.name != null) updateData.name = body.name;
    if (body.amount != null) updateData.amount = new Decimal(body.amount);
    if (body.currency != null) updateData.currency = body.currency;
    if (body.description != null) updateData.description = body.description;
    if (body.status != null) updateData.status = body.status;

    const debt = await prisma.debt.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(debt);
  } catch (error) {
    console.error("Debt PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update debt" },
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

    const existing = await prisma.debt.findFirst({
      where: { id, userId },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.debt.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Debt DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete debt" },
      { status: 500 }
    );
  }
}
