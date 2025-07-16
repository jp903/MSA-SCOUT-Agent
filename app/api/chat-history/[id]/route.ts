import { type NextRequest, NextResponse } from "next/server"
import { ChatManagerDB } from "@/lib/chat-manager-db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chat = await ChatManagerDB.getChat(params.id)

    if (chat) {
      return NextResponse.json(chat)
    } else {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching chat:", error)
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, messages } = await request.json()
    const chat = await ChatManagerDB.updateChat(params.id, title, messages)

    if (chat) {
      return NextResponse.json(chat)
    } else {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating chat:", error)
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await ChatManagerDB.deleteChat(params.id)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error deleting chat:", error)
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 })
  }
}
