"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats: Category[]) => {
        setCategories(cats);
        const first = cats.find((c) => c.type === type);
        if (first) setCategoryId(first.id);
      });
  }, []);

  useEffect(() => {
    const filtered = categories.filter((c) => c.type === type);
    if (filtered.length && !filtered.some((c) => c.id === categoryId)) {
      setCategoryId(filtered[0].id);
    }
  }, [type, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;
    setSubmitting(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
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
    if (res.ok) router.push("/");
    else alert("Ошибка при сохранении");
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 px-4 py-4 safe-area-pt flex items-center gap-4">
        <Link href="/" className="text-slate-600">
          ← Назад
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Новая операция</h1>
      </header>

      <main className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Тип
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("INCOME")}
                className={`flex-1 py-2 rounded-xl font-medium ${
                  type === "INCOME"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Доход
              </button>
              <button
                type="button"
                onClick={() => setType("EXPENSE")}
                className={`flex-1 py-2 rounded-xl font-medium ${
                  type === "EXPENSE"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Расход
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Сумма (BYN)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-lg"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Категория
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Дата
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Описание (необязательно)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
              placeholder="Комментарий"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !amount}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {submitting ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </main>
    </div>
  );
}
