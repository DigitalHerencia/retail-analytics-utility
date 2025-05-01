// app/register/page.tsx
"use client"
import { SignUp as ClerkSignUp } from "@clerk/nextjs"

export default function SignUp() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ClerkSignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  )
}
