"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Property } from "@/lib/portfolio-types"
import { PortfolioManager } from "@/lib/portfolio-manager"
import { Home, DollarSign, TrendingUp, MapPin, FileText, ArrowLeft } from "lucide-react"
import ImageGallery from "./image-gallery"
import { ImageManager } from "@/lib/image-manager"

interface PropertyDetailsProps {
  property: Property
  onBack: () => void
  onEdit: () => void
}

function PropertyDetails({ property, onBack, onEdit }: PropertyDetailsProps) {
  const performance = PortfolioManager.calculatePropertyPerformance(property)
  const images = ImageManager.getPropertyImages(property.id)

  const getStatusColor = (status: Property["status"]) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio
        </Button>
        <Button onClick={onEdit}>Edit Property</Button>
      </div>

      {/* Property Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{property.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {property.address}, {property.state}
                </span>
              </div>
            </div>
            <Badge className={getStatusColor(property.status)}>{property.status.replace("-", " ")}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Property Images */}
      <ImageGallery images={images} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Price</p>
                <p className="text-xl font-bold">${property.purchasePrice.toLocaleString()}</p>
              </div>
              <Home className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-xl font-bold">${property.currentValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Cash Flow</p>
                <p
                  className={`text-xl font-bold ${performance.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${performance.monthlyCashFlow.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cap Rate</p>
                <p className="text-xl font-bold">{performance.capRate}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                <p className="text-lg font-semibold text-green-600">${property.monthlyRent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-lg font-semibold text-red-600">${property.monthlyExpenses.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Mortgage</p>
                <p className="text-lg font-semibold">${performance.monthlyMortgage.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Annual Cash Flow</p>
                <p
                  className={`text-lg font-semibold ${performance.annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${performance.annualCashFlow.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cash-on-Cash Return</p>
                <p className="text-lg font-semibold">{performance.cashOnCashReturn}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appreciation</p>
                <p
                  className={`text-lg font-semibold ${performance.appreciation >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${performance.appreciation.toLocaleString()} ({performance.appreciationPercent}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Property Type</p>
                <p className="text-lg font-semibold capitalize">{property.propertyType.replace("-", " ")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Date</p>
                <p className="text-lg font-semibold">
                  {property.purchaseDate ? new Date(property.purchaseDate).toLocaleDateString() : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Down Payment</p>
                <p className="text-lg font-semibold">${property.downPayment.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Loan Amount</p>
                <p className="text-lg font-semibold">${property.loanAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Interest Rate</p>
                <p className="text-lg font-semibold">{property.interestRate}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Loan Term</p>
                <p className="text-lg font-semibold">{property.loanTermYears} years</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {property.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{property.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PropertyDetails
export { PropertyDetails }
