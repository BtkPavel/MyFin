import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchNBRBRates } from "@/lib/nbrb-api";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

async function handleCron(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );

    const { USD, RUB } = await fetchNBRBRates();

    await prisma.exchangeRate.upsert({
      where: {
        fromCurr_toCurr_date: {
          fromCurr: "BYN",
          toCurr: "USD",
          date: today,
        },
      },
      update: { rate: new Decimal(USD) },
      create: {
        fromCurr: "BYN",
        toCurr: "USD",
        rate: new Decimal(USD),
        date: today,
      },
    });

    await prisma.exchangeRate.upsert({
      where: {
        fromCurr_toCurr_date: {
          fromCurr: "BYN",
          toCurr: "RUB",
          date: today,
        },
      },
      update: { rate: new Decimal(RUB) },
      create: {
        fromCurr: "BYN",
        toCurr: "RUB",
        rate: new Decimal(RUB),
        date: today,
      },
    });

    return NextResponse.json({
      success: true,
      rates: { USD, RUB },
      date: today.toISOString(),
    });
  } catch (error) {
    console.error("Cron update-rates error:", error);
    return NextResponse.json(
      { error: "Failed to update exchange rates" },
      { status: 500 }
    );
  }
}
