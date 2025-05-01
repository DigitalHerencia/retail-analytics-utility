// app/register/page.tsx
"use client"
import { SignUp } from "@clerk/nextjs"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp routing="path" path="/register" signInUrl="/login" />
    </div>
  )
}
