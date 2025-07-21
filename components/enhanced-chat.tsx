"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Send, Loader2, User, Bot, Home, TrendingUp, Calculator, Building2 } from "lucide-react"
import { useChat } from "ai/react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function EnhancedChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  const welcomePrompts = [
    {
      icon: Building2,
      title: "Analyze Property",
      description: "Get detailed analysis of a specific property investment",
      prompt:
        "I want to analyze a property investment opportunity. Can you help me evaluate the potential returns and risks?",
    },
    {
      icon: TrendingUp,
      title: "Market Research",
      description: "Research current market trends and opportunities",
      prompt: "What are the current real estate market trends I should know about for property investment?",
    },
    {
      icon: Calculator,
      title: "Calculate ROI",
      description: "Calculate return on investment for properties",
      prompt: "Help me calculate the ROI for a rental property investment. What factors should I consider?",
    },
    {
      icon: Home,
      title: "Location Analysis",
      description: "Analyze the best locations for investment",
      prompt: "Which locations or markets are currently best for real estate investment and why?",
    },
  ]

  const handlePromptClick = (prompt: string) => {
    handleInputChange({ target: { value: prompt } } as any)
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Chat</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col h-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MSASCOUT AI</h2>
                  <p className="text-gray-600">
                    Your intelligent property investment assistant. Ask me anything about real estate analysis, market
                    trends, or investment strategies.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {welcomePrompts.map((prompt, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
                    onClick={() => handlePromptClick(prompt.prompt)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <prompt.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{prompt.title}</h3>
                          <p className="text-sm text-gray-600">{prompt.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-10 h-10 border-2 border-blue-200">
                      <AvatarImage src="/placeholder-logo.svg" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="w-10 h-10 border-2 border-purple-200">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <Avatar className="w-10 h-10 border-2 border-blue-200">
                    <AvatarImage src="/placeholder-logo.svg" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%] rounded-2xl px-6 py-4 bg-white border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask me about property investment, market analysis, or any real estate questions..."
                  className="min-h-[60px] text-base resize-none rounded-2xl border-2 border-gray-200 focus:border-blue-500 px-6 py-4"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-[60px] w-[60px] rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
