"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CurrencyConverter from "@/components/CurrencyConverter";
import { fetchWithTimeout, SLOW_SERVER_MSG } from "@/lib/api";

interface Debt {
  id: string;
  type: string;
  name: string;
  amount: string;
  currency: string;
  description?: string;
  status: string;
}

export default function DebtDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [debt, setDebt] = useState<Debt | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/debts/${params.id}`)
      .then((r) => r.json())
      .then(setDebt)
      .catch(() => setDebt(null));
  }, [params.id]);

  const repay = async () => {
    if (!debt || debt.status === "PAID") return;
    if (
      !confirm(
        debt.type === "OWED_TO_ME"
          ? `Записать возврат ${parseFloat(debt.amount).toFixed(2)} ${debt.currency} от ${debt.name}? Сумма будет добавлена на счёт.`
          : `Записать погашение долга ${parseFloat(debt.amount).toFixed(2)} ${debt.currency} для ${debt.name}? Сумма будет списана с основного счёта.`
      )
    )
      return;
    setSubmitting(true);
    try {
      const res = await fetchWithTimeout(`/api/debts/${params.id}/repay`, {
        method: "POST",
      });
      if (res.ok) router.push("/debts");
      else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Ошибка при погашении");
      }
    } catch (err) {
      alert(
        err instanceof Error && err.message === "TIMEOUT"
          ? SLOW_SERVER_MSG
          : "Ошибка сети"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDebt = async () => {
    if (!confirm("Удалить запись о долге?")) return;
    const res = await fetch(`/api/debts/${params.id}`, { method: "DELETE" });
    if (res.ok) router.push("/debts");
  };

  if (!debt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const amt = parseFloat(debt.amount);
  const isOwedToMe = debt.type === "OWED_TO_ME";
  const isPaid = debt.status === "PAID";

  return (
    <div className="min-h-screen">
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)] flex items-center justify-between">
        <Link
          href="/debts"
          className="text-[var(--accent-primary)] font-medium text-sm"
        >
          ← Назад
        </Link>
        <button
          onClick={deleteDebt}
          className="px-3 py-2 rounded-[var(--radius-md)] text-[var(--accent-expense)] text-sm font-medium"
        >
          Удалить
        </button>
      </header>

      <main className="p-4">
        <div
          className={`card-elevated p-6 ${isPaid ? "opacity-75" : ""}`}
        >
          <div
            className={`w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center text-2xl mb-4 ${
              isOwedToMe
                ? "bg-[var(--accent-income-muted)] text-[var(--accent-income)]"
                : "bg-[var(--accent-expense-muted)] text-[var(--accent-expense)]"
            }`}
          >
            {isOwedToMe ? "↑" : "↓"}
          </div>
          <p className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            {isOwedToMe ? "Мне должны" : "Должен я"}
          </p>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            {debt.name}
          </h1>
          {debt.description && (
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {debt.description}
            </p>
          )}
          <div className="flex items-center gap-2 mb-6">
            <CurrencyConverter amount={amt} className="text-lg" />
          </div>
          {isPaid ? (
            <div className="min-h-[48px] flex items-center justify-center py-3 px-4 rounded-[var(--radius-md)] bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] font-medium">
              Погашено
            </div>
          ) : (
            <button
              onClick={repay}
              disabled={submitting}
              className="w-full py-3 btn-primary disabled:opacity-50"
            >
              {submitting ? "Сохранение…" : "Погасить"}
            </button>
          )}
        </div>
        {!isPaid && (
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3 text-center">
            {isOwedToMe
              ? "Сумма будет добавлена на основной счёт"
              : "Сумма будет списана с основного счёта"}
          </p>
        )}
      </main>
    </div>
  );
}
