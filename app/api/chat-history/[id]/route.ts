import { type NextRequest, NextResponse } from "next/server"
import { chatManagerDB } from "@/lib/chat-manager-db"  // Note: changed to instance, not class
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔍 API: Getting chat with ID:", params.id)
    
    // Extract session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value

    let userId = null;
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken);
      userId = user?.id || null;
    }

    const chat = await chatManagerDB.getChat(params.id, userId)

    if (chat) {
      console.log("✅ API: Chat found:", chat.id)
      return NextResponse.json(chat)
    } else {
      console.warn("⚠️ API: Chat not found:", params.id)
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("❌ API: Error fetching chat:", error)
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("💾 API: Updating chat:", params.id)
    const { title, messages } = await request.json()

    // Extract session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value

    let userId = null;
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken);
      userId = user?.id || null;
    }

    await chatManagerDB.updateChat(params.id, messages, title, userId)
    const updatedChat = await chatManagerDB.getChat(params.id, userId)

    if (updatedChat) {
      console.log("✅ API: Chat updated successfully:", params.id)
      return NextResponse.json(updatedChat)
    } else {
      console.warn("⚠️ API: Chat not found after update:", params.id)
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("❌ API: Error updating chat:", error)
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🗑️ API: Deleting chat:", params.id)

    // Extract session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value

    let userId = null;
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken);
      userId = user?.id || null;
    }

    await chatManagerDB.deleteChat(params.id, userId)

    console.log("✅ API: Chat deleted successfully:", params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ API: Error deleting chat:", error)
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 })
  }
}
