import { sql } from "./db"
import type { ChatHistoryItem } from "./portfolio-types"

export class ChatManagerDB {
  static async getChatHistory(): Promise<ChatHistoryItem[]> {
    try {
      const chats = await sql`
        SELECT 
          id,
          title,
          messages,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM chat_history 
        ORDER BY created_at DESC
      `

      return chats.map((chat) => ({
        ...chat,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
      }))
    } catch (error) {
      console.error("Error fetching chat history:", error)
      return []
    }
  }

  static async addChat(title: string, messages: any[] = []): Promise<ChatHistoryItem | null> {
    try {
      const result = await sql`
        INSERT INTO chat_history (title, messages)
        VALUES (${title}, ${JSON.stringify(messages)})
        RETURNING 
          id,
          title,
          messages,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `

      if (result.length > 0) {
        const newChat = result[0]
        return {
          ...newChat,
          createdAt: newChat.createdAt.toISOString(),
          updatedAt: newChat.updatedAt.toISOString(),
        }
      }
      return null
    } catch (error) {
      console.error("Error adding chat:", error)
      return null
    }
  }

  static async updateChat(id: string, title?: string, messages?: any[]): Promise<ChatHistoryItem | null> {
    try {
      const result = await sql`
        UPDATE chat_history SET
          title = COALESCE(${title}, title),
          messages = COALESCE(${messages ? JSON.stringify(messages) : null}, messages)
        WHERE id = ${id}
        RETURNING 
          id,
          title,
          messages,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `

      if (result.length > 0) {
        const updatedChat = result[0]
        return {
          ...updatedChat,
          createdAt: updatedChat.createdAt.toISOString(),
          updatedAt: updatedChat.updatedAt.toISOString(),
        }
      }
      return null
    } catch (error) {
      console.error("Error updating chat:", error)
      return null
    }
  }

  static async deleteChat(id: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM chat_history WHERE id = ${id}`
      return result.count > 0
    } catch (error) {
      console.error("Error deleting chat:", error)
      return false
    }
  }

  static async getChat(id: string): Promise<ChatHistoryItem | null> {
    try {
      const result = await sql`
        SELECT 
          id,
          title,
          messages,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM chat_history 
        WHERE id = ${id}
      `

      if (result.length > 0) {
        const chat = result[0]
        return {
          ...chat,
          createdAt: chat.createdAt.toISOString(),
          updatedAt: chat.updatedAt.toISOString(),
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching chat:", error)
      return null
    }
  }
}
