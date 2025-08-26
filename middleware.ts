import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this-in-production")

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log("[MIDDLEWARE] pathname:", pathname)

  // Allow access to login page and API routes
  if (pathname === "/login" || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Check for auth token in cookies or Authorization header
  let token = request.cookies.get("auth-token")?.value

  if (!token) {
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }
  }

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify the JWT token
    await jwtVerify(token, JWT_SECRET)

    // Token is valid, allow the request to continue
    return NextResponse.next()
  } catch (error) {
    // Token is invalid, redirect to login
    const loginUrl = new URL("/login", request.url)
    const response = NextResponse.redirect(loginUrl)

    // Clear the invalid token cookie
    response.cookies.delete("auth-token")

    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
