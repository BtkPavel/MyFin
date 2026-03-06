"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  category: { name: string; icon?: string };
  loan?: { name: string };
  date: string;
  description?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<"all" | "INCOME" | "EXPENSE">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url =
      filter === "all"
        ? "/api/transactions"
        : `/api/transactions?type=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const loadTransactions = () => {
    setLoading(true);
    const url =
      filter === "all"
        ? "/api/transactions"
        : `/api/transactions?type=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const format = (n: number) =>
    n.toLocaleString("ru-BY", { minimumFractionDigits: 2 });

  const deleteTransaction = async (id: string) => {
    if (!confirm("Удалить операцию?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) loadTransactions();
  };

  return (
    <div className="min-h-screen">
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Операции
        </h1>
        <div className="flex gap-2 mt-3">
          {(["all", "INCOME", "EXPENSE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-[var(--radius-md)] text-[13px] font-medium transition-all ${
                filter === f
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-[var(--bg-base)] text-[var(--text-secondary)]"
              }`}
            >
              {f === "all" ? "Все" : f === "INCOME" ? "Доходы" : "Расходы"}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 pb-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse bg-[var(--border-subtle)]/50 rounded-[var(--radius-lg)]"
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--accent-primary-muted)] flex items-center justify-center text-[var(--accent-primary)] text-2xl">
              ◇
            </div>
            <p className="text-[var(--text-secondary)]">Нет операций</p>
            <Link
              href="/transactions/new"
              className="inline-block mt-4 btn-primary"
            >
              Добавить
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="card flex items-center gap-4 p-4"
              >
                <div
                  className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-lg shrink-0"
                  style={{
                    backgroundColor:
                      t.type === "INCOME"
                        ? "var(--accent-primary-muted)"
                        : "var(--accent-expense-muted)",
                    color:
                      t.type === "INCOME"
                        ? "var(--accent-income)"
                        : "var(--accent-expense)",
                  }}
                >
                  {t.category?.icon || (t.type === "INCOME" ? "+" : "−")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)]">
                    {t.category?.name}
                    {t.loan && (
                      <span className="text-[var(--text-tertiary)] font-normal">
                        {" "}
                        · {t.loan.name}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    {new Date(t.date).toLocaleDateString("ru-BY")}
                    {t.description && ` · ${t.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold tabular-nums ${
                      t.type === "INCOME"
                        ? "text-[var(--accent-income)]"
                        : "text-[var(--accent-expense)]"
                    }`}
                  >
                    {t.type === "INCOME" ? "+" : "−"}
                    {format(parseFloat(t.amount))} BYN
                  </span>
                  <Link
                    href={`/transactions/${t.id}/edit`}
                    className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:bg-[var(--bg-base)]"
                  >
                    ✎
                  </Link>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--accent-expense)] hover:bg-[var(--accent-expense-muted)]"
                  >
                    ⌫
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Link
        href="/transactions/new"
        className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-light text-white transition-all duration-250 active:scale-95 hover:scale-105"
        style={{
          background: "var(--accent-primary)",
          boxShadow:
            "0 4px 14px rgba(15, 118, 110, 0.4), 0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        +
      </Link>
    </div>
  );
}
