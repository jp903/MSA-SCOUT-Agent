import { neon } from "@neondatabase/serverless"
import type { ChatHistoryItem } from "./portfolio-types"

// Create SQL connection with fallback handling
const createSqlConnection = () => {
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_mJ9dhet5vsMw@ep-icy-tree-aeb06nzf-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

  if (!databaseUrl) {
    throw new Error("No database connection string available")
  }

  return neon(databaseUrl)
}

export class ChatManagerDB {
  private sql: any
  private isClient: boolean

  constructor() {
    this.isClient = typeof window !== "undefined"

    if (!this.isClient) {
      try {
        this.sql = createSqlConnection()
      } catch (error) {
        console.warn("Database connection failed, using localStorage fallback")
        this.sql = null
      }
    } else {
      this.sql = null
    }
  }

  private getLocalChats(): ChatHistoryItem[] {
    if (!this.isClient) return []

    try {
      const stored = localStorage.getItem("msascout_chats")
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private saveLocalChats(chats: ChatHistoryItem[]): void {
    if (!this.isClient) return

    try {
      localStorage.setItem("msascout_chats", JSON.stringify(chats.slice(0, 50)))
    } catch (error) {
      console.warn("Failed to save to localStorage:", error)
    }
  }

  async createChat(title = "New Chat"): Promise<ChatHistoryItem> {
    const id = crypto.randomUUID()
    const now = new Date()

    const newChat: ChatHistoryItem = {
      id,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
    }

    // Try database first
    if (this.sql) {
      try {
        await this.sql`
          INSERT INTO chat_history (id, title, messages, created_at, updated_at)
          VALUES (${id}, ${title}, ${JSON.stringify([])}, ${now.toISOString()}, ${now.toISOString()})
        `
        return newChat
      } catch (error) {
        console.warn("Database insert failed, using localStorage:", error)
      }
    }

    // Fallback to localStorage
    const chats = this.getLocalChats()
    chats.unshift(newChat)
    this.saveLocalChats(chats)
    return newChat
  }

  async getChat(id: string): Promise<ChatHistoryItem | null> {
    // Try database first
    if (this.sql) {
      try {
        const result = await this.sql`
          SELECT * FROM chat_history WHERE id = ${id}
        `

        if (result.length > 0) {
          const chat = result[0]
          return {
            id: chat.id,
            title: chat.title,
            messages: JSON.parse(chat.messages || "[]"),
            createdAt: new Date(chat.created_at),
            updatedAt: new Date(chat.updated_at),
          }
        }
      } catch (error) {
        console.warn("Database query failed, using localStorage:", error)
      }
    }

    // Fallback to localStorage
    const chats = this.getLocalChats()
    return chats.find((chat) => chat.id === id) || null
  }

  async getAllChats(): Promise<ChatHistoryItem[]> {
    // Try database first
    if (this.sql) {
      try {
        const result = await this.sql`
          SELECT * FROM chat_history 
          ORDER BY updated_at DESC
          LIMIT 50
        `

        return result.map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          messages: JSON.parse(chat.messages || "[]"),
          createdAt: new Date(chat.created_at),
          updatedAt: new Date(chat.updated_at),
        }))
      } catch (error) {
        console.warn("Database query failed, using localStorage:", error)
      }
    }

    // Fallback to localStorage
    return this.getLocalChats()
  }

  async updateChat(id: string, messages: any[], title?: string): Promise<void> {
    const now = new Date()

    // Try database first
    if (this.sql) {
      try {
        if (title) {
          await this.sql`
            UPDATE chat_history 
            SET messages = ${JSON.stringify(messages)}, title = ${title}, updated_at = ${now.toISOString()}
            WHERE id = ${id}
          `
        } else {
          await this.sql`
            UPDATE chat_history 
            SET messages = ${JSON.stringify(messages)}, updated_at = ${now.toISOString()}
            WHERE id = ${id}
          `
        }
        return
      } catch (error) {
        console.warn("Database update failed, using localStorage:", error)
      }
    }

    // Fallback to localStorage
    const chats = this.getLocalChats()
    const chatIndex = chats.findIndex((chat) => chat.id === id)

    if (chatIndex >= 0) {
      chats[chatIndex].messages = messages
      if (title) chats[chatIndex].title = title
      chats[chatIndex].updatedAt = now
      this.saveLocalChats(chats)
    }
  }

  async deleteChat(id: string): Promise<void> {
    // Try database first
    if (this.sql) {
      try {
        await this.sql`
          DELETE FROM chat_history WHERE id = ${id}
        `
        return
      } catch (error) {
        console.warn("Database delete failed, using localStorage:", error)
      }
    }

    // Fallback to localStorage
    const chats = this.getLocalChats()
    const filteredChats = chats.filter((chat) => chat.id !== id)
    this.saveLocalChats(filteredChats)
  }
}

export const chatManagerDB = new ChatManagerDB()
