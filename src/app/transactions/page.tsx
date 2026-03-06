"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  category: { name: string; icon?: string };
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
      <header className="bg-white border-b border-slate-200 px-4 py-4 safe-area-pt">
        <h1 className="text-xl font-bold text-slate-800">Операции</h1>
        <div className="flex gap-2 mt-2">
          {(["all", "INCOME", "EXPENSE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === f
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {f === "all" ? "Все" : f === "INCOME" ? "Доходы" : "Расходы"}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 pb-8">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-xl" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-4xl mb-4">📝</p>
            <p>Нет операций</p>
            <Link
              href="/transactions/new"
              className="inline-block mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl"
            >
              Добавить
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3"
              >
                <span className="text-2xl">{t.category?.icon || "•"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800">{t.category?.name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(t.date).toLocaleDateString("ru-BY")}
                    {t.description && ` · ${t.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      t.type === "INCOME"
                        ? "text-emerald-600 font-semibold"
                        : "text-rose-600 font-semibold"
                    }
                  >
                    {t.type === "INCOME" ? "+" : "-"}
                    {format(parseFloat(t.amount))} BYN
                  </span>
                  <Link
                    href={`/transactions/${t.id}/edit`}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✏️
                  </Link>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Link
        href="/transactions/new"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-lg z-40"
      >
        +
      </Link>
    </div>
  );
}
