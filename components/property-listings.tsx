"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Filter,
  MapPin,
  Home,
  Building,
  Factory,
  TreePine,
  Users,
  Calendar,
  Square,
  Phone,
  Mail,
  ExternalLink,
  Star,
  RefreshCw,
  Database,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { PropertyListing, PropertySearchFilters, MSAInfo, APIStatus } from "@/lib/property-search-agent"

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

const PROPERTY_TYPES = [
  { value: "residential", label: "Residential", icon: Home },
  { value: "commercial", label: "Commercial", icon: Building },
  { value: "multi-family", label: "Multi-Family", icon: Users },
  { value: "industrial", label: "Industrial", icon: Factory },
  { value: "land", label: "Land", icon: TreePine },
]

interface PropertyListingsProps {
  onPropertySelect?: (property: PropertyListing) => void
}

export default function PropertyListings({ onPropertySelect }: PropertyListingsProps) {
  const [properties, setProperties] = useState<PropertyListing[]>([])
  const [msaInfo, setMsaInfo] = useState<MSAInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null)
  const [apiConfigError, setApiConfigError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<APIStatus>({
    loopnet: "connecting",
    zillow: "connecting",
    rentcast: "connecting",
  })

  // Filter states
  const [filters, setFilters] = useState<PropertySearchFilters>({
    state: "",
    msa: "",
    propertyType: [],
    minPrice: 100000,
    maxPrice: 1000000,
    minBedrooms: 1,
    maxBedrooms: 10,
    minBathrooms: 1,
    maxBathrooms: 10,
    sortBy: "price",
    sortOrder: "asc",
    listingStatus: "for_sale",
  })

  const [priceRange, setPriceRange] = useState([100000, 1000000])
  const [bedroomRange, setBedroomRange] = useState([1, 10])

  useEffect(() => {
    checkAPIStatus()
    const interval = setInterval(checkAPIStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkAPIStatus = async () => {
    try {
      const response = await fetch("/api/property-search/status")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApiStatus(data.apiStatus)

          // Check if no API keys are configured
          if (!data.environment.rapidApiConfigured && !data.environment.rentcastConfigured) {
            setApiConfigError(
              "No API keys configured. Please add RAPIDAPI_KEY and/or RENTCAST_API_KEY to your environment variables.",
            )
          } else {
            setApiConfigError(null)
          }
        }
      }
    } catch (error) {
      console.error("Failed to check API status:", error)
    }
  }

  const searchProperties = async () => {
    if (!filters.state || !filters.msa) {
      toast({
        title: "Missing Information",
        description: "Please enter both state and MSA to search for properties",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setApiConfigError(null)

    try {
      console.log("🔍 Starting REAL API property search...")

      // Get MSA info first
      await getMSAInfo()

      const searchFilters = {
        ...filters,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minBedrooms: bedroomRange[0],
        maxBedrooms: bedroomRange[1],
      }

      console.log("📋 Search filters being sent:", searchFilters)

      const response = await fetch("/api/property-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(searchFilters),
      })

      console.log("📡 API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 API response data:", data)

      if (data.success && Array.isArray(data.properties)) {
        setProperties(data.properties)
        setApiStatus(data.apiStatus || apiStatus)

        if (data.properties.length > 0) {
          toast({
            title: "Real Data Retrieved!",
            description: `Found ${data.properties.length} REAL properties from live APIs: ${data.sources?.join(", ")}`,
          })
        } else {
          toast({
            title: "No Properties Found",
            description: "No properties found matching your criteria from the APIs. Try adjusting your search filters.",
            variant: "destructive",
          })
        }
      } else {
        throw new Error(data.error || "Invalid response format")
      }
    } catch (error: any) {
      console.error("❌ Property search error:", error)

      if (error.message.includes("API keys not configured") || error.message.includes("API Configuration Error")) {
        setApiConfigError(error.message)
        toast({
          title: "API Configuration Error",
          description: "Please configure your API keys in the environment variables.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Search Error",
          description:
            error.message || "Failed to search properties. Please check your API configuration and try again.",
          variant: "destructive",
        })
      }
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const getMSAInfo = async () => {
    if (!filters.state || !filters.msa) return

    try {
      console.log("📊 Getting MSA info...")

      const response = await fetch("/api/msa-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          msa: filters.msa,
          state: filters.state,
        }),
      })

      if (!response.ok) {
        console.warn("⚠️ Failed to get MSA info, continuing without it")
        return
      }

      const data = await response.json()
      if (data.success && data.msaInfo) {
        setMsaInfo(data.msaInfo)
        console.log("✅ MSA info retrieved successfully")
      }
    } catch (error) {
      console.warn("⚠️ Error getting MSA info:", error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getPropertyIcon = (type: string) => {
    const typeObj = PROPERTY_TYPES.find((t) => t.value === type)
    return typeObj?.icon || Home
  }

  const getPropertyTypeColor = (type: string) => {
    const colors = {
      residential: "bg-blue-100 text-blue-800",
      commercial: "bg-green-100 text-green-800",
      "multi-family": "bg-purple-100 text-purple-800",
      industrial: "bg-orange-100 text-orange-800",
      land: "bg-gray-100 text-gray-800",
    }
    return colors[type as keyof typeof colors] || colors.residential
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-300"
      case "connecting":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-red-100 text-red-800 border-red-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-3 w-3" />
      case "connecting":
        return <Loader2 className="h-3 w-3 animate-spin" />
      default:
        return <XCircle className="h-3 w-3" />
    }
  }

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: checked ? [...prev.propertyType, type] : prev.propertyType.filter((t) => t !== type),
    }))
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Filters Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Real Property Search
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* API Configuration Error */}
              {apiConfigError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <div className="font-semibold mb-1">API Configuration Required</div>
                    {apiConfigError}
                  </AlertDescription>
                </Alert>
              )}

              {/* API Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    API Status
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkAPIStatus}
                    className="h-6 px-2 text-xs bg-transparent"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">RentCast:</span>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(apiStatus.rentcast)}`}>
                      {getStatusIcon(apiStatus.rentcast)}
                      <span className="ml-1">{apiStatus.rentcast}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">LoopNet:</span>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(apiStatus.loopnet)}`}>
                      {getStatusIcon(apiStatus.loopnet)}
                      <span className="ml-1">{apiStatus.loopnet}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Zillow:</span>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(apiStatus.zillow)}`}>
                      {getStatusIcon(apiStatus.zillow)}
                      <span className="ml-1">{apiStatus.zillow}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Location Selection */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Location</h3>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={filters.state}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, state: value, msa: "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
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

                {filters.state && (
                  <div className="space-y-2">
                    <Label htmlFor="msa">MSA (Metropolitan Statistical Area)</Label>
                    <Input
                      id="msa"
                      placeholder="e.g., Austin-Round Rock, Dallas-Fort Worth-Arlington"
                      value={filters.msa}
                      onChange={(e) => setFilters((prev) => ({ ...prev, msa: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Property Type */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Property Type</h3>
                <div className="space-y-2">
                  {PROPERTY_TYPES.map((type) => {
                    const Icon = type.icon
                    const isSelected = filters.propertyType.includes(type.value)
                    return (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={isSelected}
                          onCheckedChange={(checked) => handlePropertyTypeChange(type.value, checked as boolean)}
                        />
                        <Label htmlFor={type.value} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Price Range</h3>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={2000000}
                    min={50000}
                    step={25000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Bedrooms</h3>
                <div className="px-2">
                  <Slider
                    value={bedroomRange}
                    onValueChange={setBedroomRange}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{bedroomRange[0]} bed</span>
                    <span>{bedroomRange[1]} beds</span>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Sort By</h3>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="bedrooms">Bedrooms</SelectItem>
                    <SelectItem value="squareFootage">Square Footage</SelectItem>
                    <SelectItem value="yearBuilt">Year Built</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button
                onClick={searchProperties}
                disabled={!filters.state || !filters.msa || loading || !!apiConfigError}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching Real APIs..." : "Search Real Properties"}
              </Button>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* MSA Info Header */}
        {msaInfo && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{msaInfo.name}</h2>
                  <p className="text-gray-600">Population: {msaInfo.population.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Median Income</p>
                    <p className="font-semibold">{formatPrice(msaInfo.medianIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg Home Price</p>
                    <p className="font-semibold">{formatPrice(msaInfo.averageHomePrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unemployment</p>
                    <p className="font-semibold">{msaInfo.unemploymentRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Population Growth</p>
                    <p className="font-semibold text-green-600">+{msaInfo.populationGrowth.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Properties Grid */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Real Properties Found ({properties.length})</CardTitle>
              {properties.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {filters.msa}, {filters.state}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Real API Data Only
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Searching Real APIs...</h3>
                  <p className="text-gray-600">Fetching data from RentCast, LoopNet, and Zillow APIs</p>
                </div>
              ) : apiConfigError ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                  <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">API Configuration Required</h3>
                  <p className="text-gray-600 mb-4">Please configure your API keys to search for real properties</p>
                  <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Required Environment Variables:</p>
                    <ul className="text-left space-y-1">
                      <li>• RAPIDAPI_KEY (for LoopNet and Zillow APIs)</li>
                      <li>• RENTCAST_API_KEY (for RentCast API)</li>
                    </ul>
                  </div>
                </div>
              ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                  <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Real Properties Found</h3>
                  <p className="text-gray-600 mb-4">
                    {!filters.state || !filters.msa
                      ? "Please select a state and enter an MSA to search for properties"
                      : "No properties found from the APIs. Try adjusting your search filters or check your API subscriptions."}
                  </p>
                  {!filters.state || !filters.msa ? (
                    <div className="text-sm text-gray-500">
                      <p>Example MSAs:</p>
                      <ul className="mt-1">
                        <li>• Austin-Round Rock (Texas)</li>
                        <li>• Dallas-Fort Worth-Arlington (Texas)</li>
                        <li>• Miami-Fort Lauderdale-West Palm Beach (Florida)</li>
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                  {properties.map((property) => {
                    const PropertyIcon = getPropertyIcon(property.propertyType)
                    return (
                      <Dialog key={property.id}>
                        <DialogTrigger asChild>
                          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                            <div className="relative">
                              <img
                                src={property.images[0] || "/placeholder.svg?height=200&width=300&text=Property"}
                                alt={property.title}
                                className="w-full h-48 object-cover rounded-t-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg?height=200&width=300&text=Property+Image"
                                }}
                              />
                              <Badge className={`absolute top-2 left-2 ${getPropertyTypeColor(property.propertyType)}`}>
                                <PropertyIcon className="h-3 w-3 mr-1" />
                                {property.propertyType}
                              </Badge>
                              <Badge className="absolute top-2 right-2 bg-white text-gray-900">
                                {property.marketData.daysOnMarket} days
                              </Badge>
                              <Badge className="absolute bottom-2 left-2 bg-blue-600 text-white">
                                {property.listingSource.website}
                              </Badge>
                              <Badge className="absolute bottom-2 right-2 bg-green-600 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Real Data
                              </Badge>
                            </div>
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-lg truncate">{property.title}</h3>
                                <p className="text-2xl font-bold text-green-600">{formatPrice(property.price)}</p>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {property.address}, {property.city}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  {property.bedrooms && <span>{property.bedrooms} bed</span>}
                                  {property.bathrooms && <span>{property.bathrooms} bath</span>}
                                  <span>{property.squareFootage.toLocaleString()} sqft</span>
                                </div>

                                {property.investmentMetrics.capRate && (
                                  <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-sm text-gray-500">Cap Rate</span>
                                    <span className="font-semibold text-blue-600">
                                      {property.investmentMetrics.capRate}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </DialogTrigger>

                        {/* Property Details Modal */}
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                              {property.title}
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Real API Data
                              </Badge>
                            </DialogTitle>
                          </DialogHeader>

                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="investment">Investment</TabsTrigger>
                              <TabsTrigger value="contact">Contact</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <img
                                  src={property.images[0] || "/placeholder.svg?height=300&width=400&text=Property"}
                                  alt={property.title}
                                  className="w-full h-64 object-cover rounded-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=300&width=400&text=Property+Image"
                                  }}
                                />
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-2xl font-bold text-green-600">{formatPrice(property.price)}</h3>
                                    <p className="text-gray-600">${property.marketData.pricePerSqFt}/sqft</p>
                                    <div className="flex gap-2 mt-2">
                                      <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        For Sale
                                      </Badge>
                                      <Badge className="bg-blue-100 text-blue-800">
                                        {property.listingSource.website}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <p className="flex items-center text-gray-600">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      {property.address}, {property.city}, {property.state} {property.zipCode}
                                    </p>

                                    {property.bedrooms && (
                                      <p className="flex items-center text-gray-600">
                                        <Home className="h-4 w-4 mr-2" />
                                        {property.bedrooms} bed, {property.bathrooms} bath
                                      </p>
                                    )}

                                    <p className="flex items-center text-gray-600">
                                      <Square className="h-4 w-4 mr-2" />
                                      {property.squareFootage.toLocaleString()} sqft
                                    </p>

                                    <p className="flex items-center text-gray-600">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Built in {property.yearBuilt}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-gray-600">{property.description}</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Features</h4>
                                <div className="flex flex-wrap gap-2">
                                  {property.features.map((feature, index) => (
                                    <Badge key={index} variant="secondary">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="details" className="space-y-4">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-3">Property Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Property Type:</span>
                                      <span className="capitalize">{property.propertyType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Listing Status:</span>
                                      <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        For Sale
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Square Footage:</span>
                                      <span>{property.squareFootage.toLocaleString()} sqft</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Lot Size:</span>
                                      <span>{property.lotSize?.toLocaleString()} sqft</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Year Built:</span>
                                      <span>{property.yearBuilt}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Days on Market:</span>
                                      <span>{property.marketData.daysOnMarket}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-3">Neighborhood</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Walk Score:</span>
                                      <span>{property.neighborhood.walkScore}/100</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Crime Rate:</span>
                                      <span>{property.neighborhood.crimeRate}</span>
                                    </div>
                                  </div>

                                  <div className="mt-4">
                                    <h5 className="font-medium mb-2">Schools</h5>
                                    <div className="space-y-1">
                                      {property.neighborhood.schools.map((school, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                          <span>{school.name}</span>
                                          <div className="flex items-center">
                                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                            <span>{school.rating}/10</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="investment" className="space-y-4">
                              {property.investmentMetrics.estimatedRent && (
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold mb-3">Investment Metrics</h4>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span>Estimated Monthly Rent:</span>
                                        <span className="font-bold text-green-600">
                                          {formatPrice(property.investmentMetrics.estimatedRent!)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span>Cap Rate:</span>
                                        <span className="font-bold text-blue-600">
                                          {property.investmentMetrics.capRate}%
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span>Cash-on-Cash Return:</span>
                                        <span className="font-bold text-purple-600">
                                          {property.investmentMetrics.cashOnCash}%
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span>ROI:</span>
                                        <span className="font-bold text-orange-600">
                                          {property.investmentMetrics.roi}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-3">Comparable Sales</h4>
                                    <div className="space-y-2">
                                      {property.marketData.comparables.map((comp, index) => (
                                        <div key={index} className="p-3 border rounded-lg">
                                          <p className="font-medium text-sm">{comp.address}</p>
                                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                                            <span>{formatPrice(comp.price)}</span>
                                            <span>{comp.sqft.toLocaleString()} sqft</span>
                                            <span>${comp.pricePerSqFt}/sqft</span>
                                          </div>
                                          <p className="text-xs text-gray-500 mt-1">Sold: {comp.soldDate}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="contact" className="space-y-4">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-3">Listing Agent</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="font-medium">{property.listingAgent.name}</p>
                                      <p className="text-gray-600">{property.listingAgent.company}</p>
                                    </div>

                                    <div className="space-y-2">
                                      <Button variant="outline" className="w-full justify-start bg-transparent">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {property.listingAgent.phone}
                                      </Button>
                                      <Button variant="outline" className="w-full justify-start bg-transparent">
                                        <Mail className="h-4 w-4 mr-2" />
                                        {property.listingAgent.email}
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-3">Listing Information</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>Listed On:</span>
                                      <span>{property.listingSource.website}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Listing ID:</span>
                                      <span>{property.listingSource.listingId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Status:</span>
                                      <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        For Sale
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Last Updated:</span>
                                      <span>{new Date(property.lastUpdated).toLocaleDateString()}</span>
                                    </div>
                                  </div>

                                  <Button className="w-full mt-4" asChild>
                                    <a href={property.listingSource.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View Original Listing
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
