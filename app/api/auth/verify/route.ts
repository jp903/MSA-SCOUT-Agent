import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Auth verification request received")

    // Get session token from cookie
    const sessionToken = request.cookies.get("session_token")?.value
    console.log("Session token from cookie:", sessionToken ? "present" : "missing")

    const response = NextResponse.json({ valid: false, user: null }) // Create a response object to pass to verifySession
    if (!sessionToken) {
      console.log("No session token found in cookies")
      return response
    }

    // Verify session
    const user = await AuthService.verifySession(sessionToken, response) // Pass the response object
    console.log("Session verification result:", user ? "valid user found" : "invalid session")

    if (!user) {
      console.log("Session token is invalid or expired")
      return NextResponse.json({ valid: false, user: null })
    }

    console.log("Session verified successfully for user:", user.email)
    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        company: user.company,
        avatarUrl: user.avatar_url,
      },
    })
  } catch (error: any) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ valid: false, user: null }, { status: 500 })
  }
}
