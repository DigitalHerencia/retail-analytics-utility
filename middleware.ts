import { NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

// Define public routes (no auth required)
const publicRoutes = [
  "/sign-in",
  "/sign-up",
  "/sign-out",
  "/help",
  "/api/get-tenant-id",
  "/api/webhook",
  // Add more public API routes as needed
];

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const authObject = await auth();
  const userId = authObject.userId;

  // Redirect signed-in users away from auth pages
  if (userId && ["/sign-in", "/sign-up", "/sign-out"].some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Authenticated and not on an auth page: allow
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};