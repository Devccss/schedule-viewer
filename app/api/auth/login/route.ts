import { type NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"

const users = [
  {
    username: process.env.USER1_USERNAME || "afawfawfawfaw",
    password: process.env.USER1_PASSWORD || "agawgawgaw",
  },
  {
    username: process.env.USER2_USERNAME || "user",
    password: process.env.USER2_PASSWORD || "userpassawfawfawfawfawf",
  },
  {
    username: process.env.USER3_USERNAME || "student",
    password: process.env.USER3_PASSWORD || "student123awgawgawgawgawew1r",
  },
].filter((user) => user.username && user.password) // Only include users with both username and password

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this-in-production")

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Find user in environment variables
    const user = users.find((u) => u.username === username && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET)

    return NextResponse.json({ token, username })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
