"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Calculator, TrendingUp, Building2, Search, DollarSign, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: string
}

interface EnhancedChatProps {
  onToolSelect: (toolId: string) => void
  currentChat: ChatHistoryItem | null
  onChatUpdate: (messages: Message[], title?: string) => void
}

const quickActions = [
  {
    id: "investment-calculator",
    title: "Investment Calculator",
    description: "Calculate ROI and cash flow",
    icon: Calculator,
    color: "bg-emerald-500",
  },
  {
    id: "market-insights",
    title: "Market Insights",
    description: "Real-time market data",
    icon: TrendingUp,
    color: "bg-violet-500",
  },
  {
    id: "property-analysis",
    title: "Property Analysis",
    description: "Detailed property reports",
    icon: Building2,
    color: "bg-rose-500",
  },
  {
    id: "portfolio-tracker",
    title: "Portfolio Tracker",
    description: "Track your investments",
    icon: DollarSign,
    color: "bg-amber-500",
  },
  {
    id: "deal-finder",
    title: "Deal Finder",
    description: "Find investment properties",
    icon: Search,
    color: "bg-green-500",
  },
]

const suggestedQuestions = [
  "What are the best markets for real estate investment in 2024?",
  "How do I calculate cap rate for a rental property?",
  "What should I look for when analyzing a potential investment property?",
  "How much should I put down on an investment property?",
  "What are the tax benefits of real estate investing?",
]

export default function EnhancedChat({ onToolSelect, currentChat, onChatUpdate }: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load current chat messages when currentChat changes
  useEffect(() => {
    if (currentChat && currentChat.messages) {
      setMessages(
        currentChat.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp,
        })),
      )
    } else {
      setMessages([])
    }
  }, [currentChat])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputValue.trim()
    if (!messageToSend || isLoading) return

    const userMessage: Message = {
      id: generateMessageId(),
      content: messageToSend,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")
    setIsLoading(true)

    try {
      // Simulate AI response for now
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const aiResponse: Message = {
        id: generateMessageId(),
        content: generateAIResponse(messageToSend),
        sender: "ai",
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...newMessages, aiResponse]
      setMessages(finalMessages)

      // Generate title from first message if this is a new chat
      const title = messages.length === 0 ? generateChatTitle(messageToSend) : undefined

      // Update chat in parent component
      onChatUpdate(finalMessages, title)
    } catch (error) {
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
    // Generate a title based on the first message
    const words = firstMessage.split(" ").slice(0, 6).join(" ")
    return words.length > 30 ? words.substring(0, 30) + "..." : words
  }

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("market") || lowerMessage.includes("investment")) {
      return "Based on current market data, I can help you analyze investment opportunities. The top performing markets right now include Florida, Texas, and Arizona, which are showing strong population growth and job creation. Would you like me to provide detailed market insights for any specific region?"
    }

    if (lowerMessage.includes("cap rate") || lowerMessage.includes("calculate")) {
      return "Cap rate (Capitalization Rate) is calculated as: Annual Net Operating Income ÷ Property Value × 100. For example, if a property generates $12,000 annually and costs $200,000, the cap rate is 6%. Generally, cap rates between 4-10% are considered good, depending on the market and property type. Would you like me to open the Investment Calculator for detailed analysis?"
    }

    if (lowerMessage.includes("property analysis") || lowerMessage.includes("analyze")) {
      return "When analyzing investment properties, focus on these key factors: 1) Location and neighborhood trends, 2) Cash flow potential, 3) Cap rate and ROI, 4) Property condition and repair costs, 5) Local rental demand, 6) Future development plans. I can help you analyze specific properties using our Property Analysis tool. Would you like me to open it?"
    }

    if (lowerMessage.includes("down payment") || lowerMessage.includes("financing")) {
      return "For investment properties, typical down payments range from 20-25% for conventional loans. Some options include: • Conventional loans: 20-25% down • Portfolio lenders: 15-20% down • Hard money: 10-15% down (short-term) • Cash purchases: 100% down. The amount depends on your financial situation, loan type, and investment strategy. Would you like help calculating different financing scenarios?"
    }

    if (lowerMessage.includes("tax") || lowerMessage.includes("benefit")) {
      return "Real estate investing offers several tax benefits: 1) Depreciation deductions, 2) Mortgage interest deduction, 3) Property tax deductions, 4) Repair and maintenance expenses, 5) 1031 exchanges for deferring capital gains. These can significantly improve your overall returns. I recommend consulting with a tax professional for your specific situation."
    }

    return "I'm here to help with your real estate investment questions! I can assist with market analysis, property evaluation, financial calculations, and investment strategies. Feel free to ask about specific markets, properties, or use our specialized tools for detailed analysis."
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
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

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white rounded-t-lg">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">AI Property Investment Assistant</h2>
          <p className="text-sm text-gray-600">Get expert insights and analysis</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MSASCOUT AI</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                I'm your AI property investment assistant. Ask me anything about real estate investing, market analysis,
                or use our specialized tools.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {quickActions.map((action) => (
                  <Card
                    key={action.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                    onClick={() => handleQuickAction(action.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">{action.title}</h5>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Suggested Questions</h4>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-3 text-wrap bg-transparent"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-blue-600 text-white" : "bg-white border shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                {message.sender === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-600 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border shadow-sm rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about real estate investing..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
