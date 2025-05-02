import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Permanent_Marker, Inter } from "next/font/google"
import Header from "@/components/header"
import BottomNav from "@/components/bottom-nav"
import { ClerkProvider } from '@clerk/nextjs'
import { PricingProvider } from "@/hooks/use-pricing"

// Configure the fonts
const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-permanent-marker",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <ClerkProvider
      appearance={{
        captcha: {
          theme: 'dark',
          size: 'flexible',
          language: 'en-US',
        }
      }}
      signInFallbackRedirectUrl="/"
    >
      <html lang="en" suppressHydrationWarning className={`${permanentMarker.variable} ${inter.variable}`}>
        <head>
          <title>Hustlers Code</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <PricingProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pb-16">{children}</main>
                <BottomNav />
              </div>
            </PricingProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

