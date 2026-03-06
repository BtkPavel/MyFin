"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CurrencyConverter from "@/components/CurrencyConverter";
import AddTransactionButton from "@/components/AddTransactionButton";

interface Summary {
  income: number;
  expenses: number;
  balance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  category: { name: string; icon?: string };
  date: string;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date();
    from.setDate(1);
    const to = new Date();
    Promise.all([
      fetch(
        `/api/transactions/summary?from=${from.toISOString()}&to=${to.toISOString()}`
      ).then((r) => r.json()),
      fetch("/api/transactions?take=5").then((r) => r.json()),
    ])
      .then(([s, t]) => {
        setSummary(s);
        setTransactions(Array.isArray(t) ? t.slice(0, 5) : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const format = (n: number) =>
    n.toLocaleString("ru-BY", { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen">
      <header className="bg-emerald-600 text-white px-4 py-6 pt-8 safe-area-pt">
        <h1 className="text-xl font-bold">MyFin</h1>
        <p className="text-emerald-100 text-sm">Контроль финансов</p>
      </header>

      <main className="p-4 -mt-2 rounded-t-2xl bg-slate-50 min-h-[60vh]">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-slate-200 rounded-xl" />
            <div className="h-32 bg-slate-200 rounded-xl" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <h2 className="text-sm font-medium text-slate-500 mb-2">
                Баланс за месяц
              </h2>
              <div className="text-2xl font-bold text-slate-800">
                {summary && (
                  <CurrencyConverter amount={summary.balance} className="text-2xl" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-slate-500">Доход</span>
                  <p className="font-semibold text-emerald-600">
                    {summary && format(summary.income)} BYN
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Расход</span>
                  <p className="font-semibold text-rose-600">
                    {summary && format(summary.expenses)} BYN
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-slate-800">Последние операции</h2>
              <Link href="/transactions" className="text-sm text-emerald-600">
                Все →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Нет операций. Добавьте первую!
                </div>
              ) : (
                transactions.map((t) => (
                  <Link
                    key={t.id}
                    href={`/transactions/${t.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 active:bg-slate-100"
                  >
                    <span className="text-2xl">{t.category?.icon || "•"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        {t.category?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(t.date).toLocaleDateString("ru-BY")}
                      </p>
                    </div>
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
                  </Link>
                ))
              )}
            </div>
          </>
        )}
      </main>

      <AddTransactionButton />
    </div>
  );
}
