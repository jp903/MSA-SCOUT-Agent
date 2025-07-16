"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Home, BarChart3, MapPin } from "lucide-react"

export default function MarketInsights() {
  const marketData = [
    {
      state: "California",
      medianPrice: "$850,000",
      change: "+5.2%",
      trend: "up",
      inventory: "Low",
      forecast: "Strong Growth",
    },
    {
      state: "Texas",
      medianPrice: "$420,000",
      change: "+3.8%",
      trend: "up",
      inventory: "Moderate",
      forecast: "Steady Growth",
    },
    {
      state: "Florida",
      medianPrice: "$390,000",
      change: "-1.2%",
      trend: "down",
      inventory: "High",
      forecast: "Market Cooling",
    },
    {
      state: "New York",
      medianPrice: "$680,000",
      change: "+2.1%",
      trend: "up",
      inventory: "Low",
      forecast: "Stable",
    },
  ]

  const insights = [
    {
      title: "Interest Rate Impact",
      description: "Current rates affecting buyer demand across major markets",
      impact: "High",
      color: "red",
    },
    {
      title: "Inventory Shortage",
      description: "Limited housing supply driving price competition",
      impact: "High",
      color: "red",
    },
    {
      title: "Remote Work Trends",
      description: "Suburban markets seeing increased investment activity",
      impact: "Medium",
      color: "yellow",
    },
    {
      title: "Construction Costs",
      description: "Rising material costs affecting new development",
      impact: "Medium",
      color: "yellow",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Insights</h1>
        <p className="text-gray-600">Real-time property market analysis and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">National Median</p>
                <p className="text-2xl font-bold text-gray-900">$425,000</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.8% YoY
                </p>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Days on Market</p>
                <p className="text-2xl font-bold text-gray-900">28</p>
                <p className="text-sm text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5 days
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mortgage Rate</p>
                <p className="text-2xl font-bold text-gray-900">7.2%</p>
                <p className="text-sm text-red-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Level</p>
                <p className="text-2xl font-bold text-gray-900">2.1</p>
                <p className="text-sm text-gray-600">months supply</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* State Markets */}
      <Card>
        <CardHeader>
          <CardTitle>Top State Markets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.map((market, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{market.state}</h3>
                    <p className="text-sm text-gray-600">Median: {market.medianPrice}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`flex items-center ${market.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {market.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {market.change}
                    </div>
                    <p className="text-sm text-gray-600">{market.forecast}</p>
                  </div>
                  <Badge
                    variant={
                      market.inventory === "Low" ? "destructive" : market.inventory === "High" ? "default" : "secondary"
                    }
                  >
                    {market.inventory} Inventory
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Market Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                  <Badge
                    variant={
                      insight.color === "red" ? "destructive" : insight.color === "yellow" ? "secondary" : "default"
                    }
                  >
                    {insight.impact} Impact
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
