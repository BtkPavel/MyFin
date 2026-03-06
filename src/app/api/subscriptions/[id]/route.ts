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
    const sub = await prisma.subscription.findFirst({
      where: { id, userId },
    });
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(sub);
  } catch (error) {
    console.error("Subscription GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
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

    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (body.name != null) updateData.name = body.name;
    if (body.amount != null) updateData.amount = new Decimal(body.amount);
    if (body.currency != null) updateData.currency = body.currency;
    if (body.paymentDay != null)
      updateData.paymentDay = Math.min(28, Math.max(1, Number(body.paymentDay)));
    if (body.status != null) updateData.status = body.status;

    const sub = await prisma.subscription.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(sub);
  } catch (error) {
    console.error("Subscription PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
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

    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.subscription.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
