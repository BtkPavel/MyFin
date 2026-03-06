"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CurrencyConverter from "@/components/CurrencyConverter";
import AddTransactionButton from "@/components/AddTransactionButton";
import { fetchWithTimeout, SLOW_SERVER_MSG } from "@/lib/api";

interface Summary {
  income: number;
  expenses: number;
  balance: number;
  openingBalance: number;
  totalBalance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  category: { name: string; icon?: string };
  loan?: { name: string };
  date: string;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOpeningBalanceForm, setShowOpeningBalanceForm] = useState(false);
  const [openingBalanceInput, setOpeningBalanceInput] = useState("");
  const [savingBalance, setSavingBalance] = useState(false);

  const loadData = () => {
    const from = new Date();
    from.setDate(1);
    const to = new Date();
    Promise.all([
      fetch(
        `/api/transactions/summary?from=${from.toISOString()}&to=${to.toISOString()}`
      )
        .then((r) => r.json())
        .then((s) =>
          s?.error
            ? { income: 0, expenses: 0, balance: 0, openingBalance: 0, totalBalance: 0 }
            : s
        ),
      fetch("/api/transactions")
        .then((r) => r.json())
        .then((t) => (Array.isArray(t) ? t : [])),
    ])
      .then(([s, t]) => {
        setSummary(s);
        setTransactions(t.slice(0, 5));
      })
      .catch(() => {
        setSummary({
          income: 0,
          expenses: 0,
          balance: 0,
          openingBalance: 0,
          totalBalance: 0,
        });
        setTransactions([]);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (summary !== null) setLoading(false);
  }, [summary]);

  const saveOpeningBalance = async () => {
    const value = parseFloat(String(openingBalanceInput).replace(",", "."));
    if (isNaN(value)) {
      alert("Введите корректную сумму");
      return;
    }
    setSavingBalance(true);
    try {
      const res = await fetchWithTimeout("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openingBalance: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowOpeningBalanceForm(false);
        setOpeningBalanceInput("");
        loadData();
      } else {
        alert(data?.error || "Ошибка сохранения");
      }
    } catch (err) {
      alert(
        err instanceof Error && err.message === "TIMEOUT"
          ? SLOW_SERVER_MSG
          : "Ошибка сети"
      );
    } finally {
      setSavingBalance(false);
    }
  };

  const format = (n: number) => {
    const num = Number(n);
    if (isNaN(num)) return "0.00";
    try {
      return num.toLocaleString("ru-BY", { minimumFractionDigits: 2 });
    } catch {
      return num.toFixed(2);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden bg-[var(--accent-primary)] text-white pt-[env(safe-area-inset-top)] pb-8 px-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E] via-[#0F766E] to-[#134E4A] opacity-95" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative pt-6 pb-4 flex items-center gap-4">
          <img
            src="/icons/icon-192.png"
            alt="MyFin"
            className="w-12 h-12 rounded-[12px] shrink-0 shadow-lg"
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">MyFin</h1>
            <p className="text-white/70 text-sm font-normal mt-0.5">
              Контроль финансов
            </p>
            <p className="text-[10px] tracking-widest uppercase text-white/50 mt-4">
              {new Date().toLocaleDateString("ru-BY", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </header>

      <main className="relative -mt-5 px-4 pb-8">
        <div className="card-elevated p-5 mb-5">
          {loading ? (
            <div className="h-20 animate-pulse bg-[var(--border-subtle)] rounded-[var(--radius-md)]" />
          ) : (
            <>
              <p
                className="text-[11px] font-medium tracking-wider uppercase text-[var(--text-tertiary)] mb-1"
                style={{ letterSpacing: "0.1em" }}
              >
                Текущий баланс
              </p>
              <div className="text-[28px] font-semibold text-[var(--text-primary)] tabular-nums tracking-tight">
                {summary && (
                  <CurrencyConverter
                    amount={Number(summary.totalBalance) || 0}
                    className="text-[28px]"
                  />
                )}
              </div>
              {!showOpeningBalanceForm ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowOpeningBalanceForm(true);
                    setOpeningBalanceInput(
                      String(summary?.openingBalance ?? 0)
                    );
                  }}
                  className="mt-3 text-[13px] text-[var(--accent-primary)] font-medium hover:underline"
                >
                  {summary?.openingBalance
                    ? `Начальный: ${format(summary.openingBalance)} BYN · Изменить`
                    : "+ Указать начальный остаток"}
                </button>
              ) : (
                <div className="mt-4 p-3 rounded-[var(--radius-md)] bg-[var(--bg-base)]">
                  <label className="block text-[11px] text-[var(--text-tertiary)] mb-2">
                    Начальный остаток (BYN)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={openingBalanceInput}
                      onChange={(e) => setOpeningBalanceInput(e.target.value)}
                      className="input-field flex-1"
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={saveOpeningBalance}
                      disabled={savingBalance}
                      className="btn-primary shrink-0 py-3 disabled:opacity-50"
                    >
                      {savingBalance ? "Сохранение…" : "Сохранить"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOpeningBalanceForm(false)}
                      className="px-4 py-3 rounded-[var(--radius-md)] bg-[var(--border-subtle)] text-[var(--text-secondary)] font-medium text-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[var(--border-subtle)]">
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)] font-medium">
                    Доход за месяц
                  </p>
                  <p className="text-base font-semibold text-[var(--accent-income)] tabular-nums mt-0.5">
                    +{summary ? format(summary.income) : "0.00"} BYN
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)] font-medium">
                    Расход за месяц
                  </p>
                  <p className="text-base font-semibold text-[var(--accent-expense)] tabular-nums mt-0.5">
                    −{summary ? format(summary.expenses) : "0.00"} BYN
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-baseline mb-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Последние операции
          </h2>
          <Link
            href="/transactions"
            className="text-[13px] font-medium text-[var(--accent-primary)]"
          >
            Все →
          </Link>
        </div>

        <div className="card divide-y divide-[var(--border-subtle)] overflow-hidden">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse bg-[var(--border-subtle)]/30 m-2 rounded-[var(--radius-sm)]"
                />
              ))}
            </>
          ) : transactions.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--accent-primary-muted)] flex items-center justify-center text-[var(--accent-primary)] text-xl">
                +
              </div>
              <p className="text-[var(--text-secondary)] text-sm">
                Нет операций
              </p>
              <p className="text-[var(--text-tertiary)] text-xs mt-1">
                Добавьте первую запись
              </p>
            </div>
          ) : (
            transactions.map((t) => (
              <Link
                key={t.id}
                href={`/transactions/${t.id}`}
                className="flex items-center gap-4 px-4 py-4 active:bg-[var(--bg-base)] transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--bg-base)] flex items-center justify-center text-lg shrink-0"
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
                  <p className="font-medium text-[var(--text-primary)] truncate">
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
                  </p>
                </div>
                <span
                  className={`font-semibold tabular-nums shrink-0 ${
                    t.type === "INCOME"
                      ? "text-[var(--accent-income)]"
                      : "text-[var(--accent-expense)]"
                  }`}
                >
                  {t.type === "INCOME" ? "+" : "−"}
                  {format(parseFloat(t.amount))} BYN
                </span>
              </Link>
            ))
          )}
        </div>
      </main>

      <AddTransactionButton />
    </div>
  );
}
