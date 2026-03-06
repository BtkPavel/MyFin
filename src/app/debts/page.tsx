"use client";

import { useEffect, useRef, useState } from "react";
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

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"OWED_TO_ME" | "I_OWE">("OWED_TO_ME");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = () => {
    fetch("/api/debts")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? data : []))
      .then(setDebts)
      .catch(() => setDebts([]))
      .finally(() => setLoading(false));
  };

  const owedToMe = debts.filter((d) => d.type === "OWED_TO_ME" && d.status !== "PAID");
  const iOwe = debts.filter((d) => d.type === "I_OWE" && d.status !== "PAID");
  const paid = debts.filter((d) => d.status === "PAID");

  const deleteDebt = async (id: string) => {
    if (!confirm("Удалить запись?")) return;
    const res = await fetch(`/api/debts/${id}`, { method: "DELETE" });
    if (res.ok) loadDebts();
  };

  return (
    <div className="min-h-screen">
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Долги
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Мне должны и должен я
        </p>
      </header>

      <main className="p-4 pb-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse bg-[var(--border-subtle)]/50 rounded-[var(--radius-lg)]"
              />
            ))}
          </div>
        ) : showForm ? (
          <DebtForm
            type={formType}
            onSuccess={() => {
              setShowForm(false);
              loadDebts();
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-semibold text-[var(--accent-income)] mb-2 flex items-center gap-2">
                <span>↑</span> Мне должны
              </h2>
              {owedToMe.length === 0 ? (
                <div className="card p-6 text-center">
                  <p className="text-[var(--text-tertiary)] text-sm">
                    Нет записей
                  </p>
                  <button
                    onClick={() => {
                      setFormType("OWED_TO_ME");
                      setShowForm(true);
                    }}
                    className="mt-2 text-[var(--accent-primary)] text-sm font-medium"
                  >
                    + Добавить
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {owedToMe.map((d) => (
                    <DebtCard
                      key={d.id}
                      debt={d}
                      onDelete={deleteDebt}
                      CurrencyConverter={CurrencyConverter}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-sm font-semibold text-[var(--accent-expense)] mb-2 flex items-center gap-2">
                <span>↓</span> Должен я
              </h2>
              {iOwe.length === 0 ? (
                <div className="card p-6 text-center">
                  <p className="text-[var(--text-tertiary)] text-sm">
                    Нет записей
                  </p>
                  <button
                    onClick={() => {
                      setFormType("I_OWE");
                      setShowForm(true);
                    }}
                    className="mt-2 text-[var(--accent-primary)] text-sm font-medium"
                  >
                    + Добавить
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {iOwe.map((d) => (
                    <DebtCard
                      key={d.id}
                      debt={d}
                      onDelete={deleteDebt}
                      CurrencyConverter={CurrencyConverter}
                    />
                  ))}
                </div>
              )}
            </section>

            {paid.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-[var(--text-tertiary)] mb-2">
                  Погашено
                </h2>
                <div className="space-y-2 opacity-75">
                  {paid.map((d) => (
                    <DebtCard
                      key={d.id}
                      debt={d}
                      isPaid
                      onDelete={deleteDebt}
                      CurrencyConverter={CurrencyConverter}
                    />
                  ))}
                </div>
              </section>
            )}

            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-[var(--border-strong)] rounded-[var(--radius-lg)] text-[var(--text-tertiary)] font-medium text-sm"
            >
              + Добавить долг
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function DebtCard({
  debt,
  isPaid,
  onDelete,
  CurrencyConverter,
}: {
  debt: Debt;
  isPaid?: boolean;
  onDelete: (id: string) => void;
  CurrencyConverter: React.ComponentType<{
    amount: number;
    fromCurrency?: "BYN" | "USD" | "RUB";
    className?: string;
  }>;
}) {
  const amt = parseFloat(debt.amount);
  const isOwedToMe = debt.type === "OWED_TO_ME";
  const debtCurrency = (debt.currency === "USD" || debt.currency === "RUB"
    ? debt.currency
    : "BYN") as "BYN" | "USD" | "RUB";

  return (
    <div
      className={`card flex flex-col sm:flex-row sm:items-center gap-3 p-4 ${
        isPaid ? "line-through opacity-70" : ""
      }`}
    >
      <Link
        href={`/debts/${debt.id}`}
        className="flex min-w-0 flex-1 flex-col gap-1 active:opacity-80 sm:flex-row sm:items-center sm:gap-4"
      >
        <div
          className={`w-10 h-10 shrink-0 rounded-[var(--radius-md)] flex items-center justify-center text-lg ${
            isOwedToMe
              ? "bg-[var(--accent-income-muted)] text-[var(--accent-income)]"
              : "bg-[var(--accent-expense-muted)] text-[var(--accent-expense)]"
          }`}
        >
          {isOwedToMe ? "↑" : "↓"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-[var(--text-primary)]">
            {debt.name}
          </p>
          {debt.description && (
            <p className="truncate text-[11px] text-[var(--text-tertiary)]">
              {debt.description}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <CurrencyConverter
            amount={amt}
            fromCurrency={debtCurrency}
          />
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete(debt.id);
        }}
        className="h-8 w-8 shrink-0 self-end flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:bg-[var(--accent-expense-muted)] hover:text-[var(--accent-expense)] sm:self-auto"
      >
        ⌫
      </button>
    </div>
  );
}

function DebtForm({
  type: initialType,
  onSuccess,
  onCancel,
}: {
  type: "OWED_TO_ME" | "I_OWE";
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<"OWED_TO_ME" | "I_OWE">(initialType);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BYN");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const currencySelectRef = useRef<HTMLSelectElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    const currencyVal =
      (currencySelectRef.current?.value as "BYN" | "USD" | "RUB") || "BYN";
    setSubmitting(true);
    try {
      const res = await fetchWithTimeout("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          amount: parseFloat(amount),
          currency: currencyVal,
          description: description || null,
        }),
      });
      if (res.ok) onSuccess();
      else alert("Ошибка при сохранении");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Тип
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "OWED_TO_ME" | "I_OWE")}
          className="input-field"
        >
          <option value="OWED_TO_ME">Мне должны</option>
          <option value="I_OWE">Должен я</option>
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          {type === "OWED_TO_ME" ? "Кто должен" : "Кому должен"}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="Имя, компания..."
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Сумма
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Валюта
          </label>
          <select
            ref={currencySelectRef}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input-field"
          >
            <option value="BYN">BYN</option>
            <option value="USD">USD</option>
            <option value="RUB">RUB</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Заметка (необязательно)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          placeholder="За что, до когда..."
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-[var(--radius-md)] bg-[var(--border-subtle)] text-[var(--text-secondary)] font-medium"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 btn-primary disabled:opacity-50"
        >
          {submitting ? "Сохранение..." : "Добавить"}
        </button>
      </div>
    </form>
  );
}
