import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const SECRET = process.env.AUTH_SECRET || "dev-secret-key-change-me"
const COOKIE_NAME = "auth_token"
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

export async function createSession(username: string) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(SECRET))
  ;(await cookies()).set(COOKIE_NAME, token, COOKIE_OPTIONS)
}

export async function destroySession() {
  (await cookies()).set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 })
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET))
    return payload as { username: string }
  } catch {
    return null
  }
}
