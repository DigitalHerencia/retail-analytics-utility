"use client"

import { useClerk } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

export default function SignOut() {
  const { signOut } = useClerk()
  const router = useRouter()

  useEffect(() => {
    // Use Clerk's recommended signOut with redirectUrl for reliable redirect
    const performSignOut = async () => {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("tenant_id")
        }
        await signOut({ redirectUrl: "/sign-in" })
      } catch (error) {
        // Fallback: redirect manually if Clerk signOut fails
        window.location.replace("/sign-in")
      }
    }
    performSignOut()
  }, [signOut, router])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center w-full max-w-md">
        <img src="/title-white.png" alt="Retail Analytics" className="w-64 mb-6" />
        <Card className="w-full bg-white/10 border-white text-white shadow-lg">
          <CardContent className="py-8 text-center">
            <h1 className="text-3xl font-bold mb-6 text-center font-graffiti">Signing Out</h1>
            <p className="text-white">Please wait while we sign you out...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}