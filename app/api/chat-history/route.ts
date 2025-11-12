import { type NextRequest, NextResponse } from "next/server"
import { chatManagerDB } from "@/lib/chat-manager-db"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Extract session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value

    let userId = null;
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken);
      if (user) {
        userId = user.id;
      }
    }

    const chatHistory = await chatManagerDB.getAllChats(userId)
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

    let userId = null
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken)
      userId = user?.id || null
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
