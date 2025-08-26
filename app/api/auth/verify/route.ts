import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this-in-production")

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    return NextResponse.json({
      valid: true,
      username: payload.username,
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token", valid: false }, { status: 401 })
  }
}
