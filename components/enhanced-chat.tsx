"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Send,
  User,
  Bot,
  Copy,
  Check,
  Download,
  FileText,
  Presentation,
  TrendingUp,
  DollarSign,
  Home,
} from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface EnhancedChatProps {
  onSuggestedQuestion?: (question: string) => void
}

export default function EnhancedChat({ onSuggestedQuestion }: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy message",
        variant: "destructive",
      })
    }
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    try {
      let fileContent = content
      let mimeType = "text/plain"

      if (type === "slides") {
        // Convert markdown to HTML for slides
        fileContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Real Estate Investment Presentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1d4ed8; margin-top: 30px; }
        h3 { color: #1e40af; }
        ul { margin: 10px 0; }
        li { margin: 5px 0; }
        .slide { page-break-after: always; margin-bottom: 50px; }
    </style>
</head>
<body>
    ${content.replace(/\n/g, "<br>").replace(/#{1,3}\s/g, (match) => {
      const level = match.trim().length
      return level === 1 ? "<h1>" : level === 2 ? "<h2>" : "<h3>"
    })}
</body>
</html>`
        mimeType = "text/html"
        filename = filename.replace(".txt", ".html")
      } else if (type === "pdf") {
        // Format for PDF-ready content
        fileContent = `REAL ESTATE INVESTMENT REPORT\n\n${content}`
        filename = filename.replace(".txt", ".pdf.txt")
      } else if (type === "docx") {
        // Format for DOCX-ready content
        fileContent = content
        filename = filename.replace(".txt", ".docx.txt")
      }

      const blob = new Blob([fileContent], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: `${filename} is being downloaded`,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download file",
        variant: "destructive",
      })
    }
  }

  const handleDownloadClick = (content: string, type: string) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const filename = `real-estate-${type}-${timestamp}.txt`
    downloadFile(content, filename, type)
  }

  const processMessageContent = (content: string) => {
    // Replace download links with actual download buttons
    return content.replace(
      /\[Download (.*?)\]$$download-(.*?)$$/g,
      (match, text, type) => `__DOWNLOAD_BUTTON_${type}_${text}__`,
    )
  }

  const renderMessageContent = (content: string, messageId: string) => {
    const processedContent = processMessageContent(content)

    return (
      <div className="space-y-4">
        <ReactMarkdown
          className="prose prose-sm max-w-none"
          components={{
            h1: ({ children }) => (
              <h1 className="text-xl font-bold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4">{children}</h1>
            ),
            h2: ({ children }) => <h2 className="text-lg font-semibold text-blue-700 mt-6 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-md font-medium text-blue-800 mt-4 mb-2">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 ml-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 ml-4">{children}</ol>,
            li: ({ children }) => <li className="text-gray-700">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            p: ({ children }) => <p className="mb-3 text-gray-700">{children}</p>,
          }}
        >
          {processedContent}
        </ReactMarkdown>

        {/* Render download buttons */}
        {processedContent.includes("__DOWNLOAD_BUTTON_") && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {processedContent.match(/__DOWNLOAD_BUTTON_(.*?)_(.*?)__/g)?.map((match, index) => {
              const [, type, text] = match.match(/__DOWNLOAD_BUTTON_(.*?)_(.*?)__/) || []
              const buttonText = text?.replace(/_/g, " ") || "Download"

              let icon = <Download className="w-4 h-4" />
              let variant: "default" | "secondary" | "destructive" = "default"

              if (type === "slides") {
                icon = <Presentation className="w-4 h-4" />
                variant = "default"
              } else if (type === "pdf") {
                icon = <FileText className="w-4 h-4" />
                variant = "destructive"
              } else if (type === "docx") {
                icon = <FileText className="w-4 h-4" />
                variant = "secondary"
              }

              return (
                <Button
                  key={index}
                  variant={variant}
                  size="sm"
                  onClick={() => handleDownloadClick(content, type)}
                  className="flex items-center gap-2"
                >
                  {icon}
                  {buttonText}
                </Button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const data = JSON.parse(line.slice(2))
              if (data.type === "text-delta") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id ? { ...msg, content: msg.content + data.textDelta } : msg,
                  ),
                )
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    "Analyze current mortgage rates and their impact on real estate investments",
    "Create a market analysis report for residential properties",
    "Generate investment slides for a rental property presentation",
    "What are the current housing market trends based on latest data?",
    "Calculate ROI for a $300,000 rental property with 20% down payment",
  ]

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          AI Real Estate Investment Advisor
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Live Market Data
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <DollarSign className="w-3 h-3 mr-1" />
            Financial Analysis
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Home className="w-3 h-3 mr-1" />
            Property Insights
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to Your AI Real Estate Advisor</h3>
                <p className="text-muted-foreground mb-6">
                  Get expert insights with real-time market data from Census, BLS, and FRED APIs
                </p>
                <div className="grid gap-2 max-w-2xl mx-auto">
                  <p className="text-sm font-medium text-left">Try asking:</p>
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left justify-start h-auto p-3 text-sm bg-transparent"
                      onClick={() => {
                        setInput(question)
                        onSuggestedQuestion?.(question)
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="flex gap-3 group">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback>
                    {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{message.role === "user" ? "You" : "AI Advisor"}</span>
                    <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => copyToClipboard(message.content, message.id)}
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    {message.role === "assistant" ? (
                      renderMessageContent(message.content, message.id)
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback>
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span className="text-sm text-muted-foreground ml-2">Analyzing with real-time data...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <Separator />

        <form onSubmit={handleSubmit} className="p-6 pt-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about real estate investments, market analysis, or request reports..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
