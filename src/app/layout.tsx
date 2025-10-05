import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Weka Hustle Grow - Turn Your Hustle Into A Growing Business",
  description: "Kenyan SaaS platform helping small businesses, hustlers, and artisans find more customers, manage M-Pesa payments, and grow consistently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}