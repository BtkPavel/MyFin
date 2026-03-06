import type { Metadata, Viewport } from "next";
import "./globals.css";
import MobileGuard from "@/components/MobileGuard";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "MyFin — Контроль финансов",
  description: "Учёт доходов, расходов, кредитов и резервов",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
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
  themeColor: "#0F766E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#FAFAF9] antialiased pb-20" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
        <ErrorBoundary>
          <ServiceWorkerRegistration />
          <MobileGuard>
            {children}
            <BottomNav />
          </MobileGuard>
        </ErrorBoundary>
      </body>
    </html>
  );
}
