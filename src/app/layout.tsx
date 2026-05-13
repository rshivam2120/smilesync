import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FloatingAiChat } from "@/components/FloatingAiChat";
import { Footer, Navbar } from "@/components/ui-kit";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmileSync | Premium Dental SaaS Platform",
  description: "Futuristic dental clinic platform with AI diagnostics, scheduling, dashboards, and memberships.",
  metadataBase: new URL("https://smilesync.app"),
  openGraph: {
    title: "SmileSync",
    description: "Premium dental SaaS platform",
    url: "https://smilesync.app",
    siteName: "SmileSync",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-linear-to-b from-slate-100 to-slate-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <PwaRegister />
          <Navbar />
          <main className="min-h-[80vh]">{children}</main>
          <Footer />
          <FloatingAiChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
