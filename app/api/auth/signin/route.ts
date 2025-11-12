import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("Signin attempt for email:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = await AuthService.signIn({ email, password })

    console.log("Signin successful for user:", result.user.email)

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.first_name,
        lastName: result.user.last_name,
        phone: result.user.phone,
        company: result.user.company,
        avatarUrl: result.user.avatar_url,
      },
    })

    // Set session cookie
    response.cookies.set("session_token", result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set secure to true only in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error: any) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: error.message || "Failed to sign in" }, { status: 400 })
  }
}
