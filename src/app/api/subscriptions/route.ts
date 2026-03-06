import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/db-utils";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Subscriptions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getDefaultUserId();
    const body = await request.json();
    const { name, amount, paymentDay } = body;

    if (!name || !amount || paymentDay == null) {
      return NextResponse.json(
        { error: "Missing required fields: name, amount, paymentDay" },
        { status: 400 }
      );
    }

    const day = Math.min(28, Math.max(1, Number(paymentDay)));
    const raw = String(body.currency ?? "").toUpperCase().trim();
    const currencyVal = ["BYN", "USD", "RUB"].includes(raw) ? raw : "BYN";

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        name,
        amount: new Decimal(amount),
        currency: currencyVal,
        paymentDay: day,
        status: "ACTIVE",
      },
    });
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Subscriptions POST error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
