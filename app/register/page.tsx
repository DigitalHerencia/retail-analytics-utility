"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast" // Import useToast
import { registerUser } from "@/app/actions" // We will create this action next

// Define the preset secret questions
const secretQuestions = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "In what city were you born?",
  "What is your favorite movie?",
]

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<string>("") // Store index as string for Select
  const [secretAnswer, setSecretAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast() // Initialize toast
  const router = useRouter() // Initialize router

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null) // Clear previous errors

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!username || !password || !selectedQuestionIndex || !secretAnswer) {
      setError("Please fill in all fields.")
      return
    }

    setIsLoading(true)

    try {
      const result = await registerUser({
        username,
        password,
        secretQuestionIndex: parseInt(selectedQuestionIndex, 10), // Convert back to number
        secretAnswer,
      })

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "You can now log in.",
        })
        // Redirect to login page (assuming it will be '/login')
        router.push("/login")
      } else {
        setError(result.error || "Registration failed.")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred during registration.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())} // Store username in lowercase
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret-question">Secret Question</Label>
              <Select
                value={selectedQuestionIndex}
                onValueChange={setSelectedQuestionIndex}
                required
                disabled={isLoading}
              >
                <SelectTrigger id="secret-question">
                  <SelectValue placeholder="Select a question" />
                </SelectTrigger>
                <SelectContent>
                  {secretQuestions.map((question, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {question}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret-answer">Secret Answer</Label>
              <Input
                id="secret-answer"
                type="password" // Use password type to obscure the answer
                value={secretAnswer}
                onChange={(e) => setSecretAnswer(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </CardFooter>
        </form>
        {/* Add link to login page */}
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="underline">
            Login
          </a>
        </div>
      </Card>
    </div>
  )
}
