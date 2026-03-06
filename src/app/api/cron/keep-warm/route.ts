import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Держит Neon БД и Vercel functions «прогретыми» — вызывается каждые 5 мин через cron.
 * Без этого первый запрос после паузы может занимать 10–30 сек (cold start).
 */
export async function GET() {
  try {
    await prisma.user.count();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
