"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Send,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  BarChart3,
  TrendingUp,
  MapPin,
  Calculator,
  Sparkles,
  MessageSquare,
} from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: string
  type?: "text" | "analysis" | "visualization"
  data?: any
}

interface EnhancedChatProps {
  onToolSelect?: (tool: string) => void
}

export function EnhancedChat({ onToolSelect }: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm MSASCOUT AI Agent, your advanced property investment assistant. I can analyze market data, create visualizations, and provide comprehensive investment insights. How can I help you today?",
      sender: "ai",
      timestamp: new Date().toISOString(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)

      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Check if message is asking for specific tools
      const lowerMessage = inputMessage.toLowerCase()
      if (lowerMessage.includes("calculator") || lowerMessage.includes("calculate")) {
        onToolSelect?.("investment-calculator")
        return
      }
      if (lowerMessage.includes("market") || lowerMessage.includes("insight")) {
        onToolSelect?.("market-insights")
        return
      }

      // Call the enhanced analysis API
      const response = await fetch("/api/analyze-market", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: inputMessage,
          includeVisuals: true,
        }),
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.analysis || "I've analyzed your request. Here are my insights based on current market data.",
        sender: "ai",
        timestamp: new Date().toISOString(),
        type: data.visualizations ? "analysis" : "text",
        data: data.visualizations,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Speak the response
      speakText(aiMessage.content)
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        sender: "ai",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
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

  const quickActions = [
    {
      label: "Analyze Market",
      icon: BarChart3,
      action: () => setInputMessage("Analyze the current real estate market trends"),
    },
    { label: "Calculate ROI", icon: Calculator, action: () => onToolSelect?.("investment-calculator") },
    { label: "Market Insights", icon: TrendingUp, action: () => onToolSelect?.("market-insights") },
    {
      label: "Compare Cities",
      icon: MapPin,
      action: () => setInputMessage("Compare real estate markets between different cities"),
    },
  ]

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b bg-white/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MSASCOUT AI Agent
                </h1>
                <p className="text-sm text-gray-600">Advanced Property Investment Assistant</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Online
            </Badge>
          </div>

          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Tools
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : ""}`}>
                {message.sender === "ai" && (
                  <Avatar className="w-10 h-10 rounded-xl shadow-md">
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-semibold">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                <Card
                  className={`max-w-[70%] shadow-md ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                      : "bg-white/90 backdrop-blur-sm"
                  }`}
                >
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {message.data && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-2">📊 Analysis Data Available</p>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("analysis")}>
                          View Visualization
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                      {message.sender === "ai" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => speakText(message.content)}
                          className="h-6 w-6 p-0"
                        >
                          {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                {message.sender === "user" && (
                  <Avatar className="w-10 h-10 rounded-xl shadow-md">
                    <AvatarFallback className="rounded-xl bg-gray-600 text-white text-sm">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 rounded-xl">
                  <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                    AI
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-white/90 backdrop-blur-sm shadow-md">
                  <CardContent className="p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="flex items-center gap-2 whitespace-nowrap bg-white/80 hover:bg-white"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about property investments, market analysis, or calculations..."
                  className="pr-12 bg-white/90 backdrop-blur-sm border-gray-200"
                  disabled={isLoading}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className={`absolute right-1 top-1 h-8 w-8 p-0 ${isListening ? "text-red-500" : "text-gray-500"}`}
                  onClick={isListening ? stopListening : startListening}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="flex-1 p-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Analysis Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Analysis visualizations will appear here when you request market data analysis.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((tool, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <tool.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">{tool.label}</h3>
                  <Button onClick={tool.action} variant="outline" size="sm">
                    Launch Tool
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedChat
