"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Paperclip,
  Mic,
  RotateCcw,
  Calculator,
  TrendingUp,
  FileText,
  MessageSquare,
  Building2,
  DollarSign,
  Search,
  Phone,
} from "lucide-react"

interface ChatInterfaceProps {
  onToolSelect?: (tool: string) => void
}

export default function ChatInterface({ onToolSelect }: ChatInterfaceProps) {
  const [message, setMessage] = useState("")

  const tools = [
    {
      name: "Property Analysis",
      icon: Building2,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Analyze properties",
    },
    {
      name: "Investment Calculator",
      icon: Calculator,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Calculate ROI",
    },
    {
      name: "Market Insights",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Market trends",
    },
    {
      name: "AI Chat",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Chat with AI",
    },
    {
      name: "Portfolio Reports",
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Generate reports",
    },
    {
      name: "Financial Analysis",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Financial insights",
    },
    {
      name: "Market Research",
      icon: Search,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Deep research",
    },
    {
      name: "Expert Consultation",
      icon: Phone,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      description: "Call experts",
    },
  ]

  return (
    <div className="flex flex-col justify-center min-h-full px-4 py-8">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Main Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MSASCOUT AI Agent</h1>
        </div>

        {/* Chat Input */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything, create anything"
              className="w-full h-14 px-6 pr-32 text-lg border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                <Paperclip className="h-4 w-4 text-gray-500" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                <Mic className="h-4 w-4 text-gray-500" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                <RotateCcw className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
            {tools.map((tool, index) => (
              <div
                key={index}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onToolSelect?.(tool.name.toLowerCase().replace(" ", "-"))}
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${tool.bgColor} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm`}
                >
                  <tool.icon className={`h-8 w-8 ${tool.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* For You Section */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900">For You</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Market Analysis",
                subtitle: "Real Estate Trends",
                image: "/placeholder.svg?height=120&width=200",
              },
              {
                title: "Investment Guide",
                subtitle: "Property ROI Tips",
                image: "/placeholder.svg?height=120&width=200",
              },
              {
                title: "Portfolio Review",
                subtitle: "Performance Metrics",
                image: "/placeholder.svg?height=120&width=200",
              },
              {
                title: "Market Insights",
                subtitle: "Latest Updates",
                image: "/placeholder.svg?height=120&width=200",
              },
            ].map((item, index) => (
              <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-24 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white">
                    <div className="text-xs font-medium">{item.title}</div>
                    <div className="text-xs opacity-90">{item.subtitle}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
