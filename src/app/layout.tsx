import type { Metadata, Viewport } from "next";
import "./globals.css";
import MobileGuard from "@/components/MobileGuard";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "MyFin — Контроль финансов",
  description: "Учёт доходов, расходов, кредитов и резервов",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyFin",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-50 antialiased pb-20">
        <ServiceWorkerRegistration />
        <MobileGuard>
          {children}
          <BottomNav />
        </MobileGuard>
      </body>
    </html>
  );
}
