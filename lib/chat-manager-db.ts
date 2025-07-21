import { neon } from "@neondatabase/serverless"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface ChatHistoryItem {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export class ChatManagerDB {
  private sql: any

  constructor() {
    if (process.env.DATABASE_URL) {
      this.sql = neon(process.env.DATABASE_URL)
    } else {
      console.warn("⚠️ No database URL, using localStorage fallback")
      this.sql = null
    }
  }

  async getAllChats(): Promise<ChatHistoryItem[]> {
    try {
      if (!this.sql) {
        // Fallback to localStorage
        const chats = localStorage.getItem("msascout_chats")
        return chats ? JSON.parse(chats) : []
      }

      const result = await this.sql`
        SELECT id, title, messages, created_at, updated_at 
        FROM chat_history 
        ORDER BY updated_at DESC
      `

      return result.map((row: any) => ({
        id: row.id,
        title: row.title,
        messages: row.messages || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    } catch (error) {
      console.error("❌ Error loading chat history:", error)
      // Fallback to localStorage
      try {
        const chats = localStorage.getItem("msascout_chats")
        return chats ? JSON.parse(chats) : []
      } catch {
        return []
      }
    }
  }

  async getChatById(id: string): Promise<ChatHistoryItem | null> {
    try {
      if (!this.sql) {
        // Fallback to localStorage
        const chats = localStorage.getItem("msascout_chats")
        const allChats = chats ? JSON.parse(chats) : []
        return allChats.find((chat: ChatHistoryItem) => chat.id === id) || null
      }

      const result = await this.sql`
        SELECT id, title, messages, created_at, updated_at 
        FROM chat_history 
        WHERE id = ${id}
      `

      if (result.length === 0) return null

      const row = result[0]
      return {
        id: row.id,
        title: row.title,
        messages: row.messages || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    } catch (error) {
      console.error("❌ Error loading chat:", error)
      return null
    }
  }

  async saveChat(chat: ChatHistoryItem): Promise<void> {
    try {
      if (!this.sql) {
        // Fallback to localStorage
        const chats = localStorage.getItem("msascout_chats")
        const allChats = chats ? JSON.parse(chats) : []
        const existingIndex = allChats.findIndex((c: ChatHistoryItem) => c.id === chat.id)

        if (existingIndex >= 0) {
          allChats[existingIndex] = chat
        } else {
          allChats.unshift(chat)
        }

        localStorage.setItem("msascout_chats", JSON.stringify(allChats))
        return
      }

      await this.sql`
        INSERT INTO chat_history (id, title, messages, created_at, updated_at)
        VALUES (${chat.id}, ${chat.title}, ${JSON.stringify(chat.messages)}, ${chat.createdAt}, ${chat.updatedAt})
        ON CONFLICT (id) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          messages = EXCLUDED.messages,
          updated_at = EXCLUDED.updated_at
      `

      console.log("✅ Chat saved successfully:", chat.id)
    } catch (error) {
      console.error("❌ Error saving chat:", error)
      // Fallback to localStorage
      try {
        const chats = localStorage.getItem("msascout_chats")
        const allChats = chats ? JSON.parse(chats) : []
        const existingIndex = allChats.findIndex((c: ChatHistoryItem) => c.id === chat.id)

        if (existingIndex >= 0) {
          allChats[existingIndex] = chat
        } else {
          allChats.unshift(chat)
        }

        localStorage.setItem("msascout_chats", JSON.stringify(allChats))
      } catch (fallbackError) {
        console.error("❌ Fallback save failed:", fallbackError)
      }
    }
  }

  async deleteChat(id: string): Promise<void> {
    try {
      if (!this.sql) {
        // Fallback to localStorage
        const chats = localStorage.getItem("msascout_chats")
        const allChats = chats ? JSON.parse(chats) : []
        const filteredChats = allChats.filter((chat: ChatHistoryItem) => chat.id !== id)
        localStorage.setItem("msascout_chats", JSON.stringify(filteredChats))
        return
      }

      await this.sql`DELETE FROM chat_history WHERE id = ${id}`
      console.log("✅ Chat deleted successfully:", id)
    } catch (error) {
      console.error("❌ Error deleting chat:", error)
    }
  }
}

export const chatManagerDB = new ChatManagerDB()
