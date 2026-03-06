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

interface Loan {
  id: string;
  name: string;
  status: string;
  remainingAmount: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loanId, setLoanId] = useState("");
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
    fetch("/api/loans")
      .then((r) => r.json())
      .then((loansList: Loan[]) =>
        setLoans(loansList.filter((l) => l.status === "ACTIVE"))
      )
      .catch(() => setLoans([]));
  }, []);

  useEffect(() => {
    const filtered = categories.filter((c) => c.type === type);
    if (filtered.length && !filtered.some((c) => c.id === categoryId)) {
      setCategoryId(filtered[0].id);
    }
  }, [type, categories]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isInstallmentPayment = selectedCategory?.name === "Оплата рассрочки";
  const activeLoans = loans.filter((l) => l.status === "ACTIVE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;
    if (isInstallmentPayment && !loanId) {
      alert("Выберите рассрочку или кредит");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        amount: parseFloat(amount),
        categoryId,
        loanId: isInstallmentPayment ? loanId : undefined,
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
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)] flex items-center gap-4">
        <Link
          href="/"
          className="text-[var(--accent-primary)] font-medium text-sm"
        >
          ← Назад
        </Link>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          Новая операция
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
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
              Категория
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setLoanId("");
              }}
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

          {isInstallmentPayment && type === "EXPENSE" && (
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                Рассрочка / Кредит
              </label>
              <select
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">— Выберите —</option>
                {activeLoans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} (осталось{" "}
                    {parseFloat(l.remainingAmount).toLocaleString("ru-BY", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    BYN)
                  </option>
                ))}
              </select>
              {activeLoans.length === 0 && (
                <p className="text-[var(--text-tertiary)] text-xs mt-2">
                  Нет активных кредитов. Добавьте в разделе Кредиты.
                </p>
              )}
            </div>
          )}

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
              placeholder="Комментарий"
            />
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              !amount ||
              (isInstallmentPayment && (!loanId || activeLoans.length === 0))
            }
            className="w-full py-3 btn-primary disabled:opacity-50"
          >
            {submitting ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </main>
    </div>
  );
}
