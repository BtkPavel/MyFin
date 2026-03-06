import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/db-utils";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const debts = await prisma.debt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(debts);
  } catch (error) {
    console.error("Debts GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getDefaultUserId();
    const body = await request.json();
    const { type, name, amount, description } = body;

    if (!type || !name || amount == null) {
      return NextResponse.json(
        { error: "Missing required fields: type, name, amount" },
        { status: 400 }
      );
    }

    if (type !== "OWED_TO_ME" && type !== "I_OWE") {
      return NextResponse.json(
        { error: "type must be OWED_TO_ME or I_OWE" },
        { status: 400 }
      );
    }

    const raw = String(body.currency ?? "").toUpperCase().trim();
    const currencyVal = ["BYN", "USD", "RUB"].includes(raw) ? raw : "BYN";

    const debt = await prisma.debt.create({
      data: {
        userId,
        type,
        name,
        amount: new Decimal(amount),
        currency: currencyVal,
        description: description || null,
        status: "ACTIVE",
      },
    });
    return NextResponse.json(debt);
  } catch (error) {
    console.error("Debts POST error:", error);
    return NextResponse.json(
      { error: "Failed to create debt" },
      { status: 500 }
    );
  }
}
