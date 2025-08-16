import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value

    if (sessionToken) {
      await AuthService.signOut(sessionToken)
    }

    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully",
    })

    // Clear session cookie
    response.cookies.delete("session_token")

    return response
  } catch (error: any) {
    console.error("Signout error:", error)

    // Still clear the cookie even if there's an error
    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully",
    })

    response.cookies.delete("session_token")
    return response
  }
}
