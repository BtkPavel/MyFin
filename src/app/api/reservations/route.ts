import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/db-utils";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Reservations GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getDefaultUserId();
    const body = await request.json();
    const { name, targetAmount, currency, deadline } = body;

    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: "Missing required fields: name, targetAmount" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        name,
        targetAmount: new Decimal(targetAmount),
        currentAmount: new Decimal(0),
        currency: currency || "BYN",
        deadline: deadline ? new Date(deadline) : null,
      },
    });
    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Reservations POST error:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
