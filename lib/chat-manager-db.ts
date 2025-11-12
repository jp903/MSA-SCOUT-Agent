import { neon } from "@neondatabase/serverless"
import type { ChatHistoryItem } from "./chat-types"
import { ensureDatabaseInitialized } from "./db"

// Create SQL connection with fallback handling
const createSqlConnection = () => {
  const databaseUrl = process.env.DATABASE_URL

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

  // Create a new chat. If running in browser, call API so server persists it (and associates user).
  async createChat(
    title = "New Chat",
    userId: string | null = null,
    messages: any[] = []
  ): Promise<ChatHistoryItem> {
    const id = crypto.randomUUID()
    const nowIso = new Date().toISOString()

    const newChat: ChatHistoryItem = {
      id,
      title,
      messages,
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    // Server-side direct DB write if we have connection (used by API routes)
    if (!this.isClient && this.sql) {
      try {
        await ensureDatabaseInitialized()

        const messagesJson = JSON.stringify(messages)

        if (userId) {
          await this.sql`
            INSERT INTO chat_history (id, user_id, title, messages, created_at, updated_at)
            VALUES (${id}, ${userId}, ${title}, ${messagesJson}, ${nowIso}, ${nowIso})
          `
        } else {
          await this.sql`
            INSERT INTO chat_history (id, title, messages, created_at, updated_at)
            VALUES (${id}, ${title}, ${messagesJson}, ${nowIso}, ${nowIso})
          `
        }

        return newChat
      } catch (error) {
        console.error("Database insert failed in createChat:", error)
        // Re-throw the error to be caught by the API route
        throw error
      }
    }

    // Browser: call API endpoint which will persist the chat on the server side
    if (this.isClient) {
      try {
        const res = await fetch("/api/chat-history", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, messages }),
        })

        if (res.ok) {
          const data = await res.json()
          return {
            id: data.id,
            title: data.title,
            messages: data.messages || [],
            createdAt: data.createdAt || data.created_at || nowIso,
            updatedAt: data.updatedAt || data.updated_at || nowIso,
          }
        } else {
          console.warn("API createChat returned non-ok:", res.status)
        }
      } catch (err) {
        console.warn("API createChat failed, falling back to localStorage:", err)
      }

      // fallback to localStorage
      const chats = this.getLocalChats()
      chats.unshift(newChat)
      this.saveLocalChats(chats)
      return newChat
    }

    // This part should ideally not be reached on the server if sql connection is available.
    // If it is, it means the server has no DB connection, and we're returning a non-persistent chat.
    console.warn("createChat is returning a non-persistent chat object on the server.")
    return newChat
  }

  // Get a single chat by id. Uses DB server-side, API client-side, localStorage fallback.
  async getChat(id: string, userId: string | null = null): Promise<ChatHistoryItem | null> {
    // Server-side direct DB read
    if (!this.isClient && this.sql) {
      try {
        await ensureDatabaseInitialized()

        let result;
        if (userId) {
          result = await this.sql`
            SELECT * FROM chat_history WHERE id = ${id} AND user_id = ${userId}
          `
        } else {
          result = await this.sql`
            SELECT * FROM chat_history WHERE id = ${id} AND user_id IS NULL
          `
        }
        
        if (result.length > 0) {
          const chat = result[0]
          return {
            id: chat.id,
            title: chat.title,
            messages: JSON.parse(chat.messages || "[]"),
            createdAt: new Date(chat.created_at).toISOString(),
            updatedAt: new Date(chat.updated_at).toISOString(),
          }
        }
        return null
      } catch (error) {
        console.warn("Database query failed in getChat:", error)
      }
    }

    // Client-side: call API
    if (this.isClient) {
      try {
        const res = await fetch(`/api/chat-history/${encodeURIComponent(id)}`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          return {
            id: data.id,
            title: data.title,
            messages: data.messages || [],
            createdAt: data.createdAt || data.created_at || new Date().toISOString(),
            updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
          }
        } else {
          throw new Error(`API getChat for ${id} returned non-ok status: ${res.status}`)
        }
      } catch (err) {
        console.error(`API getChat for ${id} failed:`, err)
        throw err
      }
    }

    // Fallback for server-side without DB connection, or if client-side API fails and no localStorage
    console.warn("getChat is returning null due to unexpected fallback.")
    return null
  }

  // Get all chats for the current session/user
  async getAllChats(userId: string | null = null): Promise<ChatHistoryItem[]> {
    // Server-side direct DB read
    if (!this.isClient && this.sql) {
      try {
        await ensureDatabaseInitialized()

        let result;
        if (userId) {
          result = await this.sql`
            SELECT * FROM chat_history
            WHERE user_id = ${userId}
            ORDER BY updated_at DESC
            LIMIT 50
          `
        } else {
          result = await this.sql`
            SELECT * FROM chat_history
            WHERE user_id IS NULL
            ORDER BY updated_at DESC
            LIMIT 50
          `
        }
        return result.map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          messages: JSON.parse(chat.messages || "[]"),
          createdAt: new Date(chat.created_at).toISOString(),
          updatedAt: new Date(chat.updated_at).toISOString(),
        }))
      } catch (error) {
        console.warn("Database query failed in getAllChats:", error)
      }
    }

    // Client-side: call API (server will use session to return user's chats)
    if (this.isClient) {
      try {
        const res = await fetch("/api/chat-history", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          return (data || []).map((chat: any) => ({
            id: chat.id,
            title: chat.title,
            messages: chat.messages || [],
            createdAt: chat.createdAt || chat.created_at || new Date().toISOString(),
            updatedAt: chat.updatedAt || chat.updated_at || new Date().toISOString(),
          }))
        } else {
          // If API call fails, re-throw the error to be caught by the caller
          throw new Error(`API getAllChats returned non-ok status: ${res.status}`)
        }
      } catch (err) {
        console.error("API getAllChats failed:", err)
        throw err // Re-throw to indicate failure to the caller
      }
    }

    // Fallback for server-side without DB connection, or if client-side API fails and no localStorage
    // This part should ideally not be reached if the client-side API is expected to work.
    // If it is reached, it means there's a fundamental issue with data retrieval.
    console.warn("getAllChats is returning an empty array due to unexpected fallback.")
    return []
  }

  // Update chat messages/title
  async updateChat(id: string, messages: any[], title?: string, userId: string | null = null): Promise<void> {
    const nowIso = new Date().toISOString()

    // Server-side DB update
    if (!this.isClient && this.sql) {
      try {
        await ensureDatabaseInitialized()

        let query;
        if (userId) {
          if (title) {
            query = this.sql`
              UPDATE chat_history
              SET messages = ${JSON.stringify(messages)}, title = ${title}, updated_at = ${nowIso}
              WHERE id = ${id} AND user_id = ${userId}
            `
          } else {
            query = this.sql`
              UPDATE chat_history
              SET messages = ${JSON.stringify(messages)}, updated_at = ${nowIso}
              WHERE id = ${id} AND user_id = ${userId}
            `
          }
        } else {
          if (title) {
            query = this.sql`
              UPDATE chat_history
              SET messages = ${JSON.stringify(messages)}, title = ${title}, updated_at = ${nowIso}
              WHERE id = ${id} AND user_id IS NULL
            `
          } else {
            query = this.sql`
              UPDATE chat_history
              SET messages = ${JSON.stringify(messages)}, updated_at = ${nowIso}
              WHERE id = ${id} AND user_id IS NULL
            `
          }
        }
        await query;
        return
      } catch (error) {
        console.warn("Database update failed in updateChat:", error)
      }
    }

    // Client-side: call API to update
    if (this.isClient) {
      try {
        await fetch(`/api/chat-history/${encodeURIComponent(id)}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, messages }),
        })
        return
      } catch (err) {
        console.error(`API updateChat for ${id} failed:`, err)
        throw err
      }
    }

    // Fallback for server-side without DB connection, or if client-side API fails and no localStorage
    console.warn("updateChat is not persisting changes due to unexpected fallback.")
  }

  // Delete chat
  async deleteChat(id: string, userId: string | null = null): Promise<void> {
    // Server-side DB delete
    if (!this.isClient && this.sql) {
      try {
        await ensureDatabaseInitialized()

        if (userId) {
          await this.sql`
            DELETE FROM chat_history WHERE id = ${id} AND user_id = ${userId}
          `
        } else {
          await this.sql`
            DELETE FROM chat_history WHERE id = ${id}
          `
        }
        return
      } catch (error) {
        console.warn("Database delete failed, falling back to other persistence:", error)
      }
    }

    // Client-side: call API
    if (this.isClient) {
      try {
        await fetch(`/api/chat-history/${encodeURIComponent(id)}`, {
          method: "DELETE",
          credentials: "include",
        })
        return
      } catch (err) {
        console.error("API deleteChat failed:", err)
        throw err
      }
    }

    // Fallback for server-side without DB connection, or if client-side API fails and no localStorage
    console.warn("deleteChat is not persisting changes due to unexpected fallback.")
  }
}

export const chatManagerDB = new ChatManagerDB()
