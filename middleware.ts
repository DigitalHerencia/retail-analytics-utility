import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Custom middleware to allow public access to /login, /register, /help, and enforce auth elsewhere
export default clerkMiddleware(async (auth, req) => {
  const publicPaths = ["/login", "/register", "/help"];
  const { pathname } = req.nextUrl;

  // Allow public access to publicPaths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Await the auth object
  const authObj = await auth();
  if (!authObj.userId) {
    // Redirect unauthenticated users to /login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("returnBackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise, proceed as normal
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',

    '/protected-path/(.*)',
  ],
};