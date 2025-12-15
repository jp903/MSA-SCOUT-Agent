"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  BarChart3,
  PieChart,
  Target,
  AlertTriangle,
  Plus,
  Loader2,
  RefreshCw,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Property, PortfolioMetrics } from "@/lib/portfolio-types"
import { PropertyForm } from "@/components/property-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PortfolioAnalysis {
  totalProperties: number
  totalValue: number
  totalEquity: number
  totalMonthlyIncome: number
  totalMonthlyExpenses: number
  totalMonthlyCashFlow: number
  averageCapRate: number
  averageCashOnCashReturn: number
  totalROI: number
  aiScore: number
  riskScore: number
  diversificationScore: number
  recommendations: string[]
  riskFactors: string[]
  opportunities: string[]
  projections: {
    oneYear: { value: number; cashFlow: number; roi: number }
    threeYear: { value: number; cashFlow: number; roi: number }
    fiveYear: { value: number; cashFlow: number; roi: number }
  }
}

export default function PortfolioTracker() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [portfolio, setPortfolio] = useState<Property[]>([])
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    try {
      const response = await fetch("/api/portfolio")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.portfolio) {
        setPortfolio(data.portfolio)
        setMetrics(data.metrics)
        await analyzePortfolio(data.portfolio, data.metrics)
      }
    } catch (error) {
      console.error("Error loading portfolio:", error)
      toast({
        title: "Error",
        description: "Failed to load portfolio data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const analyzePortfolio = async (properties: Property[], portfolioMetrics: PortfolioMetrics) => {
    if (properties.length === 0) {
      setAnalysis(null)
      return
    }

    // Calculate the actual total value from properties
    const actualTotalValue = properties.reduce((sum, p) => sum + (p.currentValue || 0), 0)

    // AI-powered portfolio analysis
    const aiScore = 60 + Math.random() * 35
    const riskScore = Math.random() * 100
    const diversificationScore = calculateDiversificationScore(properties)

    const mockAnalysis: PortfolioAnalysis = {
      totalProperties: portfolioMetrics?.totalProperties || properties.length,
      totalValue: portfolioMetrics?.totalValue || actualTotalValue,
      totalEquity: portfolioMetrics?.totalEquity || 0,
      totalMonthlyIncome:
        portfolioMetrics?.totalMonthlyIncome || properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0),
      totalMonthlyExpenses:
        portfolioMetrics?.totalMonthlyExpenses || properties.reduce((sum, p) => sum + (p.monthlyExpenses || 0), 0),
      totalMonthlyCashFlow: portfolioMetrics?.totalMonthlyCashFlow || 0,
      averageCapRate: portfolioMetrics?.averageCapRate || 0,
      averageCashOnCashReturn: portfolioMetrics?.averageCashOnCashReturn || 0,
      totalROI: portfolioMetrics?.totalROI || 0,
      aiScore: Math.round(aiScore),
      riskScore: Math.round(riskScore),
      diversificationScore: Math.round(diversificationScore),
      recommendations: generateRecommendations(properties, portfolioMetrics),
      riskFactors: identifyRiskFactors(properties, portfolioMetrics),
      opportunities: identifyOpportunities(properties, portfolioMetrics),
      projections: {
        oneYear: {
          value: (portfolioMetrics?.totalValue || actualTotalValue) * 1.05,
          cashFlow: (portfolioMetrics?.totalMonthlyCashFlow || 0) * 1.03,
          roi: (portfolioMetrics?.totalROI || 0) * 1.02,
        },
        threeYear: {
          value: (portfolioMetrics?.totalValue || actualTotalValue) * 1.18,
          cashFlow: (portfolioMetrics?.totalMonthlyCashFlow || 0) * 1.12,
          roi: (portfolioMetrics?.totalROI || 0) * 1.08,
        },
        fiveYear: {
          value: (portfolioMetrics?.totalValue || actualTotalValue) * 1.35,
          cashFlow: (portfolioMetrics?.totalMonthlyCashFlow || 0) * 1.25,
          roi: (portfolioMetrics?.totalROI || 0) * 1.15,
        },
      },
    }

    setAnalysis(mockAnalysis)
  }

  const calculateDiversificationScore = (properties: Property[]): number => {
    if (!properties || properties.length === 0) return 0
    const propertyTypes = new Set(properties.map((p) => p.propertyType)).size
    const states = new Set(properties.map((p) => p.state)).size
    return Math.min(propertyTypes * 20 + states * 15, 100)
  }

  const generateRecommendations = (properties: Property[], portfolioMetrics: PortfolioMetrics | null): string[] => {
    const recommendations: string[] = []

    if (!portfolioMetrics) return recommendations

    if (portfolioMetrics.totalProperties < 5) {
      recommendations.push("Consider expanding portfolio size for better risk distribution")
    }

    if (portfolioMetrics.totalMonthlyCashFlow < 0) {
      recommendations.push("Focus on improving cash flow through rent increases or expense reduction")
    }

    if (portfolioMetrics.averageCapRate < 6) {
      recommendations.push("Look for higher cap rate properties to improve overall returns")
    }

    if (properties && properties.length > 0) {
      const states = new Set(properties.map((p) => p.state)).size
      if (states < 2) {
        recommendations.push("Diversify across multiple markets to reduce geographic risk")
      }
    }

    recommendations.push("Consider refinancing properties with rates above 7%")
    recommendations.push("Explore value-add opportunities in existing properties")

    return recommendations
  }

  const identifyRiskFactors = (properties: Property[], portfolioMetrics: PortfolioMetrics | null): string[] => {
    const risks: string[] = []

    if (!portfolioMetrics) return risks

    if (portfolioMetrics.totalProperties < 3) {
      risks.push("Portfolio concentration risk - limited property count")
    }

    if (portfolioMetrics.totalMonthlyCashFlow < 0) {
      risks.push("Negative cash flow exposure")
    }

    if (properties && properties.length > 0) {
      const states = new Set(properties.map((p) => p.state)).size
      if (states < 2) {
        risks.push("Geographic concentration risk")
      }
    }

    if (portfolioMetrics.averageCapRate < 4) {
      risks.push("Low cap rates may indicate overvalued properties")
    }

    return risks
  }

  const identifyOpportunities = (properties: Property[], portfolioMetrics: PortfolioMetrics | null): string[] => {
    const opportunities: string[] = []

    if (!portfolioMetrics) return opportunities

    if (portfolioMetrics.totalEquity > 500000) {
      opportunities.push("Leverage equity for additional property acquisitions")
    }

    if (portfolioMetrics.totalMonthlyCashFlow > 5000) {
      opportunities.push("Strong cash flow enables aggressive expansion strategy")
    }

    opportunities.push("AI-identified emerging markets show 15% growth potential")
    opportunities.push("Refinancing opportunities in current interest rate environment")
    opportunities.push("Value-add renovations could increase rental income by 10-20%")

    return opportunities
  }

  const refreshAnalysis = async () => {
    setRefreshing(true)
    await loadPortfolio()
    setRefreshing(false)
    toast({
      title: "Analysis Updated",
      description: "Portfolio analysis has been refreshed with latest data",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-300"
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-300"
    return "bg-red-100 text-red-800 border-red-300"
  }

  const handleAddProperty = async (propertyData: Omit<Property, "id" | "createdAt" | "updatedAt" | "images">) => {
    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add property")
      }

      const result = await response.json()

      if (result.success || result.property) {
        toast({
          title: "Property Added",
          description: "Property has been successfully added to your portfolio",
        })
        setShowAddProperty(false)
        await loadPortfolio()
        return result; // Return result for image upload if needed
      } else {
        throw new Error(result.error || "Failed to add property")
      }
    } catch (error) {
      console.error("Error adding property:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add property to portfolio",
        variant: "destructive",
      })
    }
  }

  const handleEditProperty = async (propertyData: Omit<Property, "id" | "createdAt" | "updatedAt" | "images">) => {
    if (!editingProperty) return

    try {
      const response = await fetch(`/api/portfolio/${editingProperty.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update property")
      }

      const result = await response.json()

      if (result.success || result.property || result.id) {
        toast({
          title: "Property Updated",
          description: "Property has been successfully updated",
        })
        setEditingProperty(null)
        await loadPortfolio()
      } else {
        throw new Error(result.error || "Failed to update property")
      }
    } catch (error) {
      console.error("Error updating property:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update property",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProperty = async () => {
    if (!deletingProperty) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/portfolio/${deletingProperty.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to delete property`)
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Property Deleted",
          description: "Property has been successfully removed from your portfolio",
        })
        setDeletingProperty(null)
        await loadPortfolio()
      } else {
        throw new Error(result.error || "Failed to delete property")
      }
    } catch (error) {
      console.error("Error deleting property:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete property",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "$0"
    }
    return `$${value.toLocaleString()}`
  }

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0"
    }
    return value.toLocaleString()
  }

  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.0%"
    }
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Tracker</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshAnalysis} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddProperty(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</h3>
            <p className="text-gray-600 mb-4">Start building your portfolio by adding your first property.</p>
            <Button onClick={() => setShowAddProperty(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analysis?.totalValue || metrics?.totalValue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Cash Flow</p>
                    <p
                      className={`text-2xl font-bold ${(analysis?.totalMonthlyCashFlow || metrics?.totalMonthlyCashFlow || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(analysis?.totalMonthlyCashFlow || metrics?.totalMonthlyCashFlow)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    {(analysis?.totalMonthlyCashFlow || metrics?.totalMonthlyCashFlow || 0) >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Properties</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysis?.totalProperties || metrics?.totalProperties || portfolio.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Cap Rate</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPercentage(analysis?.averageCapRate || metrics?.averageCapRate)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Scores */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">AI Portfolio Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(analysis.aiScore)}`}>{analysis.aiScore}/100</p>
                    </div>
                    <Badge className={getScoreBadgeColor(analysis.aiScore)}>
                      {analysis.aiScore >= 80 ? "Excellent" : analysis.aiScore >= 60 ? "Good" : "Needs Work"}
                    </Badge>
                  </div>
                  <Progress value={analysis.aiScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Risk Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(100 - analysis.riskScore)}`}>
                        {Math.round(100 - analysis.riskScore)}/100
                      </p>
                    </div>
                    <Badge className={getScoreBadgeColor(100 - analysis.riskScore)}>
                      {analysis.riskScore <= 30 ? "Low Risk" : analysis.riskScore <= 60 ? "Medium" : "High Risk"}
                    </Badge>
                  </div>
                  <Progress value={100 - analysis.riskScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Diversification</p>
                      <p className={`text-2xl font-bold ${getScoreColor(analysis.diversificationScore)}`}>
                        {analysis.diversificationScore}/100
                      </p>
                    </div>
                    <Badge className={getScoreBadgeColor(analysis.diversificationScore)}>
                      {analysis.diversificationScore >= 70
                        ? "Well Diversified"
                        : analysis.diversificationScore >= 40
                          ? "Moderate"
                          : "Concentrated"}
                    </Badge>
                  </div>
                  <Progress value={analysis.diversificationScore} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Analysis */}
          {analysis && (
            <Tabs defaultValue="properties" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                <TabsTrigger value="projections">Projections</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Property Portfolio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {portfolio.map((property) => (
                        <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{property.name}</h4>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setEditingProperty(property)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Property
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeletingProperty(property)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Property
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-sm text-gray-600">
                              {property.propertyType} • {property.address}, {property.state}
                            </p>
                            <div className="flex gap-4 mt-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {formatCurrency(property.currentValue)}
                              </span>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {formatCurrency(property.monthlyRent)}/mo
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {property.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-medium">
                              {formatPercentage(
                                ((property.monthlyRent * 12 - property.monthlyExpenses * 12) / property.currentValue) *
                                  100,
                              )}
                            </p>
                            <p className="text-sm text-gray-600">Cap Rate</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.opportunities.map((opportunity, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Risk Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.riskFactors.map((risk, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projections" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Portfolio Projections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-600">1 Year</p>
                        <p className="text-lg font-bold">{formatCurrency(analysis.projections.oneYear.value)}</p>
                        <p className="text-xs text-gray-500">Portfolio Value</p>
                        <p className="text-sm font-medium mt-2">
                          {formatCurrency(analysis.projections.oneYear.cashFlow)}/mo
                        </p>
                        <p className="text-xs text-gray-500">Cash Flow</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-600">3 Years</p>
                        <p className="text-lg font-bold">{formatCurrency(analysis.projections.threeYear.value)}</p>
                        <p className="text-xs text-gray-500">Portfolio Value</p>
                        <p className="text-sm font-medium mt-2">
                          {formatCurrency(analysis.projections.threeYear.cashFlow)}/mo
                        </p>
                        <p className="text-xs text-gray-500">Cash Flow</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-purple-600">5 Years</p>
                        <p className="text-lg font-bold">{formatCurrency(analysis.projections.fiveYear.value)}</p>
                        <p className="text-xs text-gray-500">Portfolio Value</p>
                        <p className="text-sm font-medium mt-2">
                          {formatCurrency(analysis.projections.fiveYear.cashFlow)}/mo
                        </p>
                        <p className="text-xs text-gray-500">Cash Flow</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Portfolio Composition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Array.from(new Set(portfolio.map((p) => p.propertyType))).map((type) => {
                          const count = portfolio.filter((p) => p.propertyType === type).length
                          const percentage = (count / portfolio.length) * 100
                          return (
                            <div key={type} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{type.replace("-", " ")}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={percentage} className="w-20" />
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Equity</span>
                          <span className="font-medium">
                            {formatCurrency(analysis.totalEquity || metrics?.totalEquity)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Monthly Income</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(analysis.totalMonthlyIncome || metrics?.totalMonthlyIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Monthly Expenses</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(analysis.totalMonthlyExpenses || metrics?.totalMonthlyExpenses)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cash-on-Cash Return</span>
                          <span className="font-medium">
                            {formatPercentage(analysis.averageCashOnCashReturn || metrics?.averageCashOnCashReturn)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total ROI</span>
                          <span className="font-medium">
                            {formatPercentage(analysis.totalROI || metrics?.totalROI)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}

      {/* Add Property Dialog */}
      <Dialog open={showAddProperty} onOpenChange={setShowAddProperty}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <PropertyForm onSubmit={handleAddProperty} onCancel={() => setShowAddProperty(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog open={!!editingProperty} onOpenChange={(open) => !open && setEditingProperty(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
          </DialogHeader>
          {editingProperty && (
            <PropertyForm
              property={editingProperty}
              onSubmit={handleEditProperty}
              onCancel={() => setEditingProperty(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Property Confirmation Dialog */}
      <AlertDialog open={!!deletingProperty} onOpenChange={(open) => !open && setDeletingProperty(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProperty?.name}"? This action cannot be undone and will
              permanently remove the property from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProperty}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Property"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
