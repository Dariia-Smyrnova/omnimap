import type { Metadata } from "next";
import "./globals.css";

import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

interface LayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    default: "TypeScript Next.js Stripe Example",
    template: "%s | Next.js + TypeScript Example",
  },
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}>
          {children}
      </body>
    </html>
  );
}
