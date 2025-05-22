"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// This is a mock function. Remove and implement real password reset logic using server actions and database lookup.
async function verifySecretAndResetPassword(username: string, secret: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: "Not implemented. Please use the production password reset flow." }
}

export default function ResetPassword() {
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState("")
  const [secret, setSecret] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    // No need to fetch a question, just go to code entry
    setStep(2)
    setLoading(false)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    // Use the Hustler's Code for verification
    const result = await verifySecretAndResetPassword(username, secret, newPassword)
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || "Reset failed")
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center w-full max-w-md">
        <img src="/title-white.png" alt="Hustlers Code" className="w-64 mb-6" />
        <Card className="w-full bg-white/10 border-white text-white shadow-lg">
          <CardContent className="py-8">
            <h1 className="text-3xl font-bold mb-6 text-center font-graffiti">Reset Password</h1>
            {success ? (
              <div className="text-green-400 text-center">Password reset successful! You can now <Link href="/sign-in" className="underline text-white font-bold">Sign In</Link>.</div>
            ) : step === 1 ? (
              <form onSubmit={handleVerify} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  className="bg-black/80 border-white text-white placeholder-white/60"
                />
                <Button type="submit" className="w-full bg-white text-black font-bold hover:bg-white/80" disabled={loading}>
                  {loading ? "Loading..." : "Next"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Hustler's Code"
                  value={secret}
                  onChange={e => setSecret(e.target.value)}
                  required
                  className="bg-black/80 border-white text-white placeholder-white/60"
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="bg-black/80 border-white text-white placeholder-white/60"
                  autoComplete="current-password"
                />
                {error && <div className="text-red-400 text-sm">{error}</div>}
                <Button type="submit" className="w-full bg-white text-black font-bold hover:bg-white/80" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
            <div className="mt-4 text-center text-sm">
              <Link href="/sign-in" className="underline text-white font-bold">Sign In</Link>
            </div>
          </CardContent>
        </Card>
        <img src="/icon.png" alt="Reset Icon" className="w-16 mt-8 opacity-80" />
      </div>
    </div>
  )
}
