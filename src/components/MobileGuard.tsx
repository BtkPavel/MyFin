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
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-pulse text-slate-500">Загрузка...</div>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="text-6xl">📱</div>
          <h1 className="text-2xl font-bold text-slate-800">
            MyFin — мобильное приложение
          </h1>
          <p className="text-slate-600">
            Откройте это приложение на телефоне или планшете. Для лучшего
            опыта добавьте его на главный экран (меню браузера → «Добавить на
            экран»).
          </p>
          <p className="text-sm text-slate-500">
            Или уменьшите окно браузера для тестирования
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
