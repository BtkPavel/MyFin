import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/db-utils";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Погашение долга: создаёт транзакцию и обновляет статус.
 * - Мне должны (OWED_TO_ME) → INCOME «Возврат долга» — прибавляет на счёт
 * - Должен я (I_OWE) → EXPENSE «Погашение долга» — снимает с счёта
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDefaultUserId();
    const { id } = await params;

    const debt = await prisma.debt.findFirst({
      where: { id, userId },
    });
    if (!debt)
      return NextResponse.json({ error: "Долг не найден" }, { status: 404 });
    if (debt.status === "PAID")
      return NextResponse.json(
        { error: "Долг уже погашен" },
        { status: 400 }
      );

    const amount = Number(debt.amount);
    const isOwedToMe = debt.type === "OWED_TO_ME";
    const txType = isOwedToMe ? "INCOME" : "EXPENSE";
    const categoryName = isOwedToMe ? "Возврат долга" : "Погашение долга";

    let category = await prisma.category.findFirst({
      where: { name: categoryName, type: txType },
    });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          type: txType,
          icon: "↩️",
        },
      });
    }

    const date = new Date();

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId,
          type: txType,
          amount: new Decimal(amount),
          currency: debt.currency,
          categoryId: category.id,
          date,
          description: `Погашение: ${debt.name}`,
        },
      }),
      prisma.debt.update({
        where: { id },
        data: { status: "PAID" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Debt repay error:", error);
    return NextResponse.json(
      { error: "Ошибка при погашении" },
      { status: 500 }
    );
  }
}
