import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/db-utils";
export async function GET(request: NextRequest) {
  try {
    const userId = await getDefaultUserId();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const to = searchParams.get("to") || new Date().toISOString();

    const dateFilter = {
      date: {
        gte: new Date(from),
        lte: new Date(to),
      },
    };

    const [income, expenses] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: "INCOME", ...dateFilter },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", ...dateFilter },
        _sum: { amount: true },
      }),
    ]);

    const incomeTotal = Number(income._sum.amount || 0);
    const expenseTotal = Number(expenses._sum.amount || 0);
    const balance = incomeTotal - expenseTotal;

    return NextResponse.json({
      income: incomeTotal,
      expenses: expenseTotal,
      balance,
    });
  } catch (error) {
    console.error("Summary GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
