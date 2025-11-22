"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check,
  RotateCcw,
  FileText,
  Presentation,
  Loader2,
  Sparkles
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { ChatHistoryItem, ChatMessage as Message } from "@/lib/chat-types"

interface SimpleChatProps {
  onToolSelect: (toolId: string) => void
  currentChat: ChatHistoryItem | null
  onChatUpdate: (messages: Omit<Message, 'id'>[], title?: string) => void
}

const quickActions = [
  {
    id: "investment-calculator",
    title: "Investment Calculator",
    description: "Calculate ROI and cash flow",
    icon: FileText,
  },
  {
    id: "market-insights",
    title: "Market Insights",
    description: "Real-time market data",
    icon: Sparkles,
  },
]

const suggestedQuestions = [
  "What are the current market conditions for real estate investment?",
  "How do interest rates affect property investment returns?",
]

export default function SimpleChat({ onToolSelect, currentChat, onChatUpdate }: SimpleChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load current chat messages when currentChat changes
  useEffect(() => {
    if (currentChat && currentChat.messages) {
      setMessages(currentChat.messages)
    } else {
      setMessages([])
    }
  }, [currentChat])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy message to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async (message?: string, action?: string) => {
    const messageToSend = message || inputValue.trim()
    if (!messageToSend || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: messageToSend,
      role: "user",
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")

    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          action: action,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.message,
        role: "assistant",
      }

      const finalMessages = [...newMessages, aiMessage]
      setMessages(finalMessages)

      // Generate title from first message if this is a new chat
      const title = messages.length === 0 ? generateChatTitle(messageToSend) : undefined

      // Update chat in parent component, removing the client-side 'id'
      onChatUpdate(finalMessages.map(({id, ...rest}) => rest), title)

    } catch (error) {
      console.error("❌ Chat error:", error)

      // Add error message to chat
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        role: "assistant",
      }

      const finalMessages = [...newMessages, errorMessage]
      setMessages(finalMessages)

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.split(" ").slice(0, 6).join(" ")
    return words.length > 30 ? words.substring(0, 30) + "..." : words
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickAction = (actionId: string) => {
    onToolSelect(actionId)
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question)
  }

  // Simple markdown formatting
  const formatMessage = (content: string) => {
    if (!content) return '';
    
    // Create a temporary element to safely parse HTML
    let formatted = content;
    
    // Headers
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>');
    
    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');
    
    // Bullet points
    formatted = formatted.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc list-inside">$1</li>');
    
    // Numbered lists
    formatted = formatted.replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal list-inside">$1</li>');
    
    // Split by double newlines for paragraphs
    const paragraphs = formatted.split(/\n\n/);
    let result = '';
    
    for (const paragraph of paragraphs) {
      if (paragraph.startsWith('<h') || paragraph.startsWith('<li') || paragraph.startsWith('<code') || paragraph.startsWith('<strong') || paragraph.startsWith('<em')) {
        result += paragraph;
      } else {
        result += `<p class="mb-3">${paragraph}</p>`;
      }
    }
    
    return result;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">MSASCOUT AI Assistant</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSendMessage()}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 bg-white p-4">
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="space-y-8 pt-16">
              {/* Welcome Message */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">How can I help you today?</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  I'm your AI property investment assistant with access to real-time market data. Ask me about market conditions, generate reports, or use our specialized tools.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {quickActions.map((action, index) => (
                  <Card
                    key={action.id}
                    className="p-4 cursor-pointer hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors"
                    onClick={() => handleQuickAction(action.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <action.icon className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Suggested Questions */}
              <div className="space-y-3 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-center text-gray-900">Suggested</h3>
                <div className="space-y-2">
                  {suggestedQuestions.slice(0, 4).map((question, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      <p className="text-sm text-gray-800">{question}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-32">
              {messages.map((message, index) => (
                <div 
                  key={message.id} 
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] ${message.role === "user" ? "order-1" : ""}`}>
                    <div 
                      className={`text-gray-800 ${
                        message.role === "user" 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-100 text-gray-800"
                      } rounded-2xl px-4 py-3`}
                    >
                      {message.role === "assistant" ? (
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap break-words">{message.content}</div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-700" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message MSASCOUT AI Assistant..."
              disabled={isLoading}
              className="w-full resize-none border border-gray-300 rounded-2xl py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              rows={1}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-3 bottom-3 h-8 w-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">
            MSASCOUT AI Assistant can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  )
}