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
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: true, loan: true },
    });
    if (!transaction)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Transaction GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
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

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (body.type != null) updateData.type = body.type;
    if (body.amount != null) updateData.amount = new Decimal(body.amount);
    if (body.currency != null) updateData.currency = body.currency;
    if (body.categoryId != null) updateData.categoryId = body.categoryId;
    if (body.date != null) updateData.date = new Date(body.date);
    if (body.description != null) updateData.description = body.description;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { category: true, loan: true },
    });
    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Transaction PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
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

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transaction DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
