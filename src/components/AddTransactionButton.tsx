"use client";

import Link from "next/link";

export default function AddTransactionButton() {
  return (
    <Link
      href="/transactions/new"
      className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-lg active:scale-95 transition-transform z-40"
      aria-label="Добавить операцию"
    >
      +
    </Link>
  );
}
