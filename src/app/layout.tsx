import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { SessionProvider } from "@/components/shared/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FamilyHub — Семейная социальная сеть",
    template: "%s | FamilyHub",
  },
  description: "Закрытая семейная платформа. Делитесь событиями, храните воспоминания, планируйте общие дела.",
  keywords: ["семья", "социальная сеть", "семейные события", "архив", "семейное древо"],
  authors: [{ name: "FamilyHub" }],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "FamilyHub",
    title: "FamilyHub — Семейная социальная сеть",
    description: "Закрытая семейная платформа для вашей семьи.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
