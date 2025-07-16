"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Property } from "@/lib/portfolio-types"

interface PropertyFormProps {
  property?: Property
  onSubmit: (data: Omit<Property, "id" | "createdAt" | "updatedAt" | "images">) => void
  onCancel: () => void
}

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
  })

  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    property?.purchaseDate ? new Date(property.purchaseDate) : undefined,
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      name: formData.name,
      address: formData.address,
      state: formData.state,
      purchasePrice: Number.parseFloat(formData.purchasePrice) || 0,
      purchaseDate: purchaseDate ? format(purchaseDate, "yyyy-MM-dd") : "",
      currentValue: Number.parseFloat(formData.currentValue) || 0,
      monthlyRent: Number.parseFloat(formData.monthlyRent) || 0,
      monthlyExpenses: Number.parseFloat(formData.monthlyExpenses) || 0,
      downPayment: Number.parseFloat(formData.downPayment) || 0,
      loanAmount: Number.parseFloat(formData.loanAmount) || 0,
      interestRate: Number.parseFloat(formData.interestRate) || 0,
      loanTermYears: Number.parseInt(formData.loanTermYears) || 30,
      propertyType: formData.propertyType as Property["propertyType"],
      status: formData.status as Property["status"],
      notes: formData.notes,
    }

    onSubmit(data)
  }

  const US_STATES = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ]

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{property ? "Edit Property" : "Add New Property"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div>
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sunset Villa"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City"
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                  <SelectTrigger>
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
              </div>

              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
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

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analyzing">Analyzing</SelectItem>
                    <SelectItem value="under-contract">Under Contract</SelectItem>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Financial Information</h3>

              <div>
                <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  placeholder="500000"
                  required
                />
              </div>

              <div>
                <Label>Purchase Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !purchaseDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {purchaseDate ? format(purchaseDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={purchaseDate} onSelect={setPurchaseDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="currentValue">Current Value ($)</Label>
                <Input
                  id="currentValue"
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="550000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                  placeholder="2500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
                <Input
                  id="monthlyExpenses"
                  type="number"
                  value={formData.monthlyExpenses}
                  onChange={(e) => setFormData({ ...formData, monthlyExpenses: e.target.value })}
                  placeholder="800"
                  required
                />
              </div>
            </div>
          </div>

          {/* Loan Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Loan Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="downPayment">Down Payment ($)</Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={formData.downPayment}
                  onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                  placeholder="100000"
                />
              </div>

              <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  placeholder="6.5"
                />
              </div>

              <div>
                <Label htmlFor="loanTermYears">Loan Term (Years)</Label>
                <Input
                  id="loanTermYears"
                  type="number"
                  value={formData.loanTermYears}
                  onChange={(e) => setFormData({ ...formData, loanTermYears: e.target.value })}
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this property..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {property ? "Update Property" : "Add Property"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default PropertyForm
