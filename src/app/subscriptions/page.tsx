"use client";

import { useEffect, useRef, useState } from "react";
import CurrencyConverter from "@/components/CurrencyConverter";
import { fetchWithTimeout, SLOW_SERVER_MSG } from "@/lib/api";

interface Subscription {
  id: string;
  name: string;
  amount: string;
  currency: string;
  paymentDay: number;
  status: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = () => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? data : []))
      .then(setSubscriptions)
      .catch(() => setSubscriptions([]))
      .finally(() => setLoading(false));
  };

  const deleteSubscription = async (id: string) => {
    if (!confirm("Удалить подписку?")) return;
    const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    if (res.ok) loadSubscriptions();
  };

  return (
    <div className="min-h-screen">
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Подписки
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Netflix, Spotify и другие ежемесячные платежи
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
          <SubscriptionForm
            onSuccess={() => {
              setShowForm(false);
              loadSubscriptions();
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : subscriptions.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--accent-primary-muted)] flex items-center justify-center text-[var(--accent-primary)] text-2xl">
              📅
            </div>
            <p className="text-[var(--text-secondary)]">Нет подписок</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 btn-primary"
            >
              Добавить подписку
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="card flex items-center gap-4 p-4"
              >
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--accent-primary-muted)] flex items-center justify-center text-[var(--accent-primary)] text-lg shrink-0">
                  📅
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)]">
                    {sub.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Платёж {sub.paymentDay}-го числа · {sub.currency}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CurrencyConverter
                    amount={parseFloat(sub.amount)}
                    fromCurrency={
                      sub.currency === "USD" || sub.currency === "RUB"
                        ? sub.currency
                        : "BYN"
                    }
                  />
                  <button
                    onClick={() => deleteSubscription(sub.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--accent-expense)] hover:bg-[var(--accent-expense-muted)]"
                  >
                    ⌫
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-[var(--border-strong)] rounded-[var(--radius-lg)] text-[var(--text-tertiary)] font-medium text-sm"
            >
              + Добавить подписку
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function SubscriptionForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BYN");
  const [paymentDay, setPaymentDay] = useState("15");
  const [submitting, setSubmitting] = useState(false);
  const currencySelectRef = useRef<HTMLSelectElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    const currencyVal =
      (currencySelectRef.current?.value as "BYN" | "USD" | "RUB") || "BYN";
    setSubmitting(true);
    try {
      const res = await fetchWithTimeout("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount: parseFloat(amount),
          currency: currencyVal,
          paymentDay: Math.min(28, Math.max(1, parseInt(paymentDay, 10) || 15)),
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
          Название
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="Netflix, Spotify, YouTube Premium..."
          required
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Сумма в месяц
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
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          День платежа (1–28)
        </label>
        <input
          type="number"
          min="1"
          max="28"
          value={paymentDay}
          onChange={(e) => setPaymentDay(e.target.value)}
          className="input-field"
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
