"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Property } from "@/lib/portfolio-types"
import { PortfolioManager } from "@/lib/portfolio-manager"
import { Home, DollarSign, TrendingUp, MapPin, FileText, ArrowLeft, Calculator } from "lucide-react"
import ImageGallery from "./image-gallery"
import { ImageManager } from "@/lib/image-manager"

interface PropertyDetailsProps {
  property: Property
  onBack: () => void
  onEdit: () => void
}

function PropertyDetails({ property, onBack, onEdit }: PropertyDetailsProps) {
  const [useLoan, setUseLoan] = useState(property.loanAmount > 0)
  const [downPayment, setDownPayment] = useState(property.downPayment)
  const [loanAmount, setLoanAmount] = useState(property.loanAmount)
  const [interestRate, setInterestRate] = useState(property.interestRate)
  const [loanTermYears, setLoanTermYears] = useState(property.loanTermYears)

  const performance = PortfolioManager.calculatePropertyPerformance({
    ...property,
    useLoan,
    downPayment: useLoan ? downPayment : property.purchasePrice,
    loanAmount: useLoan ? loanAmount : 0,
    interestRate,
    loanTermYears,
  })

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

  const handleLoanToggle = (value: string) => {
    const useNewLoan = value === "loan"
    setUseLoan(useNewLoan)

    if (useNewLoan) {
      // Reset to original loan values
      setDownPayment(property.downPayment)
      setLoanAmount(property.purchasePrice - property.downPayment)
    } else {
      // Cash purchase
      setDownPayment(property.purchasePrice)
      setLoanAmount(0)
    }
  }

  const handleDownPaymentChange = (value: number) => {
    setDownPayment(value)
    if (useLoan) {
      setLoanAmount(property.purchasePrice - value)
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

      {/* Financing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Financing Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Payment Method</Label>
            <RadioGroup value={useLoan ? "loan" : "cash"} onValueChange={handleLoanToggle} className="flex gap-6 mt-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loan" id="use-loan-details" />
                <Label htmlFor="use-loan-details" className="cursor-pointer">
                  Use Loan
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="use-cash-details" />
                <Label htmlFor="use-cash-details" className="cursor-pointer">
                  Cash Purchase
                </Label>
              </div>
            </RadioGroup>
          </div>

          {useLoan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border">
              <div>
                <Label htmlFor="downPayment-details">Down Payment ($)</Label>
                <Input
                  id="downPayment-details"
                  type="number"
                  value={downPayment}
                  onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="loanAmount-details">Loan Amount ($)</Label>
                <Input id="loanAmount-details" type="number" value={loanAmount} disabled className="bg-gray-100" />
                <p className="text-xs text-gray-500 mt-1">Auto-calculated: Purchase Price - Down Payment</p>
              </div>
              <div>
                <Label htmlFor="interestRate-details">Interest Rate (%)</Label>
                <Input
                  id="interestRate-details"
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="loanTermYears-details">Loan Term (Years)</Label>
                <Input
                  id="loanTermYears-details"
                  type="number"
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(Number(e.target.value))}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-lg border">
              <div>
                <Label htmlFor="cashAmount-details">Total Cash Investment ($)</Label>
                <Input
                  id="cashAmount-details"
                  type="number"
                  value={property.purchasePrice}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Full purchase price paid in cash</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Price</p>
                <p className="text-xl font-bold">{formatCurrency(property.purchasePrice)}</p>
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
                <p className="text-xl font-bold">{formatCurrency(property.currentValue)}</p>
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
                  {formatCurrency(performance.monthlyCashFlow)}
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
                <p className="text-lg font-semibold text-green-600">{formatCurrency(property.monthlyRent)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-lg font-semibold text-red-600">{formatCurrency(property.monthlyExpenses)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Mortgage</p>
                <p className="text-lg font-semibold">{formatCurrency(performance.monthlyMortgage)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Annual Cash Flow</p>
                <p
                  className={`text-lg font-semibold ${performance.annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(performance.annualCashFlow)}
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
                  {formatCurrency(performance.appreciation)} ({performance.appreciationPercent}%)
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
                <p className="text-lg font-semibold">{formatCurrency(downPayment)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Loan Amount</p>
                <p className="text-lg font-semibold">{formatCurrency(loanAmount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Interest Rate</p>
                <p className="text-lg font-semibold">{interestRate}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Loan Term</p>
                <p className="text-lg font-semibold">{loanTermYears} years</p>
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
