import { Inter } from "next/font/google"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ClientLayout } from "@/features/client-layout"
import "./globals.css"
import { getBusinessData } from "@/lib/fetchers"

const inter = Inter({ subsets: ["latin"] })

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  // Fetch business data server-side
  const { businessData } = await getBusinessData(userId)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout businessData={businessData}>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}

