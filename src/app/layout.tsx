import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import AutumnProvider from "@/lib/autumn-provider"
import Script from "next/script"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Weka - Grow Your Hustle",
  description: "Kenya's most trusted platform for hustlers to find customers and grow their business",
  manifest: "/manifest.json",
  themeColor: "#2ecc71",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Weka"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AutumnProvider>
          {children}
          <Toaster />
        </AutumnProvider>
        
        {/* PWA Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('Service Worker registered'))
                  .catch(err => console.log('Service Worker registration failed:', err));
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}