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
  try {
    return publicPaths.some(publicPath => {
      const regex = new RegExp(`^${publicPath}$`);
      return regex.test(path);
    });
  } catch (error) {
    console.error("Error matching public path:", error);
    // Default to treating as non-public in case of regex error
    return false;
  }
};

export async function middleware(req: NextRequest) {
  try {
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

    // Skip auth check for public paths to avoid unnecessary Clerk API calls
    if (isPublicPath(pathname)) {
      return NextResponse.next();
    }

    // Get auth information - only do this after the public path check
    try {
      const auth = getAuth(req);
      
      // For protected routes, check if user is signed in
      if (!auth.userId) {
        // Redirect unauthenticated users to /sign-in
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("returnBackUrl", req.url);
        return NextResponse.redirect(signInUrl);
      }
    } catch (authError) {
      console.error("Authentication error:", authError);
      // Redirect to sign-in page on auth error
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Otherwise, proceed as normal
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // In case of any error, let the request proceed to allow the application to handle it
    return NextResponse.next();
  }
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