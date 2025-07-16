"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyForm } from "./property-form"
import { PropertyDetails } from "./property-details"
import { ImageGallery } from "./image-gallery"
import { PropertyCalculator } from "./property-calculator"
import type { Property, PortfolioMetrics } from "@/lib/portfolio-types"
import { Building2, DollarSign, TrendingUp, PieChart, Plus, Eye, Edit, Trash2, Calculator } from "lucide-react"

export function PortfolioDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/portfolio")
      if (response.ok) {
        const data = await response.json()
        setProperties(data.portfolio || [])
        setMetrics(data.metrics || null)
      }
    } catch (error) {
      console.error("Error loading portfolio:", error)
    } finally {
      setLoading(false)
    }
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

      if (response.ok) {
        await loadPortfolio()
        setShowForm(false)
      }
    } catch (error) {
      console.error("Error adding property:", error)
    }
  }

  const handleUpdateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await loadPortfolio()
        setEditingProperty(null)
      }
    } catch (error) {
      console.error("Error updating property:", error)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        const response = await fetch(`/api/portfolio/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          await loadPortfolio()
          setSelectedProperty(null)
        }
      } catch (error) {
        console.error("Error deleting property:", error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "owned":
        return "bg-green-100 text-green-800"
      case "under-contract":
        return "bg-yellow-100 text-yellow-800"
      case "analyzing":
        return "bg-blue-100 text-blue-800"
      case "sold":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading portfolio...</div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add New Property</h2>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
        <PropertyForm onSubmit={handleAddProperty} onCancel={() => setShowForm(false)} />
      </div>
    )
  }

  if (editingProperty) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Property</h2>
          <Button variant="outline" onClick={() => setEditingProperty(null)}>
            Cancel
          </Button>
        </div>
        <PropertyForm
          property={editingProperty}
          onSubmit={(data) => handleUpdateProperty(editingProperty.id, data)}
          onCancel={() => setEditingProperty(null)}
        />
      </div>
    )
  }

  if (showCalculator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Investment Calculator</h2>
          <Button variant="outline" onClick={() => setShowCalculator(false)}>
            Back to Portfolio
          </Button>
        </div>
        <PropertyCalculator />
      </div>
    )
  }

  if (selectedProperty) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{selectedProperty.name}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditingProperty(selectedProperty)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDeleteProperty(selectedProperty.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => setSelectedProperty(null)}>
              Back to Portfolio
            </Button>
          </div>
        </div>
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <PropertyDetails property={selectedProperty} />
          </TabsContent>
          <TabsContent value="images">
            <ImageGallery propertyId={selectedProperty.id} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCalculator(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculator
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProperties}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cash Flow</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalMonthlyCashFlow)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Cap Rate</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageCapRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Properties List */}
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>Manage your real estate investment portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
              <p className="text-muted-foreground mb-4">Start building your portfolio by adding your first property</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
                    </div>
                    <CardDescription>{property.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Purchase Price:</span>
                        <span className="font-medium">{formatCurrency(property.purchasePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Value:</span>
                        <span className="font-medium">{formatCurrency(property.currentValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Rent:</span>
                        <span className="font-medium">{formatCurrency(property.monthlyRent)}</span>
                      </div>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                          onClick={() => setSelectedProperty(property)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PortfolioDashboard
