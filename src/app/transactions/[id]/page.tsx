"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CurrencyConverter from "@/components/CurrencyConverter";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  category: { name: string; icon?: string };
  date: string;
  description?: string;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetch(`/api/transactions/${params.id}`)
      .then((r) => r.json())
      .then(setTransaction)
      .catch(() => setTransaction(null));
  }, [params.id]);

  const deleteTransaction = async () => {
    if (!confirm("Удалить операцию?")) return;
    const res = await fetch(`/api/transactions/${params.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/transactions");
  };

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const amount = parseFloat(transaction.amount);
  const format = (n: number) =>
    n.toLocaleString("ru-BY", { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen">
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)] flex items-center justify-between">
        <Link
          href="/transactions"
          className="text-[var(--accent-primary)] font-medium text-sm"
        >
          ← Назад
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/transactions/${params.id}/edit`}
            className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--bg-base)] text-[var(--text-secondary)] text-sm font-medium"
          >
            Редактировать
          </Link>
          <button
            onClick={deleteTransaction}
            className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--accent-expense-muted)] text-[var(--accent-expense)] text-sm font-medium"
          >
            Удалить
          </button>
        </div>
      </header>

      <main className="p-4">
        <div className="card-elevated p-8 text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
            style={{
              backgroundColor:
                transaction.type === "INCOME"
                  ? "var(--accent-primary-muted)"
                  : "var(--accent-expense-muted)",
              color:
                transaction.type === "INCOME"
                  ? "var(--accent-income)"
                  : "var(--accent-expense)",
            }}
          >
            {transaction.category?.icon || (transaction.type === "INCOME" ? "+" : "−")}
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {transaction.category?.name}
          </h2>
          <p className="text-[var(--text-tertiary)] text-sm mt-1">
            {new Date(transaction.date).toLocaleDateString("ru-BY", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="mt-6">
            <span
              className={`text-2xl font-semibold tabular-nums ${
                transaction.type === "INCOME"
                  ? "text-[var(--accent-income)]"
                  : "text-[var(--accent-expense)]"
              }`}
            >
              {transaction.type === "INCOME" ? "+" : "−"}
              {format(amount)} BYN
            </span>
            <div className="mt-3">
              <CurrencyConverter amount={amount} />
            </div>
          </div>
          {transaction.description && (
            <p className="mt-6 text-[var(--text-secondary)] text-sm border-t border-[var(--border-subtle)] pt-6">
              {transaction.description}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
