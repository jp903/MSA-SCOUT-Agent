"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Send,
  Bot,
  User,
  Calculator,
  TrendingUp,
  Building2,
  Search,
  DollarSign,
  Loader2,
  Copy,
  Check,
  FileText,
  Presentation,
  RotateCcw,
  Paperclip,
  Search as SearchIcon,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { ChatHistoryItem, ChatMessage as Message } from "@/lib/chat-types"
import DocumentUploader from "@/components/document-uploader"

interface EnhancedChatProps {
  onToolSelect: (toolId: string) => void
  currentChat: ChatHistoryItem | null
  onChatUpdate: (messages: Omit<Message, 'id'>[], title?: string) => void
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
  "What are the current market conditions for real estate investment?",
  "How do interest rates affect property investment returns?",
  "What markets are showing the best population growth right now?",
  "Can you analyze unemployment trends in major metros?",
  "Generate a market analysis report for Texas markets",
  "Create slides on current investment opportunities",
]

export default function EnhancedChat({ onToolSelect, currentChat, onChatUpdate }: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load current chat messages when currentChat changes
  useEffect(() => {
    if (currentChat && currentChat.messages) {
      setMessages(currentChat.messages)
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
      action: "",
      actionData: false
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")
    setIsLoading(true)

    try {
      console.log("🚀 Sending message to API...")

      // Prepare the message content with document information if exists
      const messageContent: {
        messages: Array<{ role: string; content: string }>;
        action: string | undefined;
        document?: { name: string; size: number; type: string; lastModified: number };
      } = {
        messages: newMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        action: action,
      }

      // Add document information if one has been uploaded
      if (uploadedDocument) {
        const docInfo = {
          name: uploadedDocument.name,
          size: uploadedDocument.size,
          type: uploadedDocument.type,
          lastModified: uploadedDocument.lastModified,
        }
        messageContent.document = docInfo
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageContent),
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ API Error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Response received:", data)

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.message,
        role: "assistant",
        action: data.action || "",
        actionData: data.researchQuery || false
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
        action: "",
        actionData: false
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

  const handleDocumentUpload = (file: File) => {
    setUploadedDocument(file);
    toast({
      title: "Document Uploaded",
      description: `${file.name} ready for analysis`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const handleDownload = (message: any) => {
    if (message.actionData?.content && message.actionData?.filename) {
      try {
        const blob = new Blob([message.actionData.content], {
          type: message.actionData.filename.endsWith(".html") ? "text/html" : "text/plain",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = message.actionData.filename
        a.style.display = "none"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Download Started",
          description: `${message.actionData.filename} is downloading...`,
        })
      } catch (error) {
        console.error("Download error:", error)
        toast({
          title: "Download Failed",
          description: "Failed to download file. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleReportFormat = (format: "pdf" | "docx") => {
    const action = format === "pdf" ? "download_pdf" : "download_docx"
    handleSendMessage(`Generate ${format.toUpperCase()} report`, action)
  }

  const formatMessage = (content: string) => {
    // Convert markdown to HTML with improved handling
    let formatted = content;

    // Process code blocks first to avoid conflicts with other formats
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg my-3 overflow-x-auto"><code class="text-sm">$1</code></pre>');
    
    // Headers
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>');
    
    // Bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    // Italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Bullet points (unordered lists) - temporarily simplified
    formatted = formatted.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc list-inside">$1</li>');
    
    // Numbered lists - temporarily simplified  
    formatted = formatted.replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal list-inside">$1</li>');
    
    // Split content by line breaks to process paragraphs
    const lines = formatted.split(/\n\n/);
    let result = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('<li class="ml-4 list-disc') || line.startsWith('<li class="ml-4 list-decimal')) {
        if (!inList) {
          result += '<ul class="mb-3 ml-4">';
          inList = true;
        }
        result += line;
        // Check if next line is also a list item
        if (i + 1 >= lines.length || (!lines[i + 1].trim().startsWith('<li class="ml-4 list'))) {
          result += '</ul>';
          inList = false;
        }
      } else {
        if (inList) {
          result += '</ul>';
          inList = false;
        }
        
        if (line) {
          // Check if the line is already a special element
          if (line.startsWith('<h1') || line.startsWith('<h2') || line.startsWith('<h3') || 
              line.startsWith('<pre') || line.startsWith('<code') || line.startsWith('<strong') || 
              line.startsWith('<em') || line.startsWith('<ul')) {
            result += line;
          } else {
            // Wrap content in paragraph tags
            result += `<p class="mb-3">${line}</p>`;
          }
        }
      }
    }

    // Close any open lists
    if (inList) {
      result += '</ul>';
    }

    return result;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="font-semibold text-gray-900">MSASCOUT AI Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSendMessage()}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-white p-4 overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto w-full">
            {messages.length === 0 ? (
              <div className="space-y-6 animate-fade-in">
                {/* Welcome Message */}
                <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Welcome to MSASCOUT AI
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-lg">
                  I'm your AI property investment assistant with access to real-time Census, BLS, and FRED data. Ask me
                  about market conditions, generate reports, or use our specialized tools.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 text-lg">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Card
                      key={action.id}
                      className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 transform border-0 shadow-md bg-gradient-to-br from-white to-gray-50 animate-fade-in-up ${
                        index % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1"
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleQuickAction(action.id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <div className={`${action.color} rounded-xl p-3 shadow-md`}>
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h5 className="font-bold text-base">{action.title}</h5>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 text-lg">Ask About Real-Time Market Data</h4>
                <div className="space-y-3">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full text-left justify-start h-auto p-4 text-wrap bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 rounded-xl"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      <span className="flex items-start">
                        <span className="mr-3 mt-1 text-blue-500">•</span>
                        {question}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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

                  <div
                    className={`max-w-[85%] ${message.role === "user" ? "order-1" : ""}`}
                  >
                    <div
                      className={`text-gray-800 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      } rounded-2xl px-4 py-3`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {message.role === "assistant" ? (
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                            />
                          ) : (
                            <div className="whitespace-pre-wrap break-words">{message.content}</div>
                          )}

                          {/* Action buttons for special responses */}
                          {message.action === "download_slides" && message.actionData && (
                            <div className="mt-3">
                              <Button
                                onClick={() => handleDownload(message)}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                size="sm"
                              >
                                <Presentation className="h-4 w-4 mr-2" />
                                Download Slides
                              </Button>
                            </div>
                          )}

                          {message.action === "download_pdf" && message.actionData && (
                            <div className="mt-3">
                              <Button
                                onClick={() => handleDownload(message)}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                size="sm"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Download PDF Report
                              </Button>
                            </div>
                          )}

                          {message.action === "download_docx" && message.actionData && (
                            <div className="mt-3">
                              <Button
                                onClick={() => handleDownload(message)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                size="sm"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Download DOCX Report
                              </Button>
                            </div>
                          )}

                          {message.action === "ask_report_format" && (
                            <div className="mt-3 flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReportFormat("pdf")}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReportFormat("docx")}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                DOCX
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
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

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Message MSASCOUT AI Assistant..."
              disabled={isLoading}
              className="w-full resize-none border border-gray-300 rounded-2xl py-3 pl-24 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              rows={1}
            />
            <div className="absolute left-3 bottom-3 flex gap-1">
              <DocumentUploader onFileUpload={handleDocumentUpload} disabled={isLoading} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSendMessage("Perform deep research on: " + inputValue, "deep_research")}
                disabled={isLoading}
                className="h-8 w-8 p-0"
                title="Deep Research"
              >
                <SearchIcon className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-3 bottom-3 h-8 w-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          {uploadedDocument && (
            <div className="mt-2 flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <Paperclip className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 truncate max-w-xs">{uploadedDocument.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadedDocument(null)}
                className="h-6 w-6 p-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </Button>
            </div>
          )}
          <p className="text-xs text-center text-gray-500 mt-2">
            MSASCOUT AI Assistant can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  )
}