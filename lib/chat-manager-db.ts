import { neon } from "@neondatabase/serverless"
import type { ChatHistoryItem } from "./portfolio-types"
import { ensureDatabaseInitialized } from "./db"
import { AuthService } from "./auth"

// Create SQL connection with fallback handling
const createSqlConnection = () => {
  const databaseUrl =
    process.env.DATABASE_URL

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

  private async getCurrentUserId(): Promise<string | null> {
    // Extract session token from cookie in Node.js environment
    // This would typically be passed as a parameter since we can't access cookies from within a library file
    // The actual cookie extraction should be done in the API routes
    return null; // Placeholder - this needs to be handled differently
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

  async createChat(title = "New Chat", userId: string | null = null): Promise<ChatHistoryItem> {
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
        // Ensure database is initialized
        await ensureDatabaseInitialized();

        if (userId) {
          // Insert chat with user ID
          await this.sql`
            INSERT INTO chat_history (id, user_id, title, messages, created_at, updated_at)
            VALUES (${id}, ${userId}, ${title}, ${JSON.stringify([])}, ${now.toISOString()}, ${now.toISOString()})
          `
        } else {
          // Insert chat without user ID (for non-authenticated users)
          await this.sql`
            INSERT INTO chat_history (id, title, messages, created_at, updated_at)
            VALUES (${id}, ${title}, ${JSON.stringify([])}, ${now.toISOString()}, ${now.toISOString()})
          `
        }
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

  async getChat(id: string, userId: string | null = null): Promise<ChatHistoryItem | null> {
    // Try database first
    if (this.sql) {
      try {
        // Ensure database is initialized
        await ensureDatabaseInitialized();

        if (userId) {
          // Get chat ensuring it belongs to the user
          const result = await this.sql`
            SELECT * FROM chat_history WHERE id = ${id} AND (user_id = ${userId} OR user_id IS NULL)
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
          } else {
            // Chat doesn't belong to the user
            return null
          }
        } else {
          // Get chat without user check
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
        }
      } catch (error) {
        console.warn("Database query failed, using localStorage:", error)
      }
    }

    // Fallback to localStorage
    const chats = this.getLocalChats()
    return chats.find((chat) => chat.id === id) || null
  }

  async getAllChats(userId: string | null = null): Promise<ChatHistoryItem[]> {
    // Try database first
    if (this.sql) {
      try {
        // Ensure database is initialized
        await ensureDatabaseInitialized();

        if (userId) {
          // Get all chats for the specific user
          const result = await this.sql`
            SELECT * FROM chat_history 
            WHERE user_id = ${userId} OR user_id IS NULL
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
        } else {
          // Get all chats that don't have a user ID (anonymous chats)
          const result = await this.sql`
            SELECT * FROM chat_history 
            WHERE user_id IS NULL
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
        }
      } catch (error) {
        console.warn("Database query failed, using localStorage:", error)
      }
    }

    // Fallback to localStorage
    return this.getLocalChats()
  }

  async updateChat(id: string, messages: any[], title?: string, userId: string | null = null): Promise<void> {
    const now = new Date()

    // Try database first
    if (this.sql) {
      try {
        // Ensure database is initialized
        await ensureDatabaseInitialized();

        if (userId) {
          // Update chat ensuring it belongs to the user
          if (title) {
            await this.sql`
              UPDATE chat_history 
              SET messages = ${JSON.stringify(messages)}, title = ${title}, updated_at = ${now.toISOString()}
              WHERE id = ${id} AND user_id = ${userId}
            `
          } else {
            await this.sql`
              UPDATE chat_history 
              SET messages = ${JSON.stringify(messages)}, updated_at = ${now.toISOString()}
              WHERE id = ${id} AND user_id = ${userId}
            `
          }
        } else {
          // Update chat without user ID check
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

  async deleteChat(id: string, userId: string | null = null): Promise<void> {
    // Try database first
    if (this.sql) {
      try {
        // Ensure database is initialized
        await ensureDatabaseInitialized();

        if (userId) {
          // Delete chat ensuring it belongs to the user
          await this.sql`
            DELETE FROM chat_history WHERE id = ${id} AND user_id = ${userId}
          `
        } else {
          // Delete chat without user check
          await this.sql`
            DELETE FROM chat_history WHERE id = ${id}
          `
        }
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
