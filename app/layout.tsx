import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MSASCOUT AI - Property Investment Agent",
  description: "AI-powered investment analysis and portfolio management",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-y-auto`}>
        <div className="min-h-full">{children}</div>
      </body>
    </html>
  )
}
