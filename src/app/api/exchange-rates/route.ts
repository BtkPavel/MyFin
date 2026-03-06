import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchNBRBRates } from "@/lib/nbrb-api";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let rates = await prisma.exchangeRate.findMany({
      where: {
        fromCurr: "BYN",
        toCurr: { in: ["USD", "RUB"] },
        date: dateOnly,
      },
    });

    if (rates.length < 2) {
      const { USD, RUB } = await fetchNBRBRates();
      await prisma.exchangeRate.upsert({
        where: {
          fromCurr_toCurr_date: {
            fromCurr: "BYN",
            toCurr: "USD",
            date: dateOnly,
          },
        },
        update: { rate: new Decimal(USD) },
        create: {
          fromCurr: "BYN",
          toCurr: "USD",
          rate: new Decimal(USD),
          date: dateOnly,
        },
      });
      await prisma.exchangeRate.upsert({
        where: {
          fromCurr_toCurr_date: {
            fromCurr: "BYN",
            toCurr: "RUB",
            date: dateOnly,
          },
        },
        update: { rate: new Decimal(RUB) },
        create: {
          fromCurr: "BYN",
          toCurr: "RUB",
          rate: new Decimal(RUB),
          date: dateOnly,
        },
      });
      rates = await prisma.exchangeRate.findMany({
        where: {
          fromCurr: "BYN",
          toCurr: { in: ["USD", "RUB"] },
          date: dateOnly,
        },
      });
    }

    const result: Record<string, number> = {};
    for (const r of rates) {
      result[r.toCurr] = Number(r.rate);
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Exchange rates GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}
