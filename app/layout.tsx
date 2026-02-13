import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AuthProvider } from "@/lib/auth"
import { ErrorBoundary } from "@/components/error-boundary"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "SecureForce - Security Manpower Management",
  description:
    "Enterprise security manpower management system. Manage employees, designations, departments, locations, and generate ID cards.",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster position="top-right" richColors />
        </ErrorBoundary>
        <SpeedInsights />
      </body>
    </html>
  )
}

