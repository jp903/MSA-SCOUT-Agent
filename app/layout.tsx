import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientWrapper } from "@/components/client-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MSASCOUT - Property Investment Agent",
  description: "AI-powered property investment analysis and market insights",
  icons: {
    icon: "/images/msascout-logo.png",
    shortcut: "/images/msascout-logo.png",
    apple: "/images/msascout-logo.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}
