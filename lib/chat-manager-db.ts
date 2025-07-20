import { sql } from "./db"
import type { ChatHistoryItem } from "./portfolio-types"

export class ChatManagerDB {
  async createChat(title = "New Chat"): Promise<ChatHistoryItem> {
    try {
      console.log("🆕 Creating new chat with title:", title)

      if (!process.env.DATABASE_URL) {
        console.warn("⚠️ No database URL, using fallback")
        return {
          id: crypto.randomUUID(),
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      const result = await sql`
        INSERT INTO chat_history (title, messages)
        VALUES (${title}, '[]'::jsonb)
        RETURNING id, title, messages, created_at, updated_at
      `

      if (result.length === 0) {
        throw new Error("Failed to create chat - no result returned")
      }

      const chat = result[0]
      console.log("✅ Chat created successfully:", chat.id)

      return {
        id: chat.id,
        title: chat.title,
        messages: Array.isArray(chat.messages) ? chat.messages : [],
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
      }
    } catch (error) {
      console.error("❌ Error creating chat:", error)
      // Fallback to local storage
      return {
        id: crypto.randomUUID(),
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
  }

  async updateChat(id: string, messages: any[], title?: string): Promise<void> {
    try {
      console.log("💾 Updating chat:", id, "with", messages.length, "messages")

      if (!process.env.DATABASE_URL) {
        console.warn("⚠️ No database URL, skipping chat update")
        return
      }

      const messagesJson = JSON.stringify(messages)

      const result = await sql`
        UPDATE chat_history 
        SET messages = ${messagesJson}::jsonb,
            title = COALESCE(${title}, title),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id
      `

      if (result.length === 0) {
        console.warn("⚠️ No chat found with id:", id)
        return
      }

      console.log("✅ Chat updated successfully:", id)
    } catch (error) {
      console.error("❌ Error updating chat:", error)
      throw error
    }
  }

  async getChat(id: string): Promise<ChatHistoryItem | null> {
    try {
      console.log("📋 Getting chat:", id)

      if (!process.env.DATABASE_URL) {
        console.warn("⚠️ No database URL, returning null")
        return null
      }

      const result = await sql`
        SELECT id, title, messages, created_at, updated_at
        FROM chat_history
        WHERE id = ${id}
      `

      if (result.length === 0) {
        console.warn("⚠️ Chat not found:", id)
        return null
      }

      const chat = result[0]
      console.log("✅ Chat retrieved successfully:", id)

      return {
        id: chat.id,
        title: chat.title,
        messages: Array.isArray(chat.messages) ? chat.messages : [],
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
      }
    } catch (error) {
      console.error("❌ Error getting chat:", error)
      return null
    }
  }

  async getAllChats(): Promise<ChatHistoryItem[]> {
    try {
      console.log("📚 Getting all chats...")

      if (!process.env.DATABASE_URL) {
        console.warn("⚠️ No database URL, returning empty array")
        return []
      }

      const result = await sql`
        SELECT id, title, messages, created_at, updated_at
        FROM chat_history
        ORDER BY updated_at DESC
        LIMIT 50
      `

      console.log("✅ Retrieved", result.length, "chats")

      return result.map((chat) => ({
        id: chat.id,
        title: chat.title,
        messages: Array.isArray(chat.messages) ? chat.messages : [],
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
      }))
    } catch (error) {
      console.error("❌ Error getting all chats:", error)
      return []
    }
  }

  async deleteChat(id: string): Promise<void> {
    try {
      console.log("🗑️ Deleting chat:", id)

      if (!process.env.DATABASE_URL) {
        console.warn("⚠️ No database URL, skipping delete")
        return
      }

      const result = await sql`
        DELETE FROM chat_history
        WHERE id = ${id}
        RETURNING id
      `

      if (result.length === 0) {
        console.warn("⚠️ No chat found to delete:", id)
        return
      }

      console.log("✅ Chat deleted successfully:", id)
    } catch (error) {
      console.error("❌ Error deleting chat:", error)
      throw error
    }
  }
}

export const chatManagerDB = new ChatManagerDB()
