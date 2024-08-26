import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

interface LayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    default: "Omnifunnel",
    template: "%s | Omnifunnel",
  },
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <ClerkProvider>
      <html lang="en">
        <header className="top-10 right-10 absolute"> <SignedOut>
          <SignInButton />
        </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          </header>
        <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
