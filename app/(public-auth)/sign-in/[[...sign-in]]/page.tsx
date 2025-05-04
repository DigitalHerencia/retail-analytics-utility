"use client"
import { useSignIn } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Head from "next/head"
import { useRouter, useSearchParams } from "next/navigation"

// Add a type declaration for window.Clerk to avoid TypeScript errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    Clerk?: any;
  }
}

export default function CustomSignIn() {
  const { signIn, setActive, isLoaded } = useSignIn()
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
      setCaptchaToken(e.detail.token);
    }
    if (typeof window !== "undefined" && window.Clerk && window.Clerk.mountCaptcha) {
      window.Clerk.mountCaptcha("#clerk-captcha");
      window.addEventListener("clerk:capture-captcha-token", handleCaptchaToken);
    }
    // Cleanup
    return () => {
      if (typeof window !== "undefined" && window.Clerk && window.Clerk.unmountCaptcha) {
        window.Clerk.unmountCaptcha("#clerk-captcha");
      }
      window.removeEventListener("clerk:capture-captcha-token", handleCaptchaToken);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError("")
    try {
      // Simplified approach - don't specify strategy unless specifically required by your Clerk setup
      const result = await signIn.create({
        identifier: username,
        password
      })
      
      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId })
        
        try {
          // Fetch tenant_id for the user from the database with better error handling
          const res = await fetch("/api/get-tenant-id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username })
          })
          
          if (res.ok) {
            const data = await res.json()
            if (data.tenant_id) {
              localStorage.setItem("tenant_id", data.tenant_id)
            }
          } else {
            console.error("Failed to fetch tenant_id:", await res.text())
            // Continue anyway, as this shouldn't block login
          }
        } catch (apiError) {
          console.error("API error:", apiError)
          // Continue anyway, as this shouldn't block login
        }
        
        // Redirect to the target URL
        router.push(redirectUrl)
      } else if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
        setError("Additional authentication required. Please check your email or phone.")
      } else {
        setError("Sign in incomplete. Please try again.")
      }
    } catch (err: any) {
      console.error("Sign-in error:", err)
      setError(err.errors?.[0]?.message || "Sign in failed")
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
              <h1 className="text-3xl font-bold mb-6 text-center font-graffiti">Sign In</h1>
              {/* Clerk CAPTCHA element for bot protection */}
              <div id="clerk-captcha" style={{ marginBottom: '1rem' }} />
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
                {error && <div className="text-red-400 text-sm">{error}</div>}
                <Button type="submit" className="w-full bg-white text-black font-bold hover:bg-white/80" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                <Link href="/sign-up" className="underline text-white font-bold">Sign Up</Link> | <Link href="/reset-password" className="underline text-white font-bold">Forgot Password?</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}