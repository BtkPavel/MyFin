import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/db-utils";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { openingBalance: true, baseCurrency: true },
    });
    if (!user)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      openingBalance: Number(user.openingBalance),
      baseCurrency: user.baseCurrency,
    });
  } catch (error) {
    console.error("User GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getDefaultUserId();
    const body = await request.json();
    const { openingBalance } = body;

    const value = typeof openingBalance === "number"
      ? openingBalance
      : parseFloat(openingBalance);
    if (openingBalance == null || isNaN(value)) {
      return NextResponse.json(
        { error: "openingBalance is required and must be a number" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { openingBalance: new Decimal(value) },
      select: { openingBalance: true },
    });
    return NextResponse.json({
      openingBalance: Number(user.openingBalance),
    });
  } catch (error) {
    console.error("User PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
