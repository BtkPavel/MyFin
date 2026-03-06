import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/db-utils";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const loans = await prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(loans);
  } catch (error) {
    console.error("Loans GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch loans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getDefaultUserId();
    const body = await request.json();
    const {
      name,
      type,
      totalAmount,
      currency,
      monthlyPayment,
      startDate,
      endDate,
      dueDay,
    } = body;

    if (!name || !type || !totalAmount || !monthlyPayment || !startDate || !endDate || dueDay == null) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, type, totalAmount, monthlyPayment, startDate, endDate, dueDay",
        },
        { status: 400 }
      );
    }

    const loan = await prisma.loan.create({
      data: {
        userId,
        name,
        type: type === "INSTALLMENT" ? "INSTALLMENT" : "LOAN",
        totalAmount: new Decimal(totalAmount),
        currency: currency || "BYN",
        monthlyPayment: new Decimal(monthlyPayment),
        remainingAmount: new Decimal(totalAmount),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        dueDay: Number(dueDay),
        status: "ACTIVE",
      },
    });
    return NextResponse.json(loan);
  } catch (error) {
    console.error("Loans POST error:", error);
    return NextResponse.json(
      { error: "Failed to create loan" },
      { status: 500 }
    );
  }
}
