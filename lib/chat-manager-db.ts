import { sql } from "./db"
import type { ChatHistoryItem } from "./portfolio-types"

export class ChatManagerDB {
  async createChat(title = "New Chat"): Promise<ChatHistoryItem> {
    try {
      console.log("🆕 Creating new chat with title:", title)

      if (!process.env.DATABASE_URL) {
        console.warn("⚠️ No database URL, using fallback")
        const fallbackChat = {
          id: crypto.randomUUID(),
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        // Store in localStorage as fallback
        if (typeof window !== "undefined") {
          const existingChats = JSON.parse(localStorage.getItem("msascout_chats") || "[]")
          existingChats.unshift(fallbackChat)
          localStorage.setItem("msascout_chats", JSON.stringify(existingChats.slice(0, 50)))
        }
        return fallbackChat
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
      // Fallback to localStorage
      const fallbackChat = {
        id: crypto.randomUUID(),
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      if (typeof window !== "undefined") {
        const existingChats = JSON.parse(localStorage.getItem("msascout_chats") || "[]")
        existingChats.unshift(fallbackChat)
        localStorage.setItem("msascout_chats", JSON.stringify(existingChats.slice(0, 50)))
      }
      return fallbackChat
    }
  }

  async updateChat(id: string, messages: any[], title?: string): Promise<void> {
    try {
      console.log("💾 Updating chat:", id, "with", messages.length, "messages")

      if (!process.env.DATABASE_URL) {
        console.warn("⚠️ No database URL, using localStorage fallback")
        if (typeof window !== "undefined") {
          const existingChats = JSON.parse(localStorage.getItem("msascout_chats") || "[]")
          const chatIndex = existingChats.findIndex((chat: any) => chat.id === id)
          if (chatIndex !== -1) {
            existingChats[chatIndex].messages = messages
            existingChats[chatIndex].title = title || existingChats[chatIndex].title
            existingChats[chatIndex].updatedAt = new Date()
            localStorage.setItem("msascout_chats", JSON.stringify(existingChats))
          }
        }
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
      // Fallback to localStorage
      if (typeof window !== "undefined") {
        const existingChats = JSON.parse(localStorage.getItem("msascout_chats") || "[]")
        const chatIndex = existingChats.findIndex((chat: any) => chat.id === id)
        if (chatIndex !== -1) {
          existingChats[chatIndex].messages = messages
          existingChats[chatIndex].title = title || existingChats[chatIndex].title
          existingChats[chatIndex].updatedAt = new Date()
          localStorage.setItem("msascout_chats", JSON.stringify(existingChats))
        }
      }
    }
  }

  async getChat(id: string): Promise<ChatHistoryItem | null> {
    try {
      console.log("📋 Getting chat:", id)

      if (!process.env.DATABASE_URL) {
        console.warn("⚠️ No database URL, using localStorage fallback")
        if (typeof window !== "undefined") {
          const existingChats = JSON.parse(localStorage.getItem("msascout_chats") || "[]")
          const chat = existingChats.find((chat: any) => chat.id === id)
          return chat
            ? {
                ...chat,
                createdAt: new Date(chat.createdAt),
                updatedAt: new Date(chat.updatedAt),
              }
            : null
        }
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
      // Fallback to localStorage
      if (typeof window !== "undefined") {
        const existingChats = JSON.parse(localStorage.getItem("msascout_chats") || "[]")
        const chat = existingChats.find((chat: any) => chat.id === id)
        return chat
          ? {
              ...chat,
              createdAt: new Date(chat.createdAt),
              updatedAt: new Date(chat.updatedAt),
            }
          : null
      }
      return null
    }
  }

  async getAllChats(): Promise<ChatHistoryItem[]> {
    try {
      console.log("📚 Getting all chats...")

      if (!process.env.DATABASE_URL) {
        console.warn("⚠️ No database URL, using localStorage fallback")
        if (typeof window !== "undefined") {
          const existingChats = JSON.parse(localStorage.getItem("msascout_chats") || "[]")
          return existingChats.map((chat: any) => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
          }))
        }
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
      // Fallback to localStorage
      if (typeof window !== "undefined") {
        const existingChats = JSON.parse(localStorage.getItem("msascout_chats") || "[]")
        return existingChats.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
        }))
      }
      return []
    }
  }

  async deleteChat(id: string): Promise<void> {
    try {
      console.log("🗑️ Deleting chat:", id)

      if (!process.env.DATABASE_URL) {
        console.warn("⚠️ No database URL, using localStorage fallback")
        if (typeof window !== "undefined") {
          const existingChats = JSON.parse(localStorage.getItem("msascout_chats") || "[]")
          const filteredChats = existingChats.filter((chat: any) => chat.id !== id)
          localStorage.setItem("msascout_chats", JSON.stringify(filteredChats))
        }
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
      // Fallback to localStorage
      if (typeof window !== "undefined") {
        const existingChats = JSON.parse(localStorage.getItem("msascout_chats") || "[]")
        const filteredChats = existingChats.filter((chat: any) => chat.id !== id)
        localStorage.setItem("msascout_chats", JSON.stringify(filteredChats))
      }
    }
  }
}

export const chatManagerDB = new ChatManagerDB()
