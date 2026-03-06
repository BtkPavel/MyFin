"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  categoryId: string;
  date: string;
  description?: string;
}

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [categories, setCategories] = useState<Category[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/transactions/${id}`).then((r) => r.json()),
    ])
      .then(([cats, txn]) => {
        setCategories(cats);
        if (txn.id) {
          setTransaction(txn);
          setType(txn.type);
          setAmount(txn.amount);
          setCategoryId(txn.categoryId);
          setDate(txn.date.slice(0, 10));
          setDescription(txn.description || "");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;
    setSubmitting(true);
    const res = await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        amount: parseFloat(amount),
        categoryId,
        date: new Date(date).toISOString(),
        description: description || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) router.push("/transactions");
    else alert("Ошибка при сохранении");
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  if (loading || !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)] flex items-center gap-4">
        <Link
          href="/transactions"
          className="text-[var(--accent-primary)] font-medium text-sm"
        >
          ← Назад
        </Link>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          Редактировать
        </h1>
      </header>

      <main className="p-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
              Тип
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("INCOME")}
                className={`flex-1 py-3 rounded-[var(--radius-md)] font-medium text-sm transition-all ${
                  type === "INCOME"
                    ? "bg-[var(--accent-income)] text-white"
                    : "bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                }`}
              >
                Доход
              </button>
              <button
                type="button"
                onClick={() => setType("EXPENSE")}
                className={`flex-1 py-3 rounded-[var(--radius-md)] font-medium text-sm transition-all ${
                  type === "EXPENSE"
                    ? "bg-[var(--accent-expense)] text-white"
                    : "bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                }`}
              >
                Расход
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
              Сумма (BYN)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field text-lg font-semibold tabular-nums"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
              Категория
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
              required
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
              Дата
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
              Описание
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 btn-primary disabled:opacity-50"
          >
            {submitting ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </main>
    </div>
  );
}
