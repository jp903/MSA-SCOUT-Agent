"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  TrendingUp,
  Building,
  Phone,
  Mail,
  ExternalLink,
  AlertCircle,
  Search,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PropertyListing {
  id: string
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms?: number
  bathrooms?: number
  squareFootage: number
  lotSize?: number
  yearBuilt: number
  propertyType: string
  description: string
  features: string[]
  images: string[]
  listingStatus: "for_sale" | "sold" | "pending" | "off_market"
  listingSource: {
    website: string
    listingId: string
    url: string
  }
  listingAgent: {
    name: string
    phone: string
    email: string
    company: string
  }
  marketData: {
    daysOnMarket: number
    pricePerSqFt: number
    comparables: Array<{
      address: string
      price: number
      sqft: number
      pricePerSqFt: number
      soldDate: string
    }>
  }
  investmentMetrics: {
    estimatedRent?: number
    capRate?: number
    cashOnCash?: number
    roi?: number
  }
  neighborhood: {
    walkScore: number
    crimeRate: string
    schools: Array<{
      name: string
      rating: number
      type: string
    }>
  }
  lastUpdated: string
}

interface PropertySearchFilters {
  state: string
  msa: string
  propertyType: string[]
  minPrice: number
  maxPrice: number
  minBedrooms: number
  maxBedrooms: number
  minBathrooms?: number
  maxBathrooms?: number
  sortBy: string
  sortOrder: string
  listingStatus?: string
}

interface PropertyListingsProps {
  filters: PropertySearchFilters
}

export default function PropertyListings({ filters }: PropertyListingsProps) {
  const [properties, setProperties] = useState<PropertyListing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchMetrics, setSearchMetrics] = useState<any>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const searchProperties = async () => {
    if (!filters?.state || !filters?.msa) {
      setError("Please select both state and MSA to search for properties")
      return
    }

    setLoading(true)
    setError(null)
    setProperties([])
    setHasSearched(true)

    try {
      console.log("🔍 Searching properties with filters:", filters)

      const response = await fetch("/api/property-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      })

      console.log("📡 API response status:", response.status)

      const data = await response.json()
      console.log("📊 API response data:", data.message || "No message")

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to search properties")
      }

      if (data.success && Array.isArray(data.properties)) {
        console.log(`✅ Received ${data.properties.length} properties`)
        setProperties(data.properties)
        setSearchMetrics(data.searchMetrics)

        if (data.properties.length > 0) {
          toast({
            title: "Properties Found!",
            description: `Found ${data.properties.length} properties from real APIs`,
          })
        }
      } else {
        throw new Error("Invalid response format from API")
      }
    } catch (err: any) {
      console.error("❌ Property search error:", err)
      setError(err.message || "Failed to search properties")
      toast({
        title: "Search Error",
        description: err.message || "Failed to search properties",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Auto-search when filters change
  useEffect(() => {
    if (filters?.state && filters?.msa) {
      const timeoutId = setTimeout(() => {
        searchProperties()
      }, 500) // Debounce search

      return () => clearTimeout(timeoutId)
    }
  }, [filters?.state, filters?.msa, filters?.propertyType, filters?.minPrice, filters?.maxPrice])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "for_sale":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "sold":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPropertyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "residential":
        return "bg-blue-100 text-blue-800"
      case "commercial":
        return "bg-purple-100 text-purple-800"
      case "industrial":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Show initial state if no filters are set
  if (!filters?.state || !filters?.msa) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to Search Properties</h3>
        <p className="text-gray-500">Select a state and enter an MSA to find investment properties</p>
        <div className="mt-4 text-sm text-gray-400">
          <p>Example MSAs:</p>
          <ul className="mt-2 space-y-1">
            <li>• Austin-Round Rock (Texas)</li>
            <li>• Dallas-Fort Worth-Arlington (Texas)</li>
            <li>• Miami-Fort Lauderdale-West Palm Beach (Florida)</li>
          </ul>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Searching Properties...</h2>
          <p className="text-gray-600">
            Finding real estate opportunities in {filters.msa}, {filters.state}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <strong>Search Error:</strong> {error}
          <Button onClick={searchProperties} variant="outline" size="sm" className="ml-4 bg-transparent">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (hasSearched && properties.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Found</h3>
        <p className="text-gray-500 mb-4">
          No properties found matching your criteria in {filters.msa}, {filters.state}
        </p>
        <Button onClick={searchProperties} variant="outline">
          Search Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{formatNumber(properties.length)} Properties Found</h2>
          <p className="text-gray-600">
            in {filters.msa}, {filters.state}
          </p>
        </div>
        {searchMetrics && (
          <div className="text-right text-sm text-gray-500">
            <p>Search completed in {searchMetrics.searchDuration}</p>
            {searchMetrics.sourceBreakdown && (
              <p>
                Sources:{" "}
                {Object.entries(searchMetrics.sourceBreakdown)
                  .map(([source, count]) => `${source} (${count})`)
                  .join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Property Image */}
            <div className="relative h-48 bg-gray-200">
              <img
                src={property.images[0] || "/placeholder.svg?height=200&width=300&text=Property+Image"}
                alt={property.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=200&width=300&text=Property+Image"
                }}
              />
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge className={getStatusColor(property.listingStatus)}>
                  {property.listingStatus.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge className={getPropertyTypeColor(property.propertyType)}>
                  {property.propertyType.toUpperCase()}
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90">
                  {property.listingSource.website}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              {/* Price and Title */}
              <div className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-lg leading-tight">{formatPrice(property.price)}</h3>
                  <span className="text-sm text-gray-500">${formatNumber(property.marketData.pricePerSqFt)}/sqft</span>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">{property.title}</p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-1 mb-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 leading-tight">
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                {property.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4 text-gray-400" />
                    <span>{property.bedrooms} bed</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4 text-gray-400" />
                    <span>{property.bathrooms} bath</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4 text-gray-400" />
                  <span>{formatNumber(property.squareFootage)} sqft</span>
                </div>
              </div>

              {/* Investment Metrics */}
              {property.investmentMetrics && (
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  {property.investmentMetrics.estimatedRent && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      <span>Rent: {formatPrice(property.investmentMetrics.estimatedRent)}</span>
                    </div>
                  )}
                  {property.investmentMetrics.capRate && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                      <span>Cap: {property.investmentMetrics.capRate}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Info */}
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Built {property.yearBuilt}</span>
                </div>
                <span>{property.marketData.daysOnMarket} days on market</span>
              </div>

              {/* Agent Info */}
              <div className="border-t pt-3 mt-3">
                <p className="text-xs font-medium text-gray-700 mb-1">{property.listingAgent.name}</p>
                <p className="text-xs text-gray-500 mb-2">{property.listingAgent.company}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <a
                      href={`tel:${property.listingAgent.phone}`}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <Phone className="h-3 w-3" />
                      Call
                    </a>
                    <a
                      href={`mailto:${property.listingAgent.email}`}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <Mail className="h-3 w-3" />
                      Email
                    </a>
                  </div>
                  <a
                    href={property.listingSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Listing
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {properties.length > 0 && (
        <div className="text-center pt-6">
          <Button onClick={searchProperties} variant="outline">
            Refresh Search
          </Button>
        </div>
      )}
    </div>
  )
}
