import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Permanent_Marker, Inter } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'

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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${permanentMarker.variable} ${inter.variable}`}>
        <head>
          <title>Hustlers Code</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <link rel="icon" href="/icon.png" type="image/png" sizes="any" />
        </head>
        <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <div className="flex min-h-screen flex-col">
              <main className="flex-1 pb-16">{children}</main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

