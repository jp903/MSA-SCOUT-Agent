"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, MapPin, Home, Bath, Bed, Calendar, Phone, Mail, Building } from "lucide-react"
import type { PropertyListing, PropertySearchFilters } from "@/lib/property-search-agent"
import { ALLOWED_MSAS, MSA_STATE_MAP } from "@/lib/deal-finder-constants"

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

const PROPERTY_TYPES = ["Single Family", "Condo", "Townhouse", "Multi-Family", "Commercial", "Land"]

const SORT_OPTIONS = [
  { value: "price", label: "Price" },
  { value: "squareFootage", label: "Square Footage" },
  { value: "yearBuilt", label: "Year Built" },
  { value: "lastUpdated", label: "Recently Updated" },
]

export default function PropertyListings() {
  const [properties, setProperties] = useState<PropertyListing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState('')
  const [lightboxAlt, setLightboxAlt] = useState('')

  const [filters, setFilters] = useState<PropertySearchFilters>({
    state: "",
    msa: "",
    propertyType: [],
    minPrice: 0,
    maxPrice: 2000000,
    minBedrooms: 0,
    maxBedrooms: 10,
    minBathrooms: 0,
    maxBathrooms: 10,
    minCapRate: 0,
    maxCapRate: 20,
    minRoi: 0,
    maxRoi: 50,
    minSquareFootage: 0,
    sortBy: "price",
    sortOrder: "asc",
  })

  const searchProperties = async () => {
    if (!filters.state || !filters.msa) {
      setError("Please select both state and MSA to search for properties")
      return
    }

    // Validate that the selected MSA is in our allowed list
    if (!ALLOWED_MSAS.includes(filters.msa)) {
      setError(`Selected MSA "${filters.msa}" is not supported. Please select one of the allowed MSAs.`);
      return;
    }

    setLoading(true)
    setError(null)
    setProperties([])

    try {
      console.log("🔍 Starting property search with filters:", filters)

      const response = await fetch("/api/property-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Search completed:", data)

      setProperties(data.properties || [])

      if (data.properties?.length === 0) {
        setError("No properties found matching your criteria. Try adjusting your filters.")
      }
    } catch (err: any) {
      console.error("❌ Property search failed:", err)
      setError(err.message || "Failed to search properties. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = (key: keyof PropertySearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const togglePropertyType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: prev.propertyType.includes(type)
        ? prev.propertyType.filter((t) => t !== type)
        : [...prev.propertyType, type],
    }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Deal Finder</h1>
          <p className="text-muted-foreground">Search for investment properties across multiple platforms</p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Hide" : "Show"} Filters
        </Button>
      </div>

      {/* Mashvisor Data Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <span className="text-lg">ℹ️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">About Investment Property Data</h3>
              <p className="text-sm text-gray-700 mt-1">
                Find investment-focused property data including rental estimates,
                cap rates, cash-on-cash returns, and market analytics for your selected area.
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">Tip:</span> For best results, try broader price ranges, bedroom counts,
                and investment metrics, or select different MSAs if properties are limited in your current area.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MSA Model Explanation and Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Explanation Section */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-xl">🎯</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Market Analysis</h3>
                <p className="text-gray-700 mb-4">
                  Our LSTM-based MSA ranking model analyzes growth, permits, and economic signals to identify the strongest real-estate markets.
                </p>

                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <span>🤖</span> Intelligent Selection Process
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Nationwide permit & MSA data collection</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Advanced indicator calculation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Normalized scoring & national ranking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images Section */}
        <div className="grid grid-cols-3 gap-4">
          <div
            className="bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md cursor-pointer"
            onClick={() => {
              setLightboxImage('/Scores.png');
              setLightboxAlt('MSA Scoring Model');
              setLightboxOpen(true);
            }}
          >
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <span className="font-bold text-blue-700">1</span>
            </div>
            <div className="h-32 flex items-center justify-center mb-2">
              <img
                src="/Scores.png"
                alt="Scoring Model"
                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
            <h4 className="font-semibold text-sm">Scoring</h4>
            <p className="text-xs text-gray-600">Model</p>
          </div>

          <div
            className="bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md cursor-pointer"
            onClick={() => {
              setLightboxImage('/Prediction.png');
              setLightboxAlt('MSA Predictions');
              setLightboxOpen(true);
            }}
          >
            <div className="bg-green-100 p-3 rounded-full mb-2">
              <span className="font-bold text-green-700">2</span>
            </div>
            <div className="h-32 flex items-center justify-center mb-2">
              <img
                src="/Prediction.png"
                alt="Predictions"
                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
            <h4 className="font-semibold text-sm">LSTM</h4>
            <p className="text-xs text-gray-600">AI Predictions</p>
          </div>

          <div
            className="bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md cursor-pointer"
            onClick={() => {
              setLightboxImage('/Metric profile.png');
              setLightboxAlt('MSA Metric Profile');
              setLightboxOpen(true);
            }}
          >
            <div className="bg-purple-100 p-3 rounded-full mb-2">
              <span className="font-bold text-purple-700">3</span>
            </div>
            <div className="h-32 flex items-center justify-center mb-2">
              <img
                src="/Metric profile.png"
                alt="Metric Profile"
                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
            <h4 className="font-semibold text-sm">Metrics</h4>
            <p className="text-xs text-gray-600">Analytics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* MSA Selection - Limited to specific allowed MSAs */}
              <div className="space-y-2">
                <Label htmlFor="msa">Metropolitan Statistical Area (MSA)</Label>
                <Select value={filters.msa} onValueChange={(value) => {
                  updateFilter("msa", value);
                  // Automatically update the state when MSA is selected
                  if (MSA_STATE_MAP[value]) {
                    updateFilter("state", MSA_STATE_MAP[value]);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select MSA" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOWED_MSAS.map((msa) => (
                      <SelectItem key={msa} value={msa}>
                        {msa} - {MSA_STATE_MAP[msa]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State field - automatically populated based on selected MSA but user can override */}
              <div className="space-y-2">
                <Label htmlFor="state">State (Auto-populated)</Label>
                <Input
                  id="state"
                  value={filters.state}
                  onChange={(e) => updateFilter("state", e.target.value)}
                  placeholder="State automatically set from MSA"
                />
              </div>

              {/* Property Types */}
              <div className="space-y-2">
                <Label>Property Types</Label>
                <div className="space-y-2">
                  {PROPERTY_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.propertyType.includes(type)}
                        onCheckedChange={() => togglePropertyType(type)}
                      />
                      <Label htmlFor={type} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="minPrice" className="text-xs">
                      Min
                    </Label>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="Min price"
                      value={filters.minPrice || ""}
                      onChange={(e) => updateFilter("minPrice", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPrice" className="text-xs">
                      Max
                    </Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="Max price"
                      value={filters.maxPrice || ""}
                      onChange={(e) => updateFilter("maxPrice", Number.parseInt(e.target.value) || 2000000)}
                    />
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="minBedrooms" className="text-xs">
                      Min
                    </Label>
                    <Input
                      id="minBedrooms"
                      type="number"
                      placeholder="Min beds"
                      value={filters.minBedrooms || ""}
                      onChange={(e) => updateFilter("minBedrooms", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxBedrooms" className="text-xs">
                      Max
                    </Label>
                    <Input
                      id="maxBedrooms"
                      type="number"
                      placeholder="Max beds"
                      value={filters.maxBedrooms || ""}
                      onChange={(e) => updateFilter("maxBedrooms", Number.parseInt(e.target.value) || 10)}
                    />
                  </div>
                </div>
              </div>

              {/* Investment Metrics Filters */}
              <div className="space-y-2">
                <Label>Investment Filters</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="minCapRate" className="text-xs">
                      Min Cap Rate (%)
                    </Label>
                    <Input
                      id="minCapRate"
                      type="number"
                      placeholder="Min cap rate"
                      value={filters.minCapRate || ""}
                      onChange={(e) => updateFilter("minCapRate", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxCapRate" className="text-xs">
                      Max Cap Rate (%)
                    </Label>
                    <Input
                      id="maxCapRate"
                      type="number"
                      placeholder="Max cap rate"
                      value={filters.maxCapRate || ""}
                      onChange={(e) => updateFilter("maxCapRate", Number.parseFloat(e.target.value) || 20)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="minRoi" className="text-xs">
                      Min ROI (%)
                    </Label>
                    <Input
                      id="minRoi"
                      type="number"
                      placeholder="Min ROI"
                      value={filters.minRoi || ""}
                      onChange={(e) => updateFilter("minRoi", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxRoi" className="text-xs">
                      Max ROI (%)
                    </Label>
                    <Input
                      id="maxRoi"
                      type="number"
                      placeholder="Max ROI"
                      value={filters.maxRoi || ""}
                      onChange={(e) => updateFilter("maxRoi", Number.parseFloat(e.target.value) || 50)}
                    />
                  </div>
                </div>
              </div>

              {/* Property Details Filters */}
              <div className="space-y-2">
                <Label>Property Details</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="minBathrooms" className="text-xs">
                      Min Baths
                    </Label>
                    <Input
                      id="minBathrooms"
                      type="number"
                      placeholder="Min baths"
                      value={filters.minBathrooms || ""}
                      onChange={(e) => updateFilter("minBathrooms", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxBathrooms" className="text-xs">
                      Max Baths
                    </Label>
                    <Input
                      id="maxBathrooms"
                      type="number"
                      placeholder="Max baths"
                      value={filters.maxBathrooms || ""}
                      onChange={(e) => updateFilter("maxBathrooms", Number.parseInt(e.target.value) || 10)}
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <Label htmlFor="minSqft" className="text-xs">
                    Min Square Footage
                  </Label>
                  <Input
                    id="minSqft"
                    type="number"
                    placeholder="Min sq ft"
                    value={filters.minSquareFootage || ""}
                    onChange={(e) => updateFilter("minSquareFootage", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.sortOrder} onValueChange={(value) => updateFilter("sortOrder", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Low to High</SelectItem>
                    <SelectItem value="desc">High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button
                onClick={searchProperties}
                disabled={loading || !filters.state || !filters.msa}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search Properties"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                {error.includes("No properties found") ? (
                  <div>
                    <p className="font-semibold">No properties found with current filters</p>
                    <p className="mt-1">Try adjusting your filters or try broader search criteria.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Property data availability varies by location and filter settings.
                      Try adjusting your filters or try broader search criteria.
                    </p>
                  </div>
                ) : (
                  error
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Properties Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Found {formatNumber(properties.length)} Properties</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Showing results for {filters.msa}, {filters.state}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Dialog key={property.id}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                          <div className="relative">
                            <img
                              src={property.images[0] || "/placeholder.svg?height=200&width=300&text=Property+Image"}
                              alt={property.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                            <Badge className="absolute top-2 right-2 bg-green-600">
                              {property.listingSource.website}
                            </Badge>
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {property.address}, {property.city}, {property.state}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-green-600">{formatPrice(property.price)}</span>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                {property.bedrooms && (
                                  <span className="flex items-center gap-1">
                                    <Bed className="h-3 w-3" />
                                    {property.bedrooms}
                                  </span>
                                )}
                                {property.bathrooms && (
                                  <span className="flex items-center gap-1">
                                    <Bath className="h-3 w-3" />
                                    {property.bathrooms}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1">
                                <Home className="h-3 w-3" />
                                {formatNumber(property.squareFootage)} sq ft
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Built {property.yearBuilt}
                              </span>
                            </div>

                            {property.investmentMetrics.capRate && (
                              <div className="flex items-center justify-between text-sm">
                                <span>Cap Rate: {property.investmentMetrics.capRate}%</span>
                                <span>ROI: {property.investmentMetrics.roi}%</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>

                    {/* Property Details Modal */}
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle>{property.title}</DialogTitle>
                      </DialogHeader>

                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="details">Details</TabsTrigger>
                          <TabsTrigger value="investment">Investment</TabsTrigger>
                          <TabsTrigger value="contact">Contact</TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[60vh] mt-4">
                          <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <img
                                  src={
                                    property.images[0] || "/placeholder.svg?height=300&width=400&text=Property+Image"
                                  }
                                  alt={property.title}
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-xl font-semibold mb-2">{formatPrice(property.price)}</h3>
                                  <p className="text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {property.address}, {property.city}, {property.state} {property.zipCode}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  {property.bedrooms && (
                                    <div className="flex items-center gap-2">
                                      <Bed className="h-4 w-4" />
                                      <span>{property.bedrooms} Bedrooms</span>
                                    </div>
                                  )}
                                  {property.bathrooms && (
                                    <div className="flex items-center gap-2">
                                      <Bath className="h-4 w-4" />
                                      <span>{property.bathrooms} Bathrooms</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    <span>{formatNumber(property.squareFootage)} sq ft</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Built {property.yearBuilt}</span>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Description</h4>
                                  <p className="text-sm text-muted-foreground">{property.description}</p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="details" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3">Property Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Property Type:</span>
                                    <span className="font-medium">{property.propertyType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Square Footage:</span>
                                    <span className="font-medium">{formatNumber(property.squareFootage)} sq ft</span>
                                  </div>
                                  {property.lotSize && (
                                    <div className="flex justify-between">
                                      <span>Lot Size:</span>
                                      <span className="font-medium">{formatNumber(property.lotSize)} sq ft</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span>Year Built:</span>
                                    <span className="font-medium">{property.yearBuilt}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Days on Market:</span>
                                    <span className="font-medium">{property.marketData.daysOnMarket}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Price per Sq Ft:</span>
                                    <span className="font-medium">{formatPrice(property.marketData.pricePerSqFt)}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3">Neighborhood</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Walk Score:</span>
                                    <span className="font-medium">{property.neighborhood.walkScore}/100</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Crime Rate:</span>
                                    <span className="font-medium">{property.neighborhood.crimeRate}</span>
                                  </div>
                                </div>

                                {property.features.length > 0 && (
                                  <div className="mt-4">
                                    <h5 className="font-medium mb-2">Features</h5>
                                    <div className="flex flex-wrap gap-1">
                                      {property.features.slice(0, 5).map((feature, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {feature}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="investment" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3">Investment Metrics</h4>
                                <div className="space-y-2 text-sm">
                                  {property.investmentMetrics.estimatedRent && (
                                    <div className="flex justify-between">
                                      <span>Estimated Rent:</span>
                                      <span className="font-medium">
                                        {formatPrice(property.investmentMetrics.estimatedRent)}/month
                                      </span>
                                    </div>
                                  )}
                                  {property.investmentMetrics.capRate && (
                                    <div className="flex justify-between">
                                      <span>Cap Rate:</span>
                                      <span className="font-medium">{property.investmentMetrics.capRate}%</span>
                                    </div>
                                  )}
                                  {property.investmentMetrics.cashOnCash && (
                                    <div className="flex justify-between">
                                      <span>Cash on Cash:</span>
                                      <span className="font-medium">{property.investmentMetrics.cashOnCash}%</span>
                                    </div>
                                  )}
                                  {property.investmentMetrics.roi && (
                                    <div className="flex justify-between">
                                      <span>ROI:</span>
                                      <span className="font-medium">{property.investmentMetrics.roi}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3">Market Analysis</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Price per Sq Ft:</span>
                                    <span className="font-medium">{formatPrice(property.marketData.pricePerSqFt)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Days on Market:</span>
                                    <span className="font-medium">{property.marketData.daysOnMarket} days</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Property Type:</span>
                                    <span className="font-medium capitalize">{property.propertyType}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="contact" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3">Listing Agent</h4>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    <span className="font-medium">{property.listingAgent.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <span>{property.listingAgent.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{property.listingAgent.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    <span>{property.listingAgent.company}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3">Listing Information</h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span>Listing ID:</span>
                                    <span className="font-medium">{property.listingSource.listingId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Source:</span>
                                    <span className="font-medium">{property.listingSource.website}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Last Updated:</span>
                                    <span className="font-medium">
                                      {new Date(property.lastUpdated).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <Button asChild className="w-full mt-4">
                                    <a href={property.listingSource.url} target="_blank" rel="noopener noreferrer">
                                      View on {property.listingSource.website}
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </ScrollArea>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Find Properties</h3>
                <p className="text-muted-foreground mb-4">
                  Select a state and MSA, then click "Search Properties" to find investment opportunities.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Pro Tips for Best Results:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Start with broader price ranges (e.g., $50k-$2M)</li>
                    <li>• Allow more bedroom options (e.g., 1-5 bedrooms)</li>
                    <li>• Try different MSAs if initial search yields no results</li>
                    <li>• Adjust investment metrics filters (cap rate, ROI) for more options</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Lightbox for MSA Images */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-6xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="h-[85vh] w-full flex items-center justify-center">
              <img
                src={lightboxImage}
                alt={lightboxAlt}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <p className="text-white text-center mt-2 text-sm">{lightboxAlt}</p>
          </div>
        </div>
      )}
    </div>
  )
}
