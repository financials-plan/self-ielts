import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import { ToastProvider } from "@/components/lucian/ToastProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display-montserrat",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Self-IELTS — Tự học IELTS 4 kỹ năng theo khung KSA",
  description:
    "Nền tảng học IELTS Academic & General Training (Listening, Reading, Writing, Speaking) theo khung KSA: Knowledge, Skills và Attitudes, miễn phí 100% với Hybrid BYOK.",
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('self_ielts_theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="ux min-h-screen antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
