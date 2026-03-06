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
    const loan = await prisma.loan.findFirst({ where: { id, userId } });
    if (!loan)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(loan);
  } catch (error) {
    console.error("Loan GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan" },
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

    const existing = await prisma.loan.findFirst({ where: { id, userId } });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (body.remainingAmount != null)
      updateData.remainingAmount = new Decimal(body.remainingAmount);
    if (body.status != null) updateData.status = body.status;

    const loan = await prisma.loan.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(loan);
  } catch (error) {
    console.error("Loan PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update loan" },
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

    const existing = await prisma.loan.findFirst({ where: { id, userId } });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.loan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Loan DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete loan" },
      { status: 500 }
    );
  }
}
