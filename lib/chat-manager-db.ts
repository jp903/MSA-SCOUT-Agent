import { neon } from "@neondatabase/serverless"
import type { ChatHistoryItem } from "./portfolio-types"
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
    console.log(`[ChatManagerDB] createChat called. UserID: ${userId}. isClient: ${this.isClient}`);
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
        console.log(`[ChatManagerDB] Inserting new chat for user ${userId} into DB.`);

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
        console.log(`[ChatManagerDB] DB INSERT successful for chat ${id}.`);
        return newChat
      } catch (error) {
        console.error("[ChatManagerDB] Database insert failed in createChat:", error)
        // Re-throw the error to be caught by the API route
        throw error
      }
    }

    // Browser: call API endpoint which will persist the chat on the server side
    if (this.isClient) {
      console.log("[ChatManagerDB] Calling API to create chat.");
      try {
        const res = await fetch("/api/chat-history", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, messages }),
        })

        if (res.ok) {
          const data = await res.json()
          console.log("[ChatManagerDB] API createChat successful:", data.id);
          return {
            id: data.id,
            title: data.title,
            messages: data.messages || [],
            createdAt: data.createdAt || data.created_at || nowIso,
            updatedAt: data.updatedAt || data.updated_at || nowIso,
          }
        } else {
          console.warn("[ChatManagerDB] API createChat returned non-ok:", res.status)
        }
      } catch (err) {
        console.warn("[ChatManagerDB] API createChat failed, falling back to localStorage:", err)
      }

      // fallback to localStorage
      console.log("[ChatManagerDB] Falling back to localStorage for createChat.");
      const chats = this.getLocalChats()
      chats.unshift(newChat)
      this.saveLocalChats(chats)
      return newChat
    }

    console.warn("[ChatManagerDB] createChat returning non-persistent chat object on server.");
    return newChat
  }

  // Get a single chat by id. Uses DB server-side, API client-side, localStorage fallback.
  async getChat(id: string, userId: string | null = null): Promise<ChatHistoryItem | null> {
    console.log(`[ChatManagerDB] getChat called for ID: ${id}. UserID: ${userId}. isClient: ${this.isClient}`);
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
          console.log(`[ChatManagerDB] Found chat ${id} in DB.`);
          const chat = result[0]
          return {
            id: chat.id,
            title: chat.title,
            messages: JSON.parse(chat.messages || "[]"),
            createdAt: new Date(chat.created_at).toISOString(),
            updatedAt: new Date(chat.updated_at).toISOString(),
          }
        }
        console.log(`[ChatManagerDB] Chat ${id} not found in DB for user ${userId}.`);
        return null
      } catch (error) {
        console.warn("[ChatManagerDB] Database query failed in getChat:", error)
      }
    }

    // Client-side: call API
    if (this.isClient) {
      console.log(`[ChatManagerDB] Calling API to get chat ${id}.`);
      try {
        const res = await fetch(`/api/chat-history/${encodeURIComponent(id)}`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          console.log(`[ChatManagerDB] API getChat successful for ${id}.`);
          return {
            id: data.id,
            title: data.title,
            messages: data.messages || [],
            createdAt: data.createdAt || data.created_at || new Date().toISOString(),
            updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
          }
        }
      } catch (err) {
        console.warn(`[ChatManagerDB] API getChat for ${id} failed, falling back to localStorage:`, err)
      }

      const chats = this.getLocalChats()
      const chat = chats.find((c) => c.id === id) || null
      console.log(`[ChatManagerDB] Found chat ${id} in localStorage:`, !!chat);
      return chat;
    }

    // Fallback
    console.log(`[ChatManagerDB] getChat falling back for ID ${id}.`);
    const chats2 = this.getLocalChats()
    return chats2.find((c) => c.id === id) || null
  }

  // Get all chats for the current session/user
  async getAllChats(userId: string | null = null): Promise<ChatHistoryItem[]> {
    console.log(`[ChatManagerDB] getAllChats called. UserID: ${userId}. isClient: ${this.isClient}`);
    // Server-side direct DB read
    if (!this.isClient && this.sql) {
      try {
        await ensureDatabaseInitialized()

        let result;
        if (userId) {
          console.log(`[ChatManagerDB] Fetching chats for user ${userId} from DB.`);
          result = await this.sql`
            SELECT * FROM chat_history
            WHERE user_id = ${userId}
            ORDER BY updated_at DESC
            LIMIT 50
          `
        } else {
          console.log("[ChatManagerDB] Fetching guest chats from DB.");
          result = await this.sql`
            SELECT * FROM chat_history
            WHERE user_id IS NULL
            ORDER BY updated_at DESC
            LIMIT 50
          `
        }
        console.log(`[ChatManagerDB] Found ${result.length} chats in DB.`);
        return result.map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          messages: JSON.parse(chat.messages || "[]"),
          createdAt: new Date(chat.created_at).toISOString(),
          updatedAt: new Date(chat.updated_at).toISOString(),
        }))
      } catch (error) {
        console.warn("[ChatManagerDB] Database query failed in getAllChats:", error)
      }
    }

    // Client-side: call API (server will use session to return user's chats)
    if (this.isClient) {
      console.log("[ChatManagerDB] Calling API to get all chats.");
      try {
        const res = await fetch("/api/chat-history", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          console.log(`[ChatManagerDB] API getAllChats successful, received ${data.length} chats.`);
          return (data || []).map((chat: any) => ({
            id: chat.id,
            title: chat.title,
            messages: chat.messages || [],
            createdAt: chat.createdAt || chat.created_at || new Date().toISOString(),
            updatedAt: chat.updatedAt || chat.updated_at || new Date().toISOString(),
          }))
        }
      } catch (err) {
        console.warn("[ChatManagerDB] API getAllChats failed, falling back to localStorage:", err)
      }

      console.log("[ChatManagerDB] Falling back to localStorage for getAllChats.");
      return this.getLocalChats()
    }

    // Fallback
    console.log("[ChatManagerDB] getAllChats falling back.");
    return this.getLocalChats()
  }

  // Update chat messages/title
  async updateChat(id: string, messages: any[], title?: string, userId: string | null = null): Promise<void> {
    console.log(`[ChatManagerDB] updateChat called for ID: ${id}. UserID: ${userId}. isClient: ${this.isClient}`);
    const nowIso = new Date().toISOString()

    // Server-side DB update
    if (!this.isClient && this.sql) {
      try {
        await ensureDatabaseInitialized()
        console.log(`[ChatManagerDB] Updating chat ${id} for user ${userId} in DB.`);

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
        const result = await query;
        console.log(`[ChatManagerDB] DB UPDATE for chat ${id} affected ${result.length} rows.`);
        return
      } catch (error) {
        console.warn("[ChatManagerDB] Database update failed in updateChat:", error)
      }
    }

    // Client-side: call API to update
    if (this.isClient) {
      console.log(`[ChatManagerDB] Calling API to update chat ${id}.`);
      try {
        await fetch(`/api/chat-history/${encodeURIComponent(id)}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, messages }),
        })
        console.log(`[ChatManagerDB] API updateChat for ${id} finished.`);
        return
      } catch (err) {
        console.warn(`[ChatManagerDB] API updateChat for ${id} failed, falling back to localStorage:`, err)
      }

      console.log(`[ChatManagerDB] Falling back to localStorage for updateChat ${id}.`);
      const chats = this.getLocalChats()
      const idx = chats.findIndex((c) => c.id === id)
      if (idx >= 0) {
        chats[idx].messages = messages
        if (title) chats[idx].title = title
        chats[idx].updatedAt = nowIso
        this.saveLocalChats(chats)
      }
      return
    }

    // Fallback
    console.log(`[ChatManagerDB] updateChat falling back for ID ${id}.`);
    const chats3 = this.getLocalChats()
    const idx = chats3.findIndex((c) => c.id === id)
    if (idx >= 0) {
      chats3[idx].messages = messages
      if (title) chats3[idx].title = title
      chats3[idx].updatedAt = nowIso
      this.saveLocalChats(chats3)
    }
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
        console.warn("API deleteChat failed, falling back to localStorage:", err)
      }

      const chats = this.getLocalChats()
      const filtered = chats.filter((c) => c.id !== id)
      this.saveLocalChats(filtered)
      return
    }

    // Fallback
    const chats4 = this.getLocalChats()
    const filtered = chats4.filter((c) => c.id !== id)
    this.saveLocalChats(filtered)
  }
}

export const chatManagerDB = new ChatManagerDB()
