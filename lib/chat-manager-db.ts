import { sql } from "./db"
import type { ChatHistoryItem } from "./portfolio-types"

export class ChatManagerDB {
  async createChat(title = "New Chat"): Promise<ChatHistoryItem> {
    try {
      if (!process.env.DATABASE_URL) {
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
        VALUES (${title}, '[]')
        RETURNING id, title, messages, created_at, updated_at
      `

      const chat = result[0]
      return {
        id: chat.id,
        title: chat.title,
        messages: chat.messages,
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
      }
    } catch (error) {
      console.error("Error creating chat:", error)
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
      if (!process.env.DATABASE_URL) {
        console.log("Database not available, skipping chat update")
        return
      }

      await sql`
        UPDATE chat_history 
        SET messages = ${JSON.stringify(messages)},
            title = COALESCE(${title}, title),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `
    } catch (error) {
      console.error("Error updating chat:", error)
    }
  }

  async getChat(id: string): Promise<ChatHistoryItem | null> {
    try {
      if (!process.env.DATABASE_URL) {
        return null
      }

      const result = await sql`
        SELECT id, title, messages, created_at, updated_at
        FROM chat_history
        WHERE id = ${id}
      `

      if (result.length === 0) return null

      const chat = result[0]
      return {
        id: chat.id,
        title: chat.title,
        messages: chat.messages,
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
      }
    } catch (error) {
      console.error("Error getting chat:", error)
      return null
    }
  }

  async getAllChats(): Promise<ChatHistoryItem[]> {
    try {
      if (!process.env.DATABASE_URL) {
        return []
      }

      const result = await sql`
        SELECT id, title, messages, created_at, updated_at
        FROM chat_history
        ORDER BY updated_at DESC
      `

      return result.map((chat) => ({
        id: chat.id,
        title: chat.title,
        messages: chat.messages,
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
      }))
    } catch (error) {
      console.error("Error getting all chats:", error)
      return []
    }
  }

  async deleteChat(id: string): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        return
      }

      await sql`
        DELETE FROM chat_history
        WHERE id = ${id}
      `
    } catch (error) {
      console.error("Error deleting chat:", error)
    }
  }
}

export const chatManagerDB = new ChatManagerDB()
