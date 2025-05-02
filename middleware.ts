import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

// Define public paths that don't require authentication
const publicPaths = [
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sign-out(.*)",
  "/help(.*)",
  "/api/get-tenant-id(.*)"
];

// Check if the path is public
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => {
    const regex = new RegExp(`^${publicPath}$`);
    return regex.test(path);
  });
};

export async function middleware(req: NextRequest) {
  // Get auth information
  const auth = getAuth(req);
  const { pathname } = req.nextUrl;

  // For API calls, handle CORS properly
  if (pathname.startsWith("/api/")) {
    // For OPTIONS requests (CORS preflight), always return 204
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }
  }

  // For protected routes, check if user is signed in
  if (!auth.userId && !isPublicPath(pathname)) {
    // Redirect unauthenticated users to /sign-in
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("returnBackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Otherwise, proceed as normal
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/protected-path/(.*)',
  ],
};