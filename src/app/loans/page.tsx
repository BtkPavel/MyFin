"use client";

import { useEffect, useState } from "react";
import CurrencyConverter from "@/components/CurrencyConverter";

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
      .then(setLoans)
      .catch(console.error)
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
      <header className="bg-white border-b border-slate-200 px-4 py-4 safe-area-pt">
        <h1 className="text-xl font-bold text-slate-800">Кредиты и рассрочки</h1>
        <p className="text-sm text-slate-500 mt-1">
          Отслеживайте погашение
        </p>
      </header>

      <main className="p-4 pb-8">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl" />
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
          <div className="text-center py-12 text-slate-500">
            <p className="text-4xl mb-4">💳</p>
            <p>Нет кредитов или рассрочек</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl"
            >
              Добавить
            </button>
          </div>
        ) : (
          <div className="space-y-4">
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
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium"
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
    const res = await fetch(`/api/loans/${loan.id}`, {
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
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-800">{loan.name}</h3>
          <span className="text-xs text-slate-500">
            {loan.type === "INSTALLMENT" ? "Рассрочка" : "Кредит"}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            loan.status === "PAID"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {loan.status === "PAID" ? "Погашен" : "Активен"}
        </span>
      </div>
      <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${Math.min(100, prog)}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span className="text-slate-500">
          Осталось: {format(remaining)} BYN
        </span>
        <CurrencyConverter amount={remaining} />
      </div>
      {loan.status !== "PAID" && (
        <button
          onClick={() => setShowPay(!showPay)}
          className="mt-3 w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium"
        >
          {showPay ? "Отмена" : "Внести платёж"}
        </button>
      )}
      {showPay && (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600 mb-2">
            Записать платёж {format(parseFloat(loan.monthlyPayment))} BYN?
          </p>
          <div className="flex gap-2">
            <button
              onClick={recordPayment}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm"
            >
              Да
            </button>
            <button
              onClick={() => setShowPay(false)}
              className="flex-1 py-2 bg-slate-200 rounded-lg text-sm"
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
    const res = await fetch("/api/loans", {
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
    setSubmitting(false);
    if (res.ok) onSuccess();
    else alert("Ошибка при сохранении");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Название
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200"
          placeholder="Кредит на авто, Рассрочка iPhone..."
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Тип
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "LOAN" | "INSTALLMENT")}
          className="w-full px-4 py-3 rounded-xl border border-slate-200"
        >
          <option value="LOAN">Кредит</option>
          <option value="INSTALLMENT">Рассрочка</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Сумма (BYN)
          </label>
          <input
            type="number"
            step="0.01"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Платёж/мес (BYN)
          </label>
          <input
            type="number"
            step="0.01"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Дата начала
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Дата окончания
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          День платежа (1–28)
        </label>
        <input
          type="number"
          min="1"
          max="28"
          value={dueDay}
          onChange={(e) => setDueDay(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-100 rounded-xl font-medium"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-50"
        >
          {submitting ? "Сохранение..." : "Добавить"}
        </button>
      </div>
    </form>
  );
}
