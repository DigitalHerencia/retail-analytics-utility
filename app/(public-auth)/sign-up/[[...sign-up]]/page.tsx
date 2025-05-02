"use client"
import { useSignUp } from "@clerk/nextjs"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { saveUserSecret } from "@/app/(root)/actions"

export default function CustomSignUp() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [secretCode, setSecretCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError("")
    try {
      const result = await signUp.create({ username, password })
      await setActive({ session: result.createdSessionId })
      // Save secret code in Neon DB (use secretQuestion as 'code' and secretAnswer as the code value for compatibility)
      await saveUserSecret({ username, secretQuestion: 'code', secretAnswer: secretCode })
      // Optionally redirect here
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign up failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center w-full max-w-md">
        <img src="/title-white.png" alt="Hustlers Code" className="w-64 mb-6" />
        <Card className="w-full bg-white/10 border-white text-white shadow-lg">
          <CardContent className="py-8">
            <h1 className="text-3xl font-bold mb-6 text-center font-graffiti">Sign Up</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="bg-black/80 border-white text-white placeholder-white/60"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-black/80 border-white text-white placeholder-white/60"
                autoComplete="current-password"
              />
              <div>
                <Label htmlFor="secret-code" className="text-white mb-1 block">Secret Code</Label>
                <Input
                  id="secret-code"
                  type="text"
                  placeholder="Enter a secret code (for password reset)"
                  value={secretCode}
                  onChange={e => setSecretCode(e.target.value)}
                  required
                  className="bg-black/80 border-white text-white placeholder-white/60"
                />
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <Button type="submit" className="w-full bg-white text-black font-bold hover:bg-white/80" disabled={loading}>
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <Link href="/sign-in" className="underline text-white font-bold">Sign In</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
