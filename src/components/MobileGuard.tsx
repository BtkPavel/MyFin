"use client";

import { useEffect, useState } from "react";

export default function MobileGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const check = () => {
        const isNarrow = typeof window !== "undefined" && window.innerWidth <= 768;
        const isTouch = typeof window !== "undefined" && "ontouchstart" in window;
        setIsMobile(isNarrow || isTouch);
      };
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    } catch {
      setIsMobile(true);
    }
  }, []);

  if (isMobile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#A8A29E] text-sm">Загрузка</p>
        </div>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FAFAF9]">
        <div className="max-w-sm text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#CCFBF1] flex items-center justify-center text-[#0F766E] text-4xl">
            ◆
          </div>
          <h1 className="text-2xl font-semibold text-[#1C1917] tracking-tight">
            MyFin
          </h1>
          <p className="mt-2 text-[#78716C] leading-relaxed">
            Откройте приложение на телефоне для лучшего опыта. Добавьте на
            главный экран через меню браузера.
          </p>
          <p className="mt-4 text-[11px] text-[#A8A29E]">
            Или уменьшите окно для тестирования
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
