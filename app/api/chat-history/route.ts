import { type NextRequest, NextResponse } from "next/server"
import { ChatManagerDB } from "@/lib/chat-manager-db"

export async function GET() {
  try {
    const chatHistory = await ChatManagerDB.getChatHistory()
    return NextResponse.json(chatHistory)
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, messages } = await request.json()
    const chat = await ChatManagerDB.addChat(title, messages)

    if (chat) {
      return NextResponse.json(chat)
    } else {
      return NextResponse.json({ error: "Failed to create chat" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 })
  }
}
