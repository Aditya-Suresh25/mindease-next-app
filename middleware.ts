import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/settings",
  "/history",
  "/reflections",
  "/resources",
  "/stories",
  "/therapy",
];

// Routes that are only for unauthenticated users
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies
  // Check next-auth session tokens (for Google OAuth)
  const nextAuthToken = request.cookies.get("next-auth.session-token")?.value 
    || request.cookies.get("__Secure-next-auth.session-token")?.value;
  
  // Check custom auth-token cookie (for email/password login)
  const customAuthToken = request.cookies.get("auth-token")?.value;

  // Check if user has an active session (either next-auth or custom token)
  const hasSession = !!nextAuthToken || !!customAuthToken;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    // Store the intended destination for redirect after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth routes to dashboard
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|music).*)",
  ],
};
