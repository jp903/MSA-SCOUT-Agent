"use client"

import { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Building2,
  FileText,
  BarChart3,
  PieChart,
  Target,
  Loader2,
  Save,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

// Force dynamic rendering to avoid static generation issues
export const dynamic = "force-dynamic"

interface PropertyAnalysisData {
  name: string
  address: string
  state: string
  purchasePrice: number
  purchaseDate: string
  currentValue: number
  monthlyRent: number
  monthlyExpenses: number
  downPayment: number
  loanAmount: number
  interestRate: number
  loanTermYears: number
  propertyType: string
  status: string
  notes: string
  useLoan: boolean
}

interface AnalysisResults {
  monthlyMortgage: number
  monthlyCashFlow: number
  annualCashFlow: number
  capRate: number
  cashOnCashReturn: number
  totalROI: number
  breakEvenRatio: number
  recommendation: string
  riskLevel: string
}

export default function PropertyAnalysisPage() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Property data
  const [propertyData, setPropertyData] = useState<PropertyAnalysisData>({
    name: "",
    address: "",
    state: "",
    purchasePrice: 200000,
    purchaseDate: new Date().toISOString().split("T")[0],
    currentValue: 200000,
    monthlyRent: 2000,
    monthlyExpenses: 800,
    downPayment: 40000,
    loanAmount: 160000,
    interestRate: 6.0,
    loanTermYears: 30,
    propertyType: "single-family",
    status: "analyzing",
    notes: "",
    useLoan: true,
  })

  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null)

  // Initialize database and load chat history on component mount
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Load chat history - database will be initialized automatically when needed
      await loadChatHistory()
    } catch (error) {
      toast({
        title: "Initialization Error",
        description: "Failed to initialize the application",
        variant: "destructive",
      })
    }
  }

  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/chat-history")
      if (!response.ok) {
        // For property analysis, we might not need authenticated chat history
        setChatHistory([]) // Set empty history
        return
      }
      const history = await response.json()
      setChatHistory(history)
    } catch (error) {
      // Silently fail for property analysis as it may not need chat history
      setChatHistory([])
    }
  }

  const handleNewChat = async () => {
    try {
      // Navigate back to main page with new chat
      window.location.href = "/"
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      })
    }
  }

  const handleChatSelect = async (chatId: string) => {
    try {
      const chat = await chatManagerDB.getChat(chatId, null) // No user context in this page
      if (chat) {
        setCurrentChatId(chatId)
        // Navigate back to main page with selected chat
        window.location.href = `/?chat=${chatId}`
      } else {
        // Remove from history if not found
        setChatHistory((prev) => prev.filter((c) => c.id !== chatId))
        toast({
          title: "Chat Not Found",
          description: "This chat may have been deleted",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await chatManagerDB.deleteChat(chatId, null) // No user context in this page

      // Remove from history
      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))

      // If this was the current chat, clear it
      if (currentChatId === chatId) {
        setCurrentChatId(null)
      }

      toast({
        title: "Chat Deleted",
        description: "Chat has been removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      })
    }
  }

  const handleViewChange = (view: "home" | "chat" | "calculator" | "insights") => {
    // Navigate to main page with the selected view
    const viewMap = {
      home: "/?view=home",
      chat: "/?view=chat",
      calculator: "/?view=calculator",
      insights: "/?view=insights",
    }
    window.location.href = viewMap[view] || "/"
  }

  const handleInputChange = (field: keyof PropertyAnalysisData, value: any) => {
    setPropertyData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Auto-calculate loan amount when purchase price or down payment changes
    if (field === "purchasePrice" || field === "downPayment") {
      const newPurchasePrice = field === "purchasePrice" ? value : propertyData.purchasePrice
      const newDownPayment = field === "downPayment" ? value : propertyData.downPayment
      const newLoanAmount = propertyData.useLoan ? newPurchasePrice - newDownPayment : 0

      setPropertyData((prev) => ({
        ...prev,
        loanAmount: newLoanAmount,
      }))
    }

    // Handle loan toggle
    if (field === "useLoan") {
      const newLoanAmount = value ? propertyData.purchasePrice - propertyData.downPayment : 0
      setPropertyData((prev) => ({
        ...prev,
        loanAmount: newLoanAmount,
        downPayment: value ? prev.downPayment : propertyData.purchasePrice,
      }))
    }
  }

  const analyzeProperty = async () => {
    setAnalyzing(true)
    try {
      // Calculate mortgage payment
      const monthlyInterestRate = propertyData.interestRate / 100 / 12
      const numberOfPayments = propertyData.loanTermYears * 12
      let monthlyMortgage = 0

      if (propertyData.useLoan && propertyData.loanAmount > 0) {
        monthlyMortgage =
          (propertyData.loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
          (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
      }

      // Calculate cash flow
      const monthlyCashFlow = propertyData.monthlyRent - propertyData.monthlyExpenses - monthlyMortgage
      const annualCashFlow = monthlyCashFlow * 12

      // Calculate returns
      const totalInvestment = propertyData.downPayment
      const capRate =
        ((propertyData.monthlyRent * 12 - propertyData.monthlyExpenses * 12) / propertyData.currentValue) * 100
      const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0
      const totalROI =
        ((propertyData.currentValue - propertyData.purchasePrice + annualCashFlow) / totalInvestment) * 100
      const breakEvenRatio = (propertyData.monthlyExpenses + monthlyMortgage) / propertyData.monthlyRent

      // Determine recommendation and risk level
      let recommendation = "Hold"
      let riskLevel = "Medium"

      if (cashOnCashReturn > 12 && capRate > 8) {
        recommendation = "Strong Buy"
        riskLevel = "Low"
      } else if (cashOnCashReturn > 8 && capRate > 6) {
        recommendation = "Buy"
        riskLevel = "Low"
      } else if (cashOnCashReturn < 4 || capRate < 4) {
        recommendation = "Avoid"
        riskLevel = "High"
      } else if (monthlyCashFlow < 0) {
        recommendation = "Reconsider"
        riskLevel = "High"
      }

      const results: AnalysisResults = {
        monthlyMortgage,
        monthlyCashFlow,
        annualCashFlow,
        capRate,
        cashOnCashReturn,
        totalROI,
        breakEvenRatio,
        recommendation,
        riskLevel,
      }

      setAnalysisResults(results)

      toast({
        title: "Analysis Complete",
        description: "Property analysis has been completed successfully",
      })
    } catch (error) {
      console.error("Error analyzing property:", error)
      toast({
        title: "Analysis Error",
        description: "Failed to analyze property. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const saveProperty = async () => {
    if (!propertyData.name.trim() || !propertyData.address.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter property name and address",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/property-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      })

      if (!response.ok) {
        throw new Error("Failed to save property")
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Property Saved",
          description: "Property has been saved to your portfolio",
        })

        // Reset form
        setPropertyData({
          name: "",
          address: "",
          state: "",
          purchasePrice: 200000,
          purchaseDate: new Date().toISOString().split("T")[0],
          currentValue: 200000,
          monthlyRent: 2000,
          monthlyExpenses: 800,
          downPayment: 40000,
          loanAmount: 160000,
          interestRate: 6.0,
          loanTermYears: 30,
          propertyType: "single-family",
          status: "analyzing",
          notes: "",
          useLoan: true,
        })
        setAnalysisResults(null)
      } else {
        throw new Error(result.error || "Failed to save property")
      }
    } catch (error) {
      console.error("Error saving property:", error)
      toast({
        title: "Save Error",
        description: "Failed to save property. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Strong Buy":
        return "bg-green-100 text-green-800 border-green-300"
      case "Buy":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Reconsider":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "Avoid":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "High":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <div className="flex w-full">
      <AppSidebar
        activeView="home"
        onViewChange={handleViewChange}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onDeleteChat={handleDeleteChat}
      />
      <SidebarInset>
        <header className="h-4" />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Property Analysis</h1>
            </div>
          </div>

          <Tabs defaultValue="input" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Property Input</TabsTrigger>
              <TabsTrigger value="results" disabled={!analysisResults}>
                Analysis Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Property Name</Label>
                    <Input
                      id="name"
                      value={propertyData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., Main Street Rental"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={propertyData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="e.g., 123 Main St, City, State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={propertyData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="e.g., California"
                    />
                  </div>
                  <div>
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select
                      value={propertyData.propertyType}
                      onValueChange={(value) => handleInputChange("propertyType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-family">Single Family</SelectItem>
                        <SelectItem value="multi-family">Multi Family</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="purchasePrice">Purchase Price</Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        value={propertyData.purchasePrice}
                        onChange={(e) => handleInputChange("purchasePrice", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentValue">Current Value</Label>
                      <Input
                        id="currentValue"
                        type="number"
                        value={propertyData.currentValue}
                        onChange={(e) => handleInputChange("currentValue", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthlyRent">Monthly Rent</Label>
                      <Input
                        id="monthlyRent"
                        type="number"
                        value={propertyData.monthlyRent}
                        onChange={(e) => handleInputChange("monthlyRent", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                      <Input
                        id="monthlyExpenses"
                        type="number"
                        value={propertyData.monthlyExpenses}
                        onChange={(e) => handleInputChange("monthlyExpenses", Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Financing Options Section */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Financing Options</Label>
                      <RadioGroup
                        value={propertyData.useLoan ? "loan" : "cash"}
                        onValueChange={(value) => handleInputChange("useLoan", value === "loan")}
                        className="flex gap-6 mt-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="loan" id="use-loan" />
                          <Label htmlFor="use-loan" className="cursor-pointer">
                            Use Loan
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cash" id="use-cash" />
                          <Label htmlFor="use-cash" className="cursor-pointer">
                            Cash Purchase
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {propertyData.useLoan ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border">
                        <div>
                          <Label htmlFor="downPayment">Down Payment ($)</Label>
                          <Input
                            id="downPayment"
                            type="number"
                            value={propertyData.downPayment}
                            onChange={(e) => handleInputChange("downPayment", Number(e.target.value))}
                            placeholder="40000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                          <Input
                            id="loanAmount"
                            type="number"
                            value={propertyData.loanAmount}
                            disabled
                            className="bg-gray-100"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-calculated: Purchase Price - Down Payment</p>
                        </div>
                        <div>
                          <Label htmlFor="interestRate">Interest Rate (%)</Label>
                          <Input
                            id="interestRate"
                            type="number"
                            step="0.1"
                            value={propertyData.interestRate}
                            onChange={(e) => handleInputChange("interestRate", Number(e.target.value))}
                            placeholder="6.0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loanTermYears">Loan Term (Years)</Label>
                          <Input
                            id="loanTermYears"
                            type="number"
                            value={propertyData.loanTermYears}
                            onChange={(e) => handleInputChange("loanTermYears", Number(e.target.value))}
                            placeholder="30"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 rounded-lg border">
                        <div>
                          <Label htmlFor="cashAmount">Total Cash Investment ($)</Label>
                          <Input
                            id="cashAmount"
                            type="number"
                            value={propertyData.purchasePrice}
                            disabled
                            className="bg-gray-100"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Full purchase price paid in cash</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={propertyData.purchaseDate}
                      onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={propertyData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add any additional notes about this property..."
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button onClick={analyzeProperty} disabled={analyzing} className="bg-blue-600 hover:bg-blue-700">
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Analyze Property
                    </>
                  )}
                </Button>
                {analysisResults && (
                  <Button onClick={saveProperty} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Property
                      </>
                    )}
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {analysisResults && (
                <>
                  {/* Analysis Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Analysis Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <Badge className={getRecommendationColor(analysisResults.recommendation)}>
                            {analysisResults.recommendation}
                          </Badge>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Recommendation</p>
                        </div>
                        <div className="text-center">
                          <Badge className={getRiskColor(analysisResults.riskLevel)}>
                            {analysisResults.riskLevel} Risk
                          </Badge>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Risk Level</p>
                        </div>
                        <div className="text-center">
                          <Badge variant="outline">{formatPercentage(analysisResults.capRate)}</Badge>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Cap Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Cash Flow</p>
                            <p
                              className={`text-2xl font-bold ${analysisResults.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatCurrency(analysisResults.monthlyCashFlow)}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Annual Cash Flow</p>
                            <p
                              className={`text-2xl font-bold ${analysisResults.annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatCurrency(analysisResults.annualCashFlow)}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cash-on-Cash Return</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {formatPercentage(analysisResults.cashOnCashReturn)}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total ROI</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {formatPercentage(analysisResults.totalROI)}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <PieChart className="h-6 w-6 text-orange-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Financial Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Monthly Analysis</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Monthly Rent:</span>
                              <span className="font-medium">{formatCurrency(propertyData.monthlyRent)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Monthly Expenses:</span>
                              <span className="font-medium">{formatCurrency(propertyData.monthlyExpenses)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Monthly Mortgage:</span>
                              <span className="font-medium">{formatCurrency(analysisResults.monthlyMortgage)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                              <span className="font-semibold">Net Cash Flow:</span>
                              <span
                                className={`font-bold ${analysisResults.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {formatCurrency(analysisResults.monthlyCashFlow)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-300">Investment Metrics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Cap Rate:</span>
                              <span className="font-medium">{formatPercentage(analysisResults.capRate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Cash-on-Cash Return:</span>
                              <span className="font-medium">{formatPercentage(analysisResults.cashOnCashReturn)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Break-Even Ratio:</span>
                              <span className="font-medium">{analysisResults.breakEvenRatio.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Total ROI:</span>
                              <span className="font-medium">{formatPercentage(analysisResults.totalROI)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </div>
  )
}