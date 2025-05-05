"use client"

import { useClerk } from "@clerk/nextjs"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function SignOut() {
  const { signOut } = useClerk()

  useEffect(() => {
    // Remove tenant-specific data before sign out
    if (typeof window !== "undefined") {
      localStorage.removeItem("tenant_id")
    }
    // Clerk signOut with redirect for best UX
    signOut({ redirectUrl: "/sign-in" }).catch(() => {
      // Fallback redirect if Clerk fails
      window.location.replace("/sign-in")
    })
  }, [signOut])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center w-full max-w-md">
        <img src="/title-white.png" alt="Retail Analytics" className="w-64 mb-6" />
        <Card className="w-full bg-white/10 border-white text-white shadow-lg">
          <CardContent className="py-8 text-center">
            <h1 className="text-3xl font-bold mb-6 text-center font-graffiti">Signing Out</h1>
            <p className="text-white" aria-live="polite">Please wait while we sign you out...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}