"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, MapPin, Home, DollarSign, Loader2, BarChart3, Target, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PredictionResult {
  prediction: string
  timestamp: string
  propertyAddress: string
}

export default function PricePredictor() {
  // Property Information
  const [address, setAddress] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [squareFootage, setSquareFootage] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [yearBuilt, setYearBuilt] = useState("")
  const [lotSize, setLotSize] = useState("")
  const [condition, setCondition] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")

  // Additional Details
  const [renovations, setRenovations] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [schoolDistrict, setSchoolDistrict] = useState("")
  const [specialFeatures, setSpecialFeatures] = useState("")
  const [marketConditions, setMarketConditions] = useState("")
  const [timeline, setTimeline] = useState("")
  const [goals, setGoals] = useState("")

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address.trim() || !propertyType || !squareFootage) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the address, property type, and square footage",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setPrediction(null)

    try {
      const propertyData = {
        address: address.trim(),
        propertyType,
        squareFootage: Number.parseInt(squareFootage) || 0,
        bedrooms: Number.parseInt(bedrooms) || 0,
        bathrooms: Number.parseFloat(bathrooms) || 0,
        yearBuilt: Number.parseInt(yearBuilt) || 0,
        lotSize: Number.parseInt(lotSize) || 0,
        condition,
        currentPrice: currentPrice ? Number.parseInt(currentPrice.replace(/[,$]/g, "")) : null,
        renovations: renovations.trim(),
        neighborhood: neighborhood.trim(),
        schoolDistrict: schoolDistrict.trim(),
        specialFeatures: specialFeatures.trim(),
        marketConditions: marketConditions.trim(),
        timeline,
        goals: goals.trim(),
      }

      console.log("🚀 Sending property data for prediction:", propertyData)

      const response = await fetch("/api/price-prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setPrediction(result)

      toast({
        title: "Prediction Generated!",
        description: "Your property price prediction is ready",
      })
    } catch (error) {
      console.error("❌ Price prediction error:", error)
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "Failed to generate price prediction",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearForm = () => {
    setAddress("")
    setPropertyType("")
    setSquareFootage("")
    setBedrooms("")
    setBathrooms("")
    setYearBuilt("")
    setLotSize("")
    setCondition("")
    setCurrentPrice("")
    setRenovations("")
    setNeighborhood("")
    setSchoolDistrict("")
    setSpecialFeatures("")
    setMarketConditions("")
    setTimeline("")
    setGoals("")
    setPrediction(null)
  }

  const formatPrediction = (content: string) => {
    return content
      .replace(
        /^# (.*$)/gm,
        '<h1 class="text-2xl font-bold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4">$1</h1>',
      )
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-blue-700 mt-6 mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium text-blue-800 mt-4 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
      .replace(/\n/g, "<br>")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Price Predictor</h1>
            <p className="text-gray-600">Get AI-powered property price predictions and market analysis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Basic Property Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="address">Property Address *</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="e.g., 123 Main St, Austin, TX 78701"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-family">Single Family</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="multi-family">Multi-Family</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="squareFootage">Square Footage *</Label>
                  <Input
                    id="squareFootage"
                    type="number"
                    placeholder="e.g., 2500"
                    value={squareFootage}
                    onChange={(e) => setSquareFootage(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="e.g., 3"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 2.5"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    placeholder="e.g., 2010"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lotSize">Lot Size (sq ft)</Label>
                  <Input
                    id="lotSize"
                    type="number"
                    placeholder="e.g., 8000"
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="needs-work">Needs Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="currentPrice">Current List/Market Price</Label>
                <Input
                  id="currentPrice"
                  type="text"
                  placeholder="e.g., $450,000"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="neighborhood">Neighborhood</Label>
                <Input
                  id="neighborhood"
                  type="text"
                  placeholder="e.g., Downtown, Westlake, etc."
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="schoolDistrict">School District</Label>
                <Input
                  id="schoolDistrict"
                  type="text"
                  placeholder="e.g., Austin ISD"
                  value={schoolDistrict}
                  onChange={(e) => setSchoolDistrict(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="renovations">Recent Renovations</Label>
                <Textarea
                  id="renovations"
                  placeholder="e.g., New kitchen, updated bathrooms, new roof..."
                  value={renovations}
                  onChange={(e) => setRenovations(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="specialFeatures">Special Features</Label>
                <Textarea
                  id="specialFeatures"
                  placeholder="e.g., Pool, garage, fireplace, hardwood floors..."
                  value={specialFeatures}
                  onChange={(e) => setSpecialFeatures(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="timeline">Investment Timeline</Label>
                <Select value={timeline} onValueChange={setTimeline}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6-months">6 Months</SelectItem>
                    <SelectItem value="1-year">1 Year</SelectItem>
                    <SelectItem value="3-years">3 Years</SelectItem>
                    <SelectItem value="5-years">5 Years</SelectItem>
                    <SelectItem value="10-years">10+ Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goals">Investment Goals</Label>
                <Textarea
                  id="goals"
                  placeholder="e.g., Buy and hold, flip, rental income..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Prediction...
                </>
              ) : (
                <>
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Generate Price Prediction
                </>
              )}
            </Button>
            <Button onClick={clearForm} variant="outline" className="px-6 py-3 bg-transparent">
              Clear Form
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {prediction ? (
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Price Prediction Results
                </CardTitle>
                <p className="text-sm opacity-90">Generated on {new Date(prediction.timestamp).toLocaleString()}</p>
              </CardHeader>
              <CardContent className="p-6">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatPrediction(prediction.prediction) }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prediction Yet</h3>
                <p className="text-gray-600 mb-4">
                  Fill out the property information form and click "Generate Price Prediction" to get AI-powered market
                  analysis and price forecasts.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>Predictions are based on market data and AI analysis</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                  <p>
                    <strong>Property Analysis:</strong> AI analyzes your property details, location, and market
                    conditions
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <p>
                    <strong>Market Comparison:</strong> Compares with similar properties and recent sales data
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">3</span>
                  </div>
                  <p>
                    <strong>Future Projections:</strong> Provides price predictions for multiple time horizons
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">4</span>
                  </div>
                  <p>
                    <strong>Investment Insights:</strong> Offers recommendations based on your goals and timeline
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
