"use client";

import { useEffect, useState } from "react";

interface CurrencyConverterProps {
  amount: number;
  className?: string;
}

export default function CurrencyConverter({ amount, className = "" }: CurrencyConverterProps) {
  const [rates, setRates] = useState<{ USD?: number; RUB?: number }>({});
  const [show, setShow] = useState<"BYN" | "USD" | "RUB">("BYN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then(setRates)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const usdAmount = rates.USD ? amount / rates.USD : null;
  const rubAmount = rates.RUB ? amount / rates.RUB : null;

  const format = (n: number) =>
    n.toLocaleString("ru-BY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="font-semibold">
        {show === "BYN" && `${format(amount)} BYN`}
        {show === "USD" && usdAmount != null && `$${format(usdAmount)}`}
        {show === "RUB" && rubAmount != null && `${format(rubAmount)} ₽`}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setShow("BYN")}
          className={`px-2 py-0.5 rounded text-sm ${
            show === "BYN"
              ? "bg-emerald-600 text-white"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          BYN
        </button>
        <button
          type="button"
          onClick={() => setShow("USD")}
          disabled={loading || usdAmount == null}
          className={`px-2 py-0.5 rounded text-sm ${
            show === "USD"
              ? "bg-emerald-600 text-white"
              : "bg-slate-200 text-slate-600 disabled:opacity-50"
          }`}
        >
          USD
        </button>
        <button
          type="button"
          onClick={() => setShow("RUB")}
          disabled={loading || rubAmount == null}
          className={`px-2 py-0.5 rounded text-sm ${
            show === "RUB"
              ? "bg-emerald-600 text-white"
              : "bg-slate-200 text-slate-600 disabled:opacity-50"
          }`}
        >
          RUB
        </button>
      </div>
    </div>
  );
}
