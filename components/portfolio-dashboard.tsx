"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { Property, PortfolioMetrics } from "@/lib/portfolio-types"
import {
  Home,
  DollarSign,
  TrendingUp,
  PieChart,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Building2,
} from "lucide-react"

interface PortfolioDashboardProps {
  onAddProperty: () => void
  onEditProperty: (property: Property) => void
  onViewProperty: (property: Property) => void
}

export default function PortfolioDashboard({ onAddProperty, onEditProperty, onViewProperty }: PortfolioDashboardProps) {
  const [portfolio, setPortfolio] = useState<Property[]>([])
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewType, setViewType] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/portfolio")
      const data = await response.json()

      if (response.ok) {
        setPortfolio(data.portfolio)
        setMetrics(data.metrics)
      } else {
        console.error("Failed to load portfolio:", data.error)
      }
    } catch (error) {
      console.error("Error loading portfolio:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        const response = await fetch(`/api/portfolio/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          loadPortfolio() // Reload the portfolio
        } else {
          console.error("Failed to delete property")
        }
      } catch (error) {
        console.error("Error deleting property:", error)
      }
    }
  }

  const getStatusColor = (status: Property["status"]) => {
    switch (status) {
      case "owned":
        return "bg-green-100 text-green-700 border-green-200"
      case "under-contract":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "analyzing":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "sold":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const filteredProperties = portfolio.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.state.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (!metrics) return <div>Error loading portfolio</div>

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome to MSASCOUT AI</h1>
          <p className="text-blue-100">Your intelligent property investment companion</p>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Properties</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{metrics.totalProperties}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Value</p>
                <p className="text-2xl font-bold text-green-900 mt-1">${metrics.totalValue.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Monthly Cash Flow</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    metrics.totalMonthlyCashFlow >= 0 ? "text-purple-900" : "text-red-600"
                  }`}
                >
                  ${metrics.totalMonthlyCashFlow.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Average Cap Rate</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{metrics.averageCapRate}%</p>
              </div>
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <PieChart className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-0 bg-white shadow-sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          <div className="flex border rounded-lg bg-white shadow-sm">
            <Button
              variant={viewType === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("grid")}
              className="rounded-r-none border-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("list")}
              className="rounded-l-none border-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Grid/List */}
      {filteredProperties.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 text-center mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start building your portfolio by adding your first property"}
            </p>
            <Button onClick={onAddProperty} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {filteredProperties.map((property) => {
            const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0]

            return viewType === "grid" ? (
              <Card
                key={property.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="relative">
                  <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={primaryImage?.url || "/placeholder.svg?height=200&width=300&query=modern house exterior"}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getStatusColor(property.status)} border-0`}>
                      {property.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => onViewProperty(property)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onEditProperty(property)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{property.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.address}, {property.state}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Purchase Price</p>
                      <p className="font-semibold text-gray-900">${property.purchasePrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Current Value</p>
                      <p className="font-semibold text-gray-900">${property.currentValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Rent</p>
                      <p className="font-semibold text-green-600">${property.monthlyRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Expenses</p>
                      <p className="font-semibold text-red-600">${property.monthlyExpenses.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProperty(property)}
                      className="flex-1 border-0 bg-gray-50"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProperty(property.id)}
                      className="border-0 bg-gray-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={property.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-18 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={primaryImage?.url || "/placeholder.svg?height=72&width=96&query=modern house exterior"}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{property.name}</h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.address}, {property.state}
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(property.status)} border-0`}>
                          {property.status.replace("-", " ")}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Purchase Price</p>
                          <p className="font-semibold text-gray-900">${property.purchasePrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Current Value</p>
                          <p className="font-semibold text-gray-900">${property.currentValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Rent</p>
                          <p className="font-semibold text-green-600">${property.monthlyRent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Expenses</p>
                          <p className="font-semibold text-red-600">${property.monthlyExpenses.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewProperty(property)}
                          className="border-0 bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditProperty(property)}
                          className="border-0 bg-gray-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProperty(property.id)}
                          className="border-0 bg-gray-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
