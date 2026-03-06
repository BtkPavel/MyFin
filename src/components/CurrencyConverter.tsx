"use client";

import { useEffect, useState } from "react";

interface CurrencyConverterProps {
  amount: number;
  className?: string;
}

const safeFormat = (n: unknown): string => {
  const num = Number(n);
  if (isNaN(num)) return "0.00";
  try {
    return num.toLocaleString("ru-BY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return num.toFixed(2);
  }
};

export default function CurrencyConverter({
  amount,
  className = "",
}: CurrencyConverterProps) {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const [rates, setRates] = useState<{ USD?: number; RUB?: number }>({});
  const [show, setShow] = useState<"BYN" | "USD" | "RUB">("BYN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data) => (data?.error ? {} : data))
      .then(setRates)
      .catch(() => setRates({}))
      .finally(() => setLoading(false));
  }, []);

  const usdAmount = rates.USD ? safeAmount / rates.USD : null;
  const rubAmount = rates.RUB ? safeAmount / rates.RUB : null;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="font-semibold tabular-nums">
        {show === "BYN" && `${safeFormat(safeAmount)} BYN`}
        {show === "USD" && usdAmount != null && `$${safeFormat(usdAmount)}`}
        {show === "RUB" && rubAmount != null && `${safeFormat(rubAmount)} ₽`}
      </span>
      <div className="flex gap-1 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)]">
        {(["BYN", "USD", "RUB"] as const).map((curr) => {
          const disabled =
            (curr === "USD" && (loading || usdAmount == null)) ||
            (curr === "RUB" && (loading || rubAmount == null));
          return (
            <button
              key={curr}
              type="button"
              onClick={() => setShow(curr)}
              disabled={disabled}
              className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                show === curr
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-base)] disabled:opacity-40"
              }`}
            >
              {curr}
            </button>
          );
        })}
      </div>
    </div>
  );
}
