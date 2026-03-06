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

    const [user, periodIncome, periodExpenses, allIncome, allExpenses] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { openingBalance: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: "INCOME", ...dateFilter },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: "EXPENSE", ...dateFilter },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: "INCOME" },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: "EXPENSE" },
          _sum: { amount: true },
        }),
      ]);

    const openingBalance = Number(user?.openingBalance || 0);
    const incomeTotal = Number(periodIncome._sum.amount || 0);
    const expenseTotal = Number(periodExpenses._sum.amount || 0);
    const totalIncome = Number(allIncome._sum.amount || 0);
    const totalExpenses = Number(allExpenses._sum.amount || 0);

    return NextResponse.json({
      income: incomeTotal,
      expenses: expenseTotal,
      balance: incomeTotal - expenseTotal,
      openingBalance,
      totalBalance: openingBalance + totalIncome - totalExpenses,
    });
  } catch (error) {
    console.error("Summary GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
