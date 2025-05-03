"use client"

import { Header } from "../components/header"
import { BottomNav } from "../components/bottom-nav"
import { ThemeProvider } from "../components/theme-provider"
import type { BusinessData } from "@/types"
interface ClientLayoutProps {
  businessData?: BusinessData;
  children: React.ReactNode;
}

export function ClientLayout({ businessData, children }: ClientLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <Header />
        <main className="container pb-20">{children}</main>
        <BottomNav businessData={businessData} />
      </div>
    </ThemeProvider>
  )
}