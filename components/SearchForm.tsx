"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Search, MapPin } from "lucide-react"

interface SearchCriteria {
  location: string
  propertyType: string
  minPrice: number
  maxPrice: number
  bedrooms: string
  bathrooms: string
  minSquareFootage: number
}

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void
  isLoading?: boolean
}

export default function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    location: "Atlanta, GA",
    propertyType: "any",
    minPrice: 0,
    maxPrice: 1000000,
    bedrooms: "any",
    bathrooms: "any",
    minSquareFootage: 0,
  })

  const [priceRange, setPriceRange] = useState([0, 1000000])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({
      ...criteria,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Property Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Location
            </Label>
            <Input
              id="location"
              value={criteria.location}
              onChange={(e) => setCriteria({ ...criteria, location: e.target.value })}
              placeholder="Enter city, state"
              className="w-full"
            />
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Select
              value={criteria.propertyType}
              onValueChange={(value) => setCriteria({ ...criteria, propertyType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                <SelectItem value="SingleFamily">Single Family</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Townhouse">Townhouse</SelectItem>
                <SelectItem value="Condo">Condo</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label>Price Range</Label>
            <div className="px-2">
              <Slider
                min={0}
                max={1000000}
                step={10000}
                value={priceRange}
                onValueChange={setPriceRange}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Bedrooms */}
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select
                value={criteria.bedrooms}
                onValueChange={(value) => setCriteria({ ...criteria, bedrooms: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select
                value={criteria.bathrooms}
                onValueChange={(value) => setCriteria({ ...criteria, bathrooms: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Minimum Square Footage */}
          <div className="space-y-2">
            <Label htmlFor="minSquareFootage">Minimum Square Footage</Label>
            <Input
              id="minSquareFootage"
              type="number"
              value={criteria.minSquareFootage}
              onChange={(e) => setCriteria({ ...criteria, minSquareFootage: Number.parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
            />
          </div>

          {/* Search Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Properties
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
