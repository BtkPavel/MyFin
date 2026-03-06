"use client";

import Link from "next/link";

export default function AddTransactionButton() {
  return (
    <Link
      href="/transactions/new"
      className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-light transition-all duration-250 active:scale-95 hover:scale-105"
      style={{
        background: "var(--accent-primary)",
        color: "white",
        boxShadow:
          "0 4px 14px rgba(15, 118, 110, 0.4), 0 1px 3px rgba(0,0,0,0.08)",
      }}
      aria-label="Добавить операцию"
    >
      +
    </Link>
  );
}
