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
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Резервы и цели
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Откладывайте деньги под конкретные цели
        </p>
      </header>

      <main className="p-4 pb-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse bg-[var(--border-subtle)]/50 rounded-[var(--radius-lg)]"
              />
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
          <div className="card p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--accent-primary-muted)] flex items-center justify-center text-[var(--accent-primary)] text-2xl">
              ◎
            </div>
            <p className="text-[var(--text-secondary)]">Нет резервов</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 btn-primary"
            >
              Создать резерв
            </button>
          </div>
        ) : (
          <div className="space-y-3">
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
              className="w-full py-3 border-2 border-dashed border-[var(--border-strong)] rounded-[var(--radius-lg)] text-[var(--text-tertiary)] font-medium text-sm"
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
    <div className="card p-4">
      <h3 className="font-semibold text-[var(--text-primary)]">{reservation.name}</h3>
      {reservation.deadline && (
        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
          До: {new Date(reservation.deadline).toLocaleDateString("ru-BY")}
        </p>
      )}
      <div className="mt-3 h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, prog)}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">
          {format(current)} / {format(target)} BYN
        </span>
        <CurrencyConverter amount={current} />
      </div>
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="mt-3 w-full py-2.5 bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] rounded-[var(--radius-md)] text-sm font-medium"
      >
        {showAdd ? "Отмена" : "Пополнить"}
      </button>
      {showAdd && (
        <div className="mt-2 p-3 bg-[var(--bg-base)] rounded-[var(--radius-md)]">
          <input
            type="number"
            step="0.01"
            placeholder="Сумма"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            className="input-field mb-2 py-2.5"
          />
          <div className="flex gap-2">
            <button
              onClick={addToReserve}
              disabled={!addAmount || parseFloat(addAmount) <= 0}
              className="flex-1 py-2 btn-primary text-sm disabled:opacity-50"
            >
              Добавить
            </button>
            <button
              onClick={() => setShowAdd(false)}
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
        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Название цели
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="Отпуск, Ремонт, Ноутбук..."
          required
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Целевая сумма (BYN)
        </label>
        <input
          type="number"
          step="0.01"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Срок (необязательно)
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
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
          {submitting ? "Сохранение..." : "Создать"}
        </button>
      </div>
    </form>
  );
}
