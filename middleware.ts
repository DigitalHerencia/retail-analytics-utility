import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const PUBLIC_PATHS = ["/login", "/register", "/help", "/favicon.ico", "/icon.png", "/logo.png", "/_next"]
const SECRET = process.env.AUTH_SECRET || "dev-secret-key-change-me"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }
  const token = req.cookies.get("auth_token")?.value
  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }
  try {
    await jwtVerify(token, new TextEncoder().encode(SECRET))
    return NextResponse.next()
  } catch {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|icon.png|logo.png).*)"],
}
