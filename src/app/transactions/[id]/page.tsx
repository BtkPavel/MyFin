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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Загрузка...</div>
      </div>
    );
  }

  const amount = parseFloat(transaction.amount);
  const format = (n: number) =>
    n.toLocaleString("ru-BY", { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 px-4 py-4 safe-area-pt flex items-center justify-between">
        <Link href="/transactions" className="text-slate-600">
          ← Назад
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/transactions/${params.id}/edit`}
            className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm"
          >
            Редактировать
          </Link>
          <button
            onClick={deleteTransaction}
            className="px-3 py-1.5 bg-rose-100 text-rose-600 rounded-lg text-sm"
          >
            Удалить
          </button>
        </div>
      </header>

      <main className="p-4">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <span className="text-5xl block mb-2">
            {transaction.category?.icon || "•"}
          </span>
          <h2 className="text-xl font-semibold text-slate-800">
            {transaction.category?.name}
          </h2>
          <p className="text-slate-500 mt-1">
            {new Date(transaction.date).toLocaleDateString("ru-BY", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="mt-4">
            <span
              className={
                transaction.type === "INCOME"
                  ? "text-emerald-600 text-2xl font-bold"
                  : "text-rose-600 text-2xl font-bold"
              }
            >
              {transaction.type === "INCOME" ? "+" : "-"}
              {format(amount)} BYN
            </span>
            <div className="mt-2">
              <CurrencyConverter amount={amount} />
            </div>
          </div>
          {transaction.description && (
            <p className="mt-4 text-slate-600 text-sm">
              {transaction.description}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
