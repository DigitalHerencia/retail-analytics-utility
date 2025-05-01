"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { loginUser, logoutUser } from "@/app/actions" // We will create this action next

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!username || !password) {
      setError("Please enter both username and password.")
      return
    }

    setIsLoading(true)

    try {
      // We need to implement session handling here or in the action
      const result = await loginUser({ username: username.toLowerCase(), password })

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })
        // Redirect to the main dashboard or home page after login
        router.push("/") // Or wherever authenticated users should go
      } else {
        setError(result.error || "Login failed. Please check your credentials.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred during login.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
             <Button type="submit" className="w-full" disabled={isLoading}>
               {isLoading ? "Logging in..." : "Login"}
             </Button>
             {/* Add link to password reset page */}
             <div className="text-center text-sm">
                <a href="/reset-password" className="underline">
                 Forgot Password?
                </a>
             </div>
             {/* Add link to registration page */}
             <div className="text-center text-sm">
               Don't have an account?{" "}
               <a href="/register" className="underline">
                 Register
               </a>
             </div>
          </CardFooter>
        </form>
        {/* Add a logout button for demonstration (remove or move to header in production) */}
        {/* Optionally, you can add a logout button somewhere in the UI for testing */}
        {/* Example: */}
        {/* <Button onClick={async () => { await logoutUser(); router.push("/login"); }}>Logout</Button> */}
      </Card>
    </div>
  )
}
