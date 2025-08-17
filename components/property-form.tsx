"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DollarSign, Home, Percent } from "lucide-react"
import type { Property } from "@/lib/portfolio-types"

interface PropertyFormProps {
  property?: Property
  onSubmit: (data: Omit<Property, "id" | "createdAt" | "updatedAt" | "images">) => Promise<void>
  onCancel: () => void
}

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

const PROPERTY_TYPES = [
  { value: "single-family", label: "Single Family Home" },
  { value: "multi-family", label: "Multi-Family Home" },
  { value: "condo", label: "Condominium" },
  { value: "townhouse", label: "Townhouse" },
  { value: "apartment", label: "Apartment Building" },
  { value: "commercial", label: "Commercial Property" },
  { value: "land", label: "Land/Lot" },
  { value: "other", label: "Other" },
]

const PROPERTY_STATUS = [
  { value: "analyzing", label: "Analyzing" },
  { value: "interested", label: "Interested" },
  { value: "under-contract", label: "Under Contract" },
  { value: "owned", label: "Owned" },
  { value: "sold", label: "Sold" },
]

export function PropertyForm({ property, onSubmit, onCancel }: PropertyFormProps) {
  const [formData, setFormData] = useState({
    name: property?.name || "",
    address: property?.address || "",
    state: property?.state || "",
    purchasePrice: property?.purchasePrice?.toString() || "",
    purchaseDate: property?.purchaseDate || "",
    currentValue: property?.currentValue?.toString() || "",
    monthlyRent: property?.monthlyRent?.toString() || "",
    monthlyExpenses: property?.monthlyExpenses?.toString() || "",
    downPayment: property?.downPayment?.toString() || "",
    loanAmount: property?.loanAmount?.toString() || "",
    interestRate: property?.interestRate?.toString() || "",
    loanTermYears: property?.loanTermYears?.toString() || "30",
    propertyType: property?.propertyType || "single-family",
    status: property?.status || "analyzing",
    notes: property?.notes || "",
    useLoan: property ? property.loanAmount > 0 : true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Property name is required"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    if (!formData.state) {
      newErrors.state = "State is required"
    }

    if (!formData.purchasePrice || Number.parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = "Valid purchase price is required"
    }

    if (!formData.currentValue || Number.parseFloat(formData.currentValue) <= 0) {
      newErrors.currentValue = "Valid current value is required"
    }

    if (formData.monthlyRent && Number.parseFloat(formData.monthlyRent) < 0) {
      newErrors.monthlyRent = "Monthly rent cannot be negative"
    }

    if (formData.monthlyExpenses && Number.parseFloat(formData.monthlyExpenses) < 0) {
      newErrors.monthlyExpenses = "Monthly expenses cannot be negative"
    }

    if (formData.downPayment && Number.parseFloat(formData.downPayment) < 0) {
      newErrors.downPayment = "Down payment cannot be negative"
    }

    if (formData.loanAmount && Number.parseFloat(formData.loanAmount) < 0) {
      newErrors.loanAmount = "Loan amount cannot be negative"
    }

    if (
      formData.interestRate &&
      (Number.parseFloat(formData.interestRate) < 0 || Number.parseFloat(formData.interestRate) > 50)
    ) {
      newErrors.interestRate = "Interest rate must be between 0 and 50%"
    }

    if (
      formData.loanTermYears &&
      (Number.parseInt(formData.loanTermYears) < 1 || Number.parseInt(formData.loanTermYears) > 50)
    ) {
      newErrors.loanTermYears = "Loan term must be between 1 and 50 years"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        state: formData.state,
        purchasePrice: Number.parseFloat(formData.purchasePrice) || 0,
        purchaseDate: formData.purchaseDate || "",
        currentValue: Number.parseFloat(formData.currentValue) || 0,
        monthlyRent: Number.parseFloat(formData.monthlyRent) || 0,
        monthlyExpenses: Number.parseFloat(formData.monthlyExpenses) || 0,
        downPayment: formData.useLoan
          ? Number.parseFloat(formData.downPayment) || 0
          : Number.parseFloat(formData.purchasePrice) || 0,
        loanAmount: formData.useLoan ? Number.parseFloat(formData.loanAmount) || 0 : 0,
        interestRate: formData.useLoan ? Number.parseFloat(formData.interestRate) || 0 : 0,
        loanTermYears: formData.useLoan ? Number.parseInt(formData.loanTermYears) || 30 : 0,
        propertyType: formData.propertyType,
        status: formData.status,
        notes: formData.notes.trim(),
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Handle loan toggle
      if (field === "useLoan") {
        const useLoan = value === "true"
        if (useLoan) {
          // When switching to loan, calculate loan amount
          const purchasePrice = Number.parseFloat(prev.purchasePrice) || 0
          const downPayment = Number.parseFloat(prev.downPayment) || purchasePrice * 0.2
          newData.downPayment = downPayment.toString()
          newData.loanAmount = (purchasePrice - downPayment).toString()
          newData.interestRate = prev.interestRate || "6.0"
          newData.loanTermYears = prev.loanTermYears || "30"
        } else {
          // When switching to cash, set down payment to full purchase price
          newData.downPayment = prev.purchasePrice
          newData.loanAmount = "0"
          newData.interestRate = "0"
          newData.loanTermYears = "0"
        }
        newData.useLoan = useLoan
      }

      // Auto-calculate loan amount when purchase price or down payment changes
      if ((field === "purchasePrice" || field === "downPayment") && prev.useLoan) {
        const purchasePrice =
          field === "purchasePrice" ? Number.parseFloat(value) : Number.parseFloat(prev.purchasePrice)
        const downPayment = field === "downPayment" ? Number.parseFloat(value) : Number.parseFloat(prev.downPayment)
        newData.loanAmount = Math.max(0, purchasePrice - downPayment).toString()
      }

      return newData
    })

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Sunset Villa, Downtown Condo"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main Street, City"
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                placeholder="450000"
                className={errors.purchasePrice ? "border-red-500" : ""}
              />
              {errors.purchasePrice && <p className="text-sm text-red-600">{errors.purchasePrice}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentValue">Current Value *</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                min="0"
                value={formData.currentValue}
                onChange={(e) => handleInputChange("currentValue", e.target.value)}
                placeholder="475000"
                className={errors.currentValue ? "border-red-500" : ""}
              />
              {errors.currentValue && <p className="text-sm text-red-600">{errors.currentValue}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Monthly Rent</Label>
              <Input
                id="monthlyRent"
                type="number"
                step="0.01"
                min="0"
                value={formData.monthlyRent}
                onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                placeholder="3200"
                className={errors.monthlyRent ? "border-red-500" : ""}
              />
              {errors.monthlyRent && <p className="text-sm text-red-600">{errors.monthlyRent}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                step="0.01"
                min="0"
                value={formData.monthlyExpenses}
                onChange={(e) => handleInputChange("monthlyExpenses", e.target.value)}
                placeholder="1200"
                className={errors.monthlyExpenses ? "border-red-500" : ""}
              />
              {errors.monthlyExpenses && <p className="text-sm text-red-600">{errors.monthlyExpenses}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Financing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Financing Method</Label>
              <RadioGroup
                value={formData.useLoan ? "loan" : "cash"}
                onValueChange={(value) => handleInputChange("useLoan", (value === "loan").toString())}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loan" id="use-loan" />
                  <Label htmlFor="use-loan">Use Loan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="use-cash" />
                  <Label htmlFor="use-cash">Cash Purchase</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.useLoan ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="downPayment">Down Payment</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.downPayment}
                    onChange={(e) => handleInputChange("downPayment", e.target.value)}
                    placeholder="90000"
                    className={errors.downPayment ? "border-red-500" : ""}
                  />
                  {errors.downPayment && <p className="text-sm text-red-600">{errors.downPayment}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange("loanAmount", e.target.value)}
                    placeholder="360000"
                    className={errors.loanAmount ? "border-red-500" : ""}
                    disabled
                  />
                  {errors.loanAmount && <p className="text-sm text-red-600">{errors.loanAmount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.001"
                    min="0"
                    max="50"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange("interestRate", e.target.value)}
                    placeholder="6.5"
                    className={errors.interestRate ? "border-red-500" : ""}
                  />
                  {errors.interestRate && <p className="text-sm text-red-600">{errors.interestRate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanTermYears">Loan Term (Years)</Label>
                  <Input
                    id="loanTermYears"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.loanTermYears}
                    onChange={(e) => handleInputChange("loanTermYears", e.target.value)}
                    placeholder="30"
                    className={errors.loanTermYears ? "border-red-500" : ""}
                  />
                  {errors.loanTermYears && <p className="text-sm text-red-600">{errors.loanTermYears}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="cashAmount">Cash Investment</Label>
                <Input id="cashAmount" type="number" value={formData.purchasePrice} disabled className="bg-gray-50" />
                <p className="text-sm text-gray-600">Full purchase price will be paid in cash</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional information about this property..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : property ? "Update Property" : "Add Property"}
        </Button>
      </div>
    </form>
  )
}
