"use client"
import { useSignUp } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Head from "next/head"
import { useRouter, useSearchParams } from "next/navigation"

export default function CustomSignUp() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/'

  // Mount Clerk CAPTCHA widget on load and listen for token
  useEffect(() => {
    function handleCaptchaToken(e: any) {
      setCaptchaToken(e.detail.token)
    }
    if (typeof window !== "undefined" && window.Clerk && window.Clerk.mountCaptcha) {
      window.Clerk.mountCaptcha("#clerk-captcha")
      window.addEventListener("clerk:capture-captcha-token", handleCaptchaToken)
    }
    // Cleanup
    return () => {
      if (typeof window !== "undefined" && window.Clerk && window.Clerk.unmountCaptcha) {
        window.Clerk.unmountCaptcha("#clerk-captcha")
      }
      window.removeEventListener("clerk:capture-captcha-token", handleCaptchaToken)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError("")
    try {
      // Create the user account
      const result = await signUp.create({ 
        username, 
        password
      })
      
      if (result.status === "complete" && result.createdSessionId) {
        // Activate the session
        await setActive({ session: result.createdSessionId })

        try {
          // Trigger onboarding in Neon DB with sensible defaults
          const { saveOnboarding } = await import("@/lib/actions/onboarding");
          const { RISK_MODE_DEFAULTS } = await import("@/features/setup-tab");
          if (typeof result.id === "string" && result.id) {
            await saveOnboarding({
              clerkUserId: result.id,
              username,
              mode: "moderate",
              inventoryQty: 0,
              wholesalePricePerOz: RISK_MODE_DEFAULTS.moderate.wholesalePricePerOz,
              secretCode: password, // Use password as secretCode, or replace with a secure value as needed
            });
          } else {
            console.error("No Clerk user ID returned from signUp.create");
          }
        } catch (onboardingError) {
          console.error("Error saving onboarding data:", onboardingError);
          // Continue anyway as this shouldn't block signup
        }
        
        // Redirect to home page after successful sign-up
        router.push(redirectUrl)
      } else {
        setError("Sign up incomplete. Please try again.")
      }
    } catch (err: any) {
      console.error("Sign-up error:", err)
      setError(err.errors?.[0]?.message || "Sign up failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
                  autoComplete="username"
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
                <div id="clerk-captcha" className="mb-4"></div>
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
    </>
  )
}
