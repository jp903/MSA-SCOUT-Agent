import { type NextRequest, NextResponse } from "next/server"
import { chatManagerDB } from "@/lib/chat-manager-db"  // Note: changed to instance, not class
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[API /api/chat-history/${params.id}] GET handler called.`);
  try {
    // Extract session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value
    console.log(`[API /api/chat-history/${params.id}] Session token: ${sessionToken ? sessionToken.substring(0, 10) + "..." : "Not found"}`);

    let userId = null;
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken);
      userId = user?.id || null;
    }
    console.log(`[API /api/chat-history/${params.id}] UserID from session: ${userId}`);

    const chat = await chatManagerDB.getChat(params.id, userId)

    if (chat) {
      console.log(`[API /api/chat-history/${params.id}] Chat found.`);
      return NextResponse.json(chat)
    } else {
      console.warn(`[API /api/chat-history/${params.id}] Chat not found.`);
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`[API /api/chat-history/${params.id}] Error fetching chat:`, error)
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[API /api/chat-history/${params.id}] PUT handler called.`);
  try {
    const { title, messages } = await request.json()

    // Extract session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value
    console.log(`[API /api/chat-history/${params.id}] Session token: ${sessionToken ? sessionToken.substring(0, 10) + "..." : "Not found"}`);

    let userId = null;
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken);
      userId = user?.id || null;
    }
    console.log(`[API /api/chat-history/${params.id}] UserID from session: ${userId}`);

    await chatManagerDB.updateChat(params.id, messages, title, userId)
    const updatedChat = await chatManagerDB.getChat(params.id, userId)

    if (updatedChat) {
      console.log(`[API /api/chat-history/${params.id}] Chat updated successfully.`);
      return NextResponse.json(updatedChat)
    } else {
      console.warn(`[API /api/chat-history/${params.id}] Chat not found after update.`);
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }
  } catch (error) {
    console.error(`[API /api/chat-history/${params.id}] Error updating chat:`, error)
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[API /api/chat-history/${params.id}] DELETE handler called.`);
  try {
    // Extract session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value
    console.log(`[API /api/chat-history/${params.id}] Session token: ${sessionToken ? sessionToken.substring(0, 10) + "..." : "Not found"}`);

    let userId = null;
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken);
      userId = user?.id || null;
    }
    console.log(`[API /api/chat-history/${params.id}] UserID from session: ${userId}`);

    await chatManagerDB.deleteChat(params.id, userId)

    console.log(`[API /api/chat-history/${params.id}] Chat deleted successfully.`);
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API /api/chat-history/${params.id}] Error deleting chat:`, error)
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 })
  }
}
