"use client";

import { useEffect, useState } from "react";
import CurrencyConverter from "@/components/CurrencyConverter";

interface Reservation {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline?: string;
  currency: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = () => {
    fetch("/api/reservations")
      .then((r) => r.json())
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const format = (n: number) =>
    n.toLocaleString("ru-BY", { minimumFractionDigits: 2 });

  const progress = (r: Reservation) => {
    const target = parseFloat(r.targetAmount);
    const current = parseFloat(r.currentAmount);
    return target > 0 ? (current / target) * 100 : 0;
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 px-4 py-4 safe-area-pt">
        <h1 className="text-xl font-bold text-slate-800">
          Резервы и цели
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Откладывайте деньги под конкретные цели
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
          <ReservationForm
            onSuccess={() => {
              setShowForm(false);
              loadReservations();
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-4xl mb-4">🎯</p>
            <p>Нет резервов</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl"
            >
              Создать резерв
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onUpdate={loadReservations}
                format={format}
                progress={progress}
                CurrencyConverter={CurrencyConverter}
              />
            ))}
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium"
            >
              + Создать резерв
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ReservationCard({
  reservation,
  onUpdate,
  format,
  progress,
  CurrencyConverter,
}: {
  reservation: Reservation;
  onUpdate: () => void;
  format: (n: number) => string;
  progress: (r: Reservation) => number;
  CurrencyConverter: React.ComponentType<{ amount: number }>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const current = parseFloat(reservation.currentAmount);
  const target = parseFloat(reservation.targetAmount);
  const prog = progress(reservation);

  const addToReserve = async () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) return;
    const res = await fetch(`/api/reservations/${reservation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentAmount: current + amount,
      }),
    });
    if (res.ok) {
      setShowAdd(false);
      setAddAmount("");
      onUpdate();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-semibold text-slate-800">{reservation.name}</h3>
      {reservation.deadline && (
        <p className="text-xs text-slate-500 mt-0.5">
          До: {new Date(reservation.deadline).toLocaleDateString("ru-BY")}
        </p>
      )}
      <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${Math.min(100, prog)}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span className="text-slate-600">
          {format(current)} / {format(target)} BYN
        </span>
        <CurrencyConverter amount={current} />
      </div>
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="mt-3 w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium"
      >
        {showAdd ? "Отмена" : "Пополнить"}
      </button>
      {showAdd && (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg">
          <input
            type="number"
            step="0.01"
            placeholder="Сумма"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={addToReserve}
              disabled={!addAmount || parseFloat(addAmount) <= 0}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50"
            >
              Добавить
            </button>
            <button
              onClick={() => setShowAdd(false)}
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

function ReservationForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    setSubmitting(true);
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline || undefined,
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
          Название цели
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200"
          placeholder="Отпуск, Ремонт, Ноутбук..."
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Целевая сумма (BYN)
        </label>
        <input
          type="number"
          step="0.01"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Срок (необязательно)
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
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
          {submitting ? "Сохранение..." : "Создать"}
        </button>
      </div>
    </form>
  );
}
