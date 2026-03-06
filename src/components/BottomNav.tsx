"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Обзор", icon: "◇" },
  { href: "/transactions", label: "Операции", icon: "▤" },
  { href: "/loans", label: "Кредиты", icon: "◈" },
  { href: "/subscriptions", label: "Подписки", icon: "◎" },
  { href: "/reservations", label: "Резервы", icon: "◆" },
];

const tabIcons = ["📊", "📝", "💳", "📅", "🎯"];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <div className="flex justify-around items-stretch h-14">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 transition-all duration-200 ${
                isActive
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--text-tertiary)]"
              }`}
            >
              <span
                className={`text-xl font-normal transition-transform ${
                  isActive ? "scale-110" : ""
                }`}
              >
                {tabIcons[tabs.indexOf(tab)]}
              </span>
              <span className="text-[10px] font-medium tracking-wide">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
