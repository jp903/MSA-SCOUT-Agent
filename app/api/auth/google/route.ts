import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

// JWT decode function (simple implementation)
function decodeJWT(token: string) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format")
    }

    const payload = parts[1]
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString())
    return decoded
  } catch (error) {
    throw new Error("Failed to decode JWT token")
  }
}

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json({ error: "Google credential is required" }, { status: 400 })
    }

    // Decode the JWT token from Google
    const googleUser = decodeJWT(credential)

    console.log("Google user data:", {
      email: googleUser.email,
      name: googleUser.name,
      given_name: googleUser.given_name,
      family_name: googleUser.family_name,
    })

    // Check if user already exists
    let user = await AuthService.findUserByEmail(googleUser.email)

    if (user) {
      // Update existing user with Google ID if not set
      if (!user.google_id) {
        const updatedUser = await AuthService.updateGoogleUser(user.id, {
          google_id: googleUser.sub,
          avatar_url: googleUser.picture,
        })
        user = updatedUser
      }
    } else {
      // Create new user with Google data
      user = await AuthService.createGoogleUser({
        google_id: googleUser.sub,
        email: googleUser.email,
        first_name: googleUser.given_name || googleUser.name?.split(" ")[0] || "User",
        last_name: googleUser.family_name || googleUser.name?.split(" ").slice(1).join(" ") || "",
        avatar_url: googleUser.picture,
      })
    }

    // Create session
    const sessionToken = await AuthService.createSession(user.id)

    console.log("Google auth successful for user:", user.email)

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Signed in with Google successfully",
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

    // Set session cookie
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error: any) {
    console.error("Google auth error:", error)
    return NextResponse.json({ error: error.message || "Failed to authenticate with Google" }, { status: 400 })
  }
}
