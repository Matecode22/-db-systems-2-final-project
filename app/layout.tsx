import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Navigation } from "@/components/navigation"
import { ToastProvider } from "@/components/toast-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trackademic - Gestión de Notas Académicas",
  description: "Sistema para gestionar notas y planes de evaluación universitarios",
  keywords: ["notas", "universidad", "académico", "evaluación", "estudiantes"],
  authors: [{ name: "Trackademic Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" }
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <ToastProvider>
            <Navigation />
            <main className="min-h-screen bg-gray-50">{children}</main>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
