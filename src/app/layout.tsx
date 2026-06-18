import type { Metadata, Viewport } from "next";
import { Nunito, Fredoka } from "next/font/google";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import "./globals.css";

const nunito = Nunito({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={`min-h-screen bg-background text-foreground ${nunito.variable} ${fredoka.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
