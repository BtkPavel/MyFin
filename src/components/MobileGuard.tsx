"use client";

import { useEffect, useState } from "react";

export default function MobileGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const isNarrow = window.innerWidth <= 768;
      const isTouch = "ontouchstart" in window;
      setIsMobile(isNarrow || isTouch);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-tertiary)] text-sm">Загрузка</p>
        </div>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--bg-base)]">
        <div className="max-w-sm text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--accent-primary-muted)] flex items-center justify-center text-[var(--accent-primary)] text-4xl">
            ◆
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            MyFin
          </h1>
          <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
            Откройте приложение на телефоне для лучшего опыта. Добавьте на
            главный экран через меню браузера.
          </p>
          <p className="mt-4 text-[11px] text-[var(--text-tertiary)]">
            Или уменьшите окно для тестирования
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
