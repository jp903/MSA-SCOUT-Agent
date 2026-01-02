"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, Send, User } from "lucide-react"
import { chatManagerDB } from "@/lib/chat-manager-db"
import type { ChatHistoryItem, ChatMessage as Message } from "@/lib/portfolio-types"

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [chatId, setChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const loadChatHistory = async () => {
      setIsLoading(true)
      try {
        const history = await chatManagerDB.getAllChats()
        if (history && history.length > 0) {
          const mostRecentChat = history[0]
          setMessages(mostRecentChat.messages)
          setChatId(mostRecentChat.id)
        } else {
          setMessages([
            {
              id: "1",
              role: "assistant",
              content: "Hello! I'm MSASCOUT AI Agent, your investment agent. How can I help you today?",
            },
          ])
        }
      } catch (error) {
        console.error("Failed to load chat history:", error)
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: "Hello! I'm MSASCOUT AI Agent. I'm having trouble loading our past conversations, but I'm ready to help.",
          },
        ])
      }
      setIsLoading(false)
    }
    loadChatHistory()
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputMessage,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage("")
    setIsLoading(true)

    try {
      let currentChatId = chatId
      const messageHistory = newMessages.map(({ id, ...rest }) => rest)

      if (!chatId) {
        // Create a new chat session if it's the first message
        const newChat = await chatManagerDB.createChat("New Chat", null, newMessages.map(({ id, ...rest }) => ({ role: rest.role, content: rest.content })))
        setChatId(newChat.id)
        currentChatId = newChat.id
      } else {
        // Otherwise, update the existing chat with the user's message
        await chatManagerDB.updateChat(chatId, newMessages.map(({ id, ...rest }) => ({ role: rest.role, content: rest.content })))
      }

      // Get AI response
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messageHistory }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to get AI response")
      }

      const { message: aiContent } = await res.json()

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiContent,
      }

      const finalMessages = [...newMessages, aiMessage]
      setMessages(finalMessages)

      // Update the chat history with the AI's response
      if (currentChatId) {
        await chatManagerDB.updateChat(currentChatId, finalMessages.map(({ id, ...rest }) => ({ role: rest.role, content: rest.content })))
      }
    } catch (error) {
      console.error("Error handling message:", error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">MSASCOUT AI Agent</h1>
            <p className="text-sm text-gray-600">Property Investment Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
            {message.role === "assistant" && (
              <Avatar className="w-8 h-8 rounded-xl">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                  AI
                </AvatarFallback>
              </Avatar>
            )}
            <Card className={`max-w-[70%] ${message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-50"}`}>
              <CardContent className="p-3">
                <p className="text-sm">{message.content}</p>
              </CardContent>
            </Card>
            {message.role === "user" && (
              <Avatar className="w-8 h-8 rounded-xl">
                <AvatarFallback className="rounded-xl bg-gray-600 text-white text-xs">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 rounded-xl">
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                AI
              </AvatarFallback>
            </Avatar>
            <Card className="bg-gray-50">
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about property investments..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
