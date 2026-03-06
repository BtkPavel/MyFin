"use client";

import { useEffect, useState } from "react";

interface CurrencyConverterProps {
  amount: number;
  fromCurrency?: "BYN" | "USD" | "RUB";
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
  fromCurrency = "BYN",
  className = "",
}: CurrencyConverterProps) {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const [rates, setRates] = useState<{ USD?: number; RUB?: number }>({});
  const [show, setShow] = useState<"BYN" | "USD" | "RUB">(fromCurrency);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data) => (data?.error ? {} : data))
      .then(setRates)
      .catch(() => setRates({}))
      .finally(() => setLoading(false));
  }, []);

  const bynAmount =
    fromCurrency === "BYN"
      ? safeAmount
      : fromCurrency === "USD" && rates.USD
        ? safeAmount * rates.USD
        : fromCurrency === "RUB" && rates.RUB
          ? safeAmount * rates.RUB
          : null;
  const usdAmount =
    fromCurrency === "USD"
      ? safeAmount
      : fromCurrency === "BYN" && rates.USD
        ? safeAmount / rates.USD
        : fromCurrency === "RUB" && rates.RUB && rates.USD
          ? (safeAmount * rates.RUB) / rates.USD
          : null;
  const rubAmount =
    fromCurrency === "RUB"
      ? safeAmount
      : fromCurrency === "BYN" && rates.RUB
        ? safeAmount / rates.RUB
        : fromCurrency === "USD" && rates.USD && rates.RUB
          ? (safeAmount * rates.USD) / rates.RUB
          : null;

  const displayByn = bynAmount != null;
  const displayUsd = usdAmount != null;
  const displayRub = rubAmount != null;

  const fallback =
    fromCurrency === "USD"
      ? `$${safeFormat(safeAmount)}`
      : fromCurrency === "RUB"
        ? `${safeFormat(safeAmount)} ₽`
        : `${safeFormat(safeAmount)} BYN`;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="font-semibold tabular-nums shrink-0">
        {show === "BYN" && (displayByn ? `${safeFormat(bynAmount)} BYN` : fallback)}
        {show === "USD" && (displayUsd ? `$${safeFormat(usdAmount)}` : fallback)}
        {show === "RUB" && (displayRub ? `${safeFormat(rubAmount)} ₽` : fallback)}
      </span>
      <div className="flex gap-1 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)] shrink-0">
        {(["BYN", "USD", "RUB"] as const).map((curr) => {
          const disabled =
            (curr === "BYN" && !displayByn) ||
            (curr === "USD" && (loading || !displayUsd)) ||
            (curr === "RUB" && (loading || !displayRub));
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
