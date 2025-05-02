import { NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

// Define public paths that don't require authentication
const publicPaths = [
  "/sign-in*",
  "/sign-up*",
  "/sign-out*",
  "/help*",
  "/api/get-tenant-id*"
];

// Check if the path is public
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => {
    return path.match(new RegExp(`^${publicPath.replace(/\*/g, '.*')}$`));
  });
};

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const isPublic = isPublicPath(pathname);
  
  // For public routes, allow access without authentication
  if (isPublic) {
    return NextResponse.next();
  }
  
  // Handle routing based on authentication status
  const { userId } = await auth.protect();
  
  // If the user is signed in and trying to access a sign-in/sign-up page, 
  // redirect them to the home page
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

// Export Clerk's matcher configuration
export const config = {
  matcher: [
    // Skip Next.js internal routes
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};