import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShareBill — Split Bills, Simplify Debts",
  description: "Premium bill-sharing and debt-simplification app for the Nigerian market.",
};

import StoreProvider from "@/components/providers/StoreProvider";
import { SessionProvider } from "next-auth/react";
import PageTransition from "@/components/PageTransition";
import { ToastProvider } from "@/components/providers/ToastProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <StoreProvider>
            <ToastProvider>
              <PageTransition>{children}</PageTransition>
            </ToastProvider>
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
