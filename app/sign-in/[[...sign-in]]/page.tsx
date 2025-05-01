"use client"
import { SignIn } from "@clerk/nextjs"

export default function Signin() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn routing="path" path="/login" signUpUrl="/register" />
    </div>
  )
}