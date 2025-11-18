import { type NextRequest, NextResponse } from "next/server"
import { chatManagerDB } from "@/lib/chat-manager-db"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Extract session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value
    const response = NextResponse.json({}) // Create a response object to pass to verifySession
    console.log("API /chat-history GET: sessionToken =", sessionToken ? "present" : "absent")

    let userId = null;
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken, response); // Pass the response object
      if (user) {
        userId = user.id;
        console.log("API /chat-history GET: userId from session =", userId)
      } else {
        console.log("API /chat-history GET: session token invalid, userId is null")
      }
    } else {
      console.log("API /chat-history GET: no session token, userId is null")
    }

    const chatHistory = await chatManagerDB.getAllChats(userId)
    // Create a new response with the actual data instead of trying to modify the existing one
    return NextResponse.json(chatHistory)
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value
    const response = NextResponse.json({}) // Create a response object to pass to verifySession
    console.log("API /chat-history POST: sessionToken =", sessionToken ? "present" : "absent")

    let userId = null
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken, response) // Pass the response object
      if (user) {
        userId = user.id
        console.log("API /chat-history POST: userId from session =", userId)
      } else {
        console.log("API /chat-history POST: session token invalid, userId is null")
      }
    } else {
      console.log("API /chat-history POST: no session token, userId is null")
    }

    const { title, messages } = await request.json()
    const chat = await chatManagerDB.createChat(
      title || "New Chat",
      userId,
      messages
    )

    if (chat) {
      return NextResponse.json(chat)
    } else {
      // This case should ideally not be hit if createChat throws an error on failure
      return NextResponse.json(
        { error: "Failed to create chat" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    )
  }
}
