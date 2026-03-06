import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/db-utils";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(request: NextRequest) {
  try {
    const userId = await getDefaultUserId();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");

    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, Date>).gte = new Date(from);
      if (to) (where.date as Record<string, Date>).lte = new Date(to);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      take: 200,
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Transactions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getDefaultUserId();
    const body = await request.json();
    const { type, amount, currency, categoryId, date, description } = body;

    if (!type || !amount || !categoryId || !date) {
      return NextResponse.json(
        { error: "Missing required fields: type, amount, categoryId, date" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount: new Decimal(amount),
        currency: currency || "BYN",
        categoryId,
        date: new Date(date),
        description: description || null,
      },
      include: { category: true },
    });
    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Transactions POST error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
