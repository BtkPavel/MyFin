"use client";

import { useEffect, useState } from "react";
import CurrencyConverter from "@/components/CurrencyConverter";
import { fetchWithTimeout, SLOW_SERVER_MSG } from "@/lib/api";

interface Loan {
  id: string;
  name: string;
  type: string;
  totalAmount: string;
  remainingAmount: string;
  monthlyPayment: string;
  startDate: string;
  endDate: string;
  dueDay: number;
  status: string;
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = () => {
    fetch("/api/loans")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => [])
      .then(setLoans)
      .finally(() => setLoading(false));
  };

  const format = (n: number) =>
    n.toLocaleString("ru-BY", { minimumFractionDigits: 2 });

  const progress = (loan: Loan) => {
    const total = parseFloat(loan.totalAmount);
    const remaining = parseFloat(loan.remainingAmount);
    return total > 0 ? ((total - remaining) / total) * 100 : 0;
  };

  return (
    <div className="min-h-screen">
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Кредиты и рассрочки
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Отслеживайте погашение
        </p>
      </header>

      <main className="p-4 pb-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse bg-[var(--border-subtle)]/50 rounded-[var(--radius-lg)]"
              />
            ))}
          </div>
        ) : showForm ? (
          <LoanForm
            onSuccess={() => {
              setShowForm(false);
              loadLoans();
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : loans.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--accent-primary-muted)] flex items-center justify-center text-[var(--accent-primary)] text-2xl">
              ◈
            </div>
            <p className="text-[var(--text-secondary)]">Нет кредитов или рассрочек</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 btn-primary"
            >
              Добавить
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onUpdate={loadLoans}
                format={format}
                progress={progress}
                CurrencyConverter={CurrencyConverter}
              />
            ))}
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-[var(--border-strong)] rounded-[var(--radius-lg)] text-[var(--text-tertiary)] font-medium text-sm"
            >
              + Добавить кредит или рассрочку
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function LoanCard({
  loan,
  onUpdate,
  format,
  progress,
  CurrencyConverter,
}: {
  loan: Loan;
  onUpdate: () => void;
  format: (n: number) => string;
  progress: (l: Loan) => number;
  CurrencyConverter: React.ComponentType<{ amount: number }>;
}) {
  const [showPay, setShowPay] = useState(false);
  const remaining = parseFloat(loan.remainingAmount);
  const prog = progress(loan);

  const recordPayment = async () => {
    const amount = parseFloat(loan.monthlyPayment);
    const newRemaining = Math.max(0, remaining - amount);
    try {
      const res = await fetchWithTimeout(`/api/loans/${loan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remainingAmount: newRemaining,
          status: newRemaining <= 0 ? "PAID" : loan.status,
        }),
      });
      if (res.ok) {
        setShowPay(false);
        onUpdate();
      }
    } catch {
      alert(SLOW_SERVER_MSG);
    }
  };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">{loan.name}</h3>
          <span className="text-[11px] text-[var(--text-tertiary)]">
            {loan.type === "INSTALLMENT" ? "Рассрочка" : "Кредит"}
          </span>
        </div>
        <span
          className={`px-2 py-1 rounded-[var(--radius-sm)] text-[11px] font-medium ${
            loan.status === "PAID"
              ? "bg-[var(--accent-primary-muted)] text-[var(--accent-income)]"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {loan.status === "PAID" ? "Погашен" : "Активен"}
        </span>
      </div>
      <div className="mt-3 h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, prog)}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">
          Осталось: {format(remaining)} BYN
        </span>
        <CurrencyConverter amount={remaining} />
      </div>
      {loan.status !== "PAID" && (
        <button
          onClick={() => setShowPay(!showPay)}
          className="mt-3 w-full py-2.5 bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] rounded-[var(--radius-md)] text-sm font-medium"
        >
          {showPay ? "Отмена" : "Внести платёж"}
        </button>
      )}
      {showPay && (
        <div className="mt-2 p-3 bg-[var(--bg-base)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            Записать платёж {format(parseFloat(loan.monthlyPayment))} BYN?
          </p>
          <div className="flex gap-2">
            <button
              onClick={recordPayment}
              className="flex-1 py-2 btn-primary text-sm"
            >
              Да
            </button>
            <button
              onClick={() => setShowPay(false)}
              className="flex-1 py-2 rounded-[var(--radius-md)] bg-[var(--border-subtle)] text-[var(--text-secondary)] text-sm font-medium"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoanForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"LOAN" | "INSTALLMENT">("LOAN");
  const [totalAmount, setTotalAmount] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dueDay, setDueDay] = useState("15");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !totalAmount || !monthlyPayment || !startDate || !endDate)
      return;
    setSubmitting(true);
    try {
      const res = await fetchWithTimeout("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          totalAmount: parseFloat(totalAmount),
          monthlyPayment: parseFloat(monthlyPayment),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          dueDay: parseInt(dueDay, 10),
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
          placeholder="Кредит на авто, Рассрочка iPhone..."
          required
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Тип
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "LOAN" | "INSTALLMENT")}
          className="input-field"
        >
          <option value="LOAN">Кредит</option>
          <option value="INSTALLMENT">Рассрочка</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Сумма (BYN)
          </label>
          <input
            type="number"
            step="0.01"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Платёж/мес (BYN)
          </label>
          <input
            type="number"
            step="0.01"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Дата начала
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Дата окончания
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          День платежа (1–28)
        </label>
        <input
          type="number"
          min="1"
          max="28"
          value={dueDay}
          onChange={(e) => setDueDay(e.target.value)}
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
