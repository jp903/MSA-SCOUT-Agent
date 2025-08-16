"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calculator,
  Target,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PropertyAnalysisData {
  address: string
  propertyType: string
  purchasePrice: number
  estimatedValue: number
  monthlyRent: number
  monthlyExpenses: number
  capRate: number
  cashOnCashReturn: number
  roi: number
  aiScore: number
  marketScore: number
  riskScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  marketComparisons: {
    averagePrice: number
    averageRent: number
    averageCapRate: number
  }
  projections: {
    oneYear: { value: number; rent: number }
    threeYear: { value: number; rent: number }
    fiveYear: { value: number; rent: number }
  }
}

export default function PropertyAnalysis() {
  const [loading, setLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState<PropertyAnalysisData | null>(null)
  const [formData, setFormData] = useState({
    address: "",
    propertyType: "",
    purchasePrice: "",
    monthlyRent: "",
    monthlyExpenses: "",
    downPayment: "",
    loanRate: "",
    investmentGoals: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const analyzeProperty = async () => {
    if (!formData.address || !formData.propertyType || !formData.purchasePrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate API call to analyze property
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const purchasePrice = Number.parseFloat(formData.purchasePrice)
      const monthlyRent = Number.parseFloat(formData.monthlyRent) || 0
      const monthlyExpenses = Number.parseFloat(formData.monthlyExpenses) || 0

      // Calculate metrics
      const annualRent = monthlyRent * 12
      const annualExpenses = monthlyExpenses * 12
      const netOperatingIncome = annualRent - annualExpenses
      const capRate = (netOperatingIncome / purchasePrice) * 100

      const downPayment = Number.parseFloat(formData.downPayment) || purchasePrice * 0.2
      const cashOnCashReturn = (((monthlyRent - monthlyExpenses) * 12) / downPayment) * 100

      // AI-powered analysis simulation
      const aiScore = 65 + Math.random() * 30
      const marketScore = 60 + Math.random() * 35
      const riskScore = Math.random() * 100

      const mockAnalysis: PropertyAnalysisData = {
        address: formData.address,
        propertyType: formData.propertyType,
        purchasePrice,
        estimatedValue: purchasePrice * (0.95 + Math.random() * 0.1),
        monthlyRent,
        monthlyExpenses,
        capRate,
        cashOnCashReturn,
        roi: capRate + cashOnCashReturn / 2,
        aiScore: Math.round(aiScore),
        marketScore: Math.round(marketScore),
        riskScore: Math.round(riskScore),
        strengths: [
          "Strong rental demand in the area",
          "Good school district nearby",
          "Growing employment market",
          "Low crime rate",
          "Transportation accessibility",
        ].slice(0, 3 + Math.floor(Math.random() * 3)),
        weaknesses: [
          "Higher property taxes",
          "Potential maintenance costs",
          "Market volatility risk",
          "Limited parking",
          "Older building infrastructure",
        ].slice(0, 2 + Math.floor(Math.random() * 2)),
        recommendations: [
          "Consider negotiating purchase price down by 5%",
          "Explore rent increase potential",
          "Budget for capital improvements",
          "Consider refinancing options",
          "Monitor local market trends",
        ].slice(0, 3 + Math.floor(Math.random() * 2)),
        marketComparisons: {
          averagePrice: purchasePrice * (0.9 + Math.random() * 0.2),
          averageRent: monthlyRent * (0.9 + Math.random() * 0.2),
          averageCapRate: capRate * (0.8 + Math.random() * 0.4),
        },
        projections: {
          oneYear: {
            value: purchasePrice * 1.05,
            rent: monthlyRent * 1.03,
          },
          threeYear: {
            value: purchasePrice * 1.18,
            rent: monthlyRent * 1.12,
          },
          fiveYear: {
            value: purchasePrice * 1.35,
            rent: monthlyRent * 1.28,
          },
        },
      }

      setAnalysisData(mockAnalysis)

      // Save to database
      await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: formData.address,
          propertyType: formData.propertyType,
          purchasePrice,
          currentValue: mockAnalysis.estimatedValue,
          monthlyRent,
          monthlyExpenses,
          downPayment,
          loanAmount: purchasePrice - downPayment,
          interestRate: Number.parseFloat(formData.loanRate) || 6.5,
          loanTermYears: 30,
          status: "analyzed",
          location: formData.address.split(",").pop()?.trim() || "Unknown",
          equity: mockAnalysis.estimatedValue - (purchasePrice - downPayment),
        }),
      })

      toast({
        title: "Analysis Complete",
        description: "Property analysis has been completed and saved",
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze property. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Property Analysis</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Property Address *</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
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

            <div>
              <Label htmlFor="purchasePrice">Purchase Price *</Label>
              <Input
                id="purchasePrice"
                type="number"
                placeholder="300000"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="monthlyRent">Monthly Rent</Label>
              <Input
                id="monthlyRent"
                type="number"
                placeholder="2500"
                value={formData.monthlyRent}
                onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                placeholder="800"
                value={formData.monthlyExpenses}
                onChange={(e) => handleInputChange("monthlyExpenses", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="downPayment">Down Payment</Label>
              <Input
                id="downPayment"
                type="number"
                placeholder="60000"
                value={formData.downPayment}
                onChange={(e) => handleInputChange("downPayment", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="loanRate">Loan Interest Rate (%)</Label>
              <Input
                id="loanRate"
                type="number"
                step="0.1"
                placeholder="6.5"
                value={formData.loanRate}
                onChange={(e) => handleInputChange("loanRate", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="investmentGoals">Investment Goals</Label>
              <Select
                value={formData.investmentGoals}
                onValueChange={(value) => handleInputChange("investmentGoals", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select investment goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash-flow">Cash Flow</SelectItem>
                  <SelectItem value="appreciation">Appreciation</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="tax-benefits">Tax Benefits</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={analyzeProperty} disabled={loading} className="w-full">
              {loading ? (
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
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <div className="lg:col-span-2 space-y-6">
          {analysisData ? (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">AI Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(analysisData.aiScore)}`}>
                          {analysisData.aiScore}/100
                        </p>
                      </div>
                      <Badge className={getScoreBadgeColor(analysisData.aiScore)}>
                        {analysisData.aiScore >= 80 ? "Excellent" : analysisData.aiScore >= 60 ? "Good" : "Fair"}
                      </Badge>
                    </div>
                    <Progress value={analysisData.aiScore} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Market Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(analysisData.marketScore)}`}>
                          {analysisData.marketScore}/100
                        </p>
                      </div>
                      <Badge className={getScoreBadgeColor(analysisData.marketScore)}>
                        {analysisData.marketScore >= 80
                          ? "Strong"
                          : analysisData.marketScore >= 60
                            ? "Moderate"
                            : "Weak"}
                      </Badge>
                    </div>
                    <Progress value={analysisData.marketScore} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Risk Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(100 - analysisData.riskScore)}`}>
                          {Math.round(100 - analysisData.riskScore)}/100
                        </p>
                      </div>
                      <Badge className={getScoreBadgeColor(100 - analysisData.riskScore)}>
                        {analysisData.riskScore <= 20
                          ? "Low Risk"
                          : analysisData.riskScore <= 40
                            ? "Medium"
                            : "High Risk"}
                      </Badge>
                    </div>
                    <Progress value={100 - analysisData.riskScore} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <Tabs defaultValue="metrics" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  <TabsTrigger value="projections">Projections</TabsTrigger>
                </TabsList>

                <TabsContent value="metrics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Financial Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Cap Rate</p>
                          <p className="text-xl font-bold text-blue-600">{analysisData.capRate.toFixed(2)}%</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Cash-on-Cash</p>
                          <p className="text-xl font-bold text-green-600">
                            {analysisData.cashOnCashReturn.toFixed(2)}%
                          </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">ROI</p>
                          <p className="text-xl font-bold text-purple-600">{analysisData.roi.toFixed(2)}%</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Monthly Cash Flow</p>
                          <p className="text-xl font-bold text-orange-600">
                            ${(analysisData.monthlyRent - analysisData.monthlyExpenses).toLocaleString()}
                          </p>
                        </div>
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
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisData.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          Weaknesses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisData.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{weakness}</span>
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
                        {analysisData.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Market Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Your Property</p>
                          <p className="text-lg font-bold">${analysisData.purchasePrice.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Purchase Price</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Market Average</p>
                          <p className="text-lg font-bold">
                            ${analysisData.marketComparisons.averagePrice.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Average Price</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Difference</p>
                          <p
                            className={`text-lg font-bold ${
                              analysisData.purchasePrice < analysisData.marketComparisons.averagePrice
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {analysisData.purchasePrice < analysisData.marketComparisons.averagePrice ? "-" : "+"}$
                            {Math.abs(
                              analysisData.purchasePrice - analysisData.marketComparisons.averagePrice,
                            ).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">vs Market</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projections" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Future Projections
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-600">1 Year</p>
                          <p className="text-lg font-bold">
                            ${analysisData.projections.oneYear.value.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Projected Value</p>
                          <p className="text-sm font-medium mt-2">
                            ${analysisData.projections.oneYear.rent.toLocaleString()}/mo
                          </p>
                          <p className="text-xs text-gray-500">Projected Rent</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-600">3 Years</p>
                          <p className="text-lg font-bold">
                            ${analysisData.projections.threeYear.value.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Projected Value</p>
                          <p className="text-sm font-medium mt-2">
                            ${analysisData.projections.threeYear.rent.toLocaleString()}/mo
                          </p>
                          <p className="text-xs text-gray-500">Projected Rent</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm font-medium text-purple-600">5 Years</p>
                          <p className="text-lg font-bold">
                            ${analysisData.projections.fiveYear.value.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Projected Value</p>
                          <p className="text-sm font-medium mt-2">
                            ${analysisData.projections.fiveYear.rent.toLocaleString()}/mo
                          </p>
                          <p className="text-xs text-gray-500">Projected Rent</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
                <p className="text-gray-600">Enter property details and click "Analyze Property" to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
