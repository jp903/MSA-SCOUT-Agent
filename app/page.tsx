"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Loader2, TrendingUp, MapPin, Sparkles } from "lucide-react"
import PortfolioDashboard from "@/components/portfolio-dashboard"
import PropertyForm from "@/components/property-form"
import PropertyDetails from "@/components/property-details"
import PropertyCalculator from "@/components/property-calculator"
import type { Property } from "@/lib/portfolio-types"
import { AppSidebar } from "@/components/app-sidebar"
import ChatInterface from "@/components/chat-interface"
import MarketInsights from "@/components/market-insights"
import ChatHistory from "@/components/chat-history"

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]

type ViewMode =
  | "home"
  | "chat"
  | "calculator"
  | "insights"
  | "portfolio"
  | "ai analysis"
  | "add-property"
  | "edit-property"
  | "view-property"

export default function PropertyInvestmentAgent() {
  const [viewMode, setViewMode] = useState<ViewMode>("home")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; title: string; timestamp: string }>>([
    {
      id: "1",
      title: "Property Analysis for Texas Market",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      title: "Investment Calculator for $500K Budget",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      title: "Market Insights for California",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      title: "ROI Analysis for Multi-Family Properties",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "5",
      title: "Florida Real Estate Opportunities",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ])

  // Agent state
  const [selectedState, setSelectedState] = useState("")
  const [budget, setBudget] = useState("")
  const [investmentGoals, setInvestmentGoals] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!selectedState || !budget || !investmentGoals) {
      alert("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/analyze-property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: selectedState,
          investmentGoals,
          budget: Number.parseInt(budget.replace(/,/g, "")),
        }),
      })

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Error analyzing property:", error)
      alert("Error analyzing property. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProperty = () => {
    setSelectedProperty(null)
    setViewMode("add-property")
  }

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property)
    setViewMode("edit-property")
  }

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property)
    setViewMode("view-property")
  }

  const handleSaveProperty = () => {
    setViewMode("portfolio")
    setSelectedProperty(null)
  }

  const handleCancelProperty = () => {
    setViewMode("portfolio")
    setSelectedProperty(null)
  }

  const handleNewChat = () => {
    const newChat = {
      id: crypto.randomUUID(),
      title: `New Chat ${chatHistory.length + 1}`,
      timestamp: new Date().toISOString(),
    }
    setChatHistory([newChat, ...chatHistory])
    setViewMode("chat")
  }

  const handleToolSelect = (tool: string) => {
    switch (tool) {
      case "investment-calculator":
        setViewMode("calculator")
        break
      case "market-insights":
        setViewMode("insights")
        break
      case "ai-chat":
        setViewMode("chat")
        break
      default:
        setViewMode("home")
    }
  }

  return (
    <>
      <AppSidebar
        activeView={viewMode}
        onViewChange={(view) => setViewMode(view as ViewMode)}
        onNewChat={handleNewChat}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>

        <div className="flex-1">
          {viewMode === "home" && (
            <div className="h-[calc(100vh-4rem)] overflow-auto">
              <ChatInterface onToolSelect={handleToolSelect} />
            </div>
          )}

          {viewMode === "chat" && (
            <div className="h-[calc(100vh-4rem)] p-4">
              <ChatHistory
                chatHistory={chatHistory}
                onChatSelect={(chatId) => {
                  // Handle chat selection
                  console.log("Selected chat:", chatId)
                }}
                onDeleteChat={(chatId) => {
                  setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))
                }}
              />
            </div>
          )}

          {viewMode === "calculator" && (
            <div className="p-4">
              <div className="max-w-4xl mx-auto">
                <PropertyCalculator />
              </div>
            </div>
          )}

          {viewMode === "insights" && (
            <div className="p-4">
              <div className="max-w-6xl mx-auto">
                <MarketInsights />
              </div>
            </div>
          )}

          {viewMode === "portfolio" && (
            <div className="min-h-[calc(100vh-4rem)] bg-muted/50 p-6">
              <PortfolioDashboard
                onAddProperty={handleAddProperty}
                onEditProperty={handleEditProperty}
                onViewProperty={handleViewProperty}
              />
            </div>
          )}

          {viewMode === "ai analysis" && (
            <div className="min-h-[calc(100vh-4rem)] bg-muted/50 p-6">
              <div className="space-y-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Investment Analysis</h2>
                  <p className="text-lg text-gray-600">
                    Get personalized property investment recommendations powered by AI
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Input Form */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        Investment Parameters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                          Target State
                        </Label>
                        <Select value={selectedState} onValueChange={setSelectedState}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a US state" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
                          Investment Budget ($)
                        </Label>
                        <Input
                          id="budget"
                          type="text"
                          placeholder="e.g., 500,000"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="goals" className="text-sm font-medium text-gray-700">
                          Investment Goals
                        </Label>
                        <Textarea
                          id="goals"
                          placeholder="Describe your investment strategy and goals..."
                          value={investmentGoals}
                          onChange={(e) => setInvestmentGoals(e.target.value)}
                          rows={4}
                          className="mt-1"
                        />
                      </div>

                      <Button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Market...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Analysis Results */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        AI Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysis ? (
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border">
                            {analysis}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-12">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-8 w-8 text-blue-600" />
                          </div>
                          <p className="text-sm">
                            Enter your investment parameters and let MSASCOUT AI analyze the market for you
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Property Form Modal */}
        {(viewMode === "add-property" || viewMode === "edit-property") && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <PropertyForm
                property={selectedProperty || undefined}
                onSave={handleSaveProperty}
                onCancel={handleCancelProperty}
              />
            </div>
          </div>
        )}

        {/* Property Details Modal */}
        {viewMode === "view-property" && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
              <PropertyDetails
                property={selectedProperty}
                onBack={() => setViewMode("portfolio")}
                onEdit={() => setViewMode("edit-property")}
              />
            </div>
          </div>
        )}
      </SidebarInset>
    </>
  )
}
