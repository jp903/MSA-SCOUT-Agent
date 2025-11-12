import { type NextRequest, NextResponse } from "next/server"
import { chatManagerDB } from "@/lib/chat-manager-db"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  console.log("[API /api/chat-history] GET handler called.");
  try {
    // Extract session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value
    console.log(`[API /api/chat-history] Session token: ${sessionToken ? sessionToken.substring(0, 10) + "..." : "Not found"}`);

    let userId = null;
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken);
      if (user) {
        userId = user.id;
      }
    }
    console.log(`[API /api/chat-history] UserID from session: ${userId}`);

    const chatHistory = await chatManagerDB.getAllChats(userId)
    console.log(`[API /api/chat-history] chatManagerDB.getAllChats returned ${chatHistory.length} chats.`);
    return NextResponse.json(chatHistory)
  } catch (error) {
    console.error("[API /api/chat-history] Error fetching chat history:", error)
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log("[API /api/chat-history] POST handler called.");
  try {
    // Extract session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value
    console.log(`[API /api/chat-history] Session token: ${sessionToken ? sessionToken.substring(0, 10) + "..." : "Not found"}`);

    let userId = null
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken)
      userId = user?.id || null
    }
    console.log(`[API /api/chat-history] UserID from session: ${userId}`);

    const { title, messages } = await request.json()
    console.log(`[API /api/chat-history] Received title: "${title}", messages: ${messages?.length || 0}`);

    const chat = await chatManagerDB.createChat(
      title || "New Chat",
      userId,
      messages
    )

    if (chat) {
      console.log(`[API /api/chat-history] Chat created successfully with ID: ${chat.id}`);
      return NextResponse.json(chat)
    } else {
      console.error("[API /api/chat-history] chatManagerDB.createChat returned falsy value.");
      return NextResponse.json(
        { error: "Failed to create chat" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("[API /api/chat-history] Error creating chat:", error)
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    )
  }
}
