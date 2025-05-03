import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicPaths = [
  "/sign-in*",
  "/sign-up*",
  "/sign-out*",
  "/api/webhook/clerk*", // Allow Clerk webhooks
  "/api/get-tenant-id*", // Allow tenant ID endpoint
];

const ignoredPaths = [
  "/_next/static/*",
  "/_next/image*",
  "/favicon.ico",
  "/title-*.png",
  "/icon.png",
  "/code.png",
  "/logo.png",
  "/register.jpeg",
];

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const { pathname } = req.nextUrl;

    // Redirect signed-in users away from auth pages
    if (userId && ["/sign-in", "/sign-up", "/sign-out"].some(p => pathname.startsWith(p))) {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }

    // Allow users to visit public routes
    if (publicPaths.some(path => pathname.match(new RegExp(`^${path.replace('*', '.*')}$`)))) {
      return NextResponse.next();
    }

    // Force users to sign in if they're not authenticated
    if (!userId && !ignoredPaths.some(path => pathname.match(new RegExp(`^${path.replace('*', '.*')}$`)))) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }
);

export const config = {
  matcher: [
    "/((?!.*\\.|api|trpc|_next/static|_next/image|favicon.ico).*)",
    "/"
  ],
};