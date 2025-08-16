"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { PropertyListing, PropertySearchFilters, MSAInfo } from "@/lib/property-research-agent"

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

const MSA_BY_STATE: Record<string, string[]> = {
  Texas: [
    "Dallas-Fort Worth-Arlington",
    "Houston-The Woodlands-Sugar Land",
    "San Antonio-New Braunfels",
    "Austin-Round Rock",
  ],
  California: [
    "Los Angeles-Long Beach-Anaheim",
    "San Francisco-Oakland-Hayward",
    "San Diego-Carlsbad",
    "Sacramento-Roseville-Arden-Arcade",
  ],
  Florida: [
    "Miami-Fort Lauderdale-West Palm Beach",
    "Tampa-St. Petersburg-Clearwater",
    "Orlando-Kissimmee-Sanford",
    "Jacksonville",
  ],
  "New York": ["New York-Newark-Jersey City", "Buffalo-Cheektowaga-Niagara Falls", "Rochester", "Syracuse"],
  // Add more states and MSAs as needed
}

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

  // Filter states
  const [filters, setFilters] = useState<PropertySearchFilters>({
    state: "",
    msa: "",
    propertyType: [],
    minPrice: 0,
    maxPrice: 2000000,
    minBedrooms: 0,
    maxBedrooms: 10,
    sortBy: "price",
    sortOrder: "asc",
  })

  const [priceRange, setPriceRange] = useState([0, 2000000])
  const [bedroomRange, setBedroomRange] = useState([0, 10])

  // Removed or commented out the useEffect that triggers search when state and MSA are entered
  // useEffect(() => {
  //   if (filters.state && filters.msa) {
  //     searchProperties()
  //     getMSAInfo()
  //   }
  // }, [filters.state, filters.msa])

  const searchProperties = async () => {
    if (!filters.state || !filters.msa) return

    setLoading(true)
    try {
      // Get MSA info first
      await getMSAInfo()

      const searchFilters = {
        ...filters,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minBedrooms: bedroomRange[0],
        maxBedrooms: bedroomRange[1],
      }

      console.log("Search filters being sent:", searchFilters)

      const response = await fetch("/api/property-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchFilters),
      })

      if (!response.ok) throw new Error("Failed to search properties")

      const data = await response.json()
      setProperties(data.properties || [])

      toast({
        title: "Search Complete",
        description: `Found ${data.properties?.length || 0} properties`,
      })
    } catch (error) {
      console.error("Error searching properties:", error)
      toast({
        title: "Search Error",
        description: "Failed to search properties",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getMSAInfo = async () => {
    if (!filters.state || !filters.msa) return

    try {
      const response = await fetch("/api/msa-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msa: filters.msa,
          state: filters.state,
        }),
      })

      if (!response.ok) throw new Error("Failed to get MSA info")

      const data = await response.json()
      setMsaInfo(data.msaInfo)
    } catch (error) {
      console.error("Error getting MSA info:", error)
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

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Filters Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Property Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* Location Selection */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Location</h3>
                <Input
                  placeholder="Enter State (e.g., Texas, California)"
                  value={filters.state}
                  onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value, msa: "" }))}
                />
                {filters.state && (
                  <Input
                    placeholder="Enter MSA (e.g., Dallas-Fort Worth-Arlington)"
                    value={filters.msa}
                    onChange={(e) => setFilters((prev) => ({ ...prev, msa: e.target.value }))}
                  />
                )}
              </div>

              {/* Property Type */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Property Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_TYPES.map((type) => {
                    const Icon = type.icon
                    const isSelected = filters.propertyType?.includes(type.value)
                    return (
                      <Button
                        key={type.value}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="justify-start h-auto p-3"
                        onClick={() => {
                          const currentTypes = filters.propertyType || []
                          const newTypes = isSelected
                            ? currentTypes.filter((t) => t !== type.value)
                            : [...currentTypes, type.value]
                          setFilters((prev) => ({ ...prev, propertyType: newTypes }))
                        }}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        <span className="text-xs">{type.label}</span>
                      </Button>
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
                    min={0}
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
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{bedroomRange[0]}+ beds</span>
                    <span>{bedroomRange[1]} beds</span>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Sort By</h3>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="date">Date Listed</SelectItem>
                    <SelectItem value="size">Square Footage</SelectItem>
                    <SelectItem value="roi">ROI Potential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button
                onClick={searchProperties}
                disabled={!filters.state || !filters.msa || loading}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search Properties"}
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
              <CardTitle>Properties Found ({properties.length})</CardTitle>
              {properties.length > 0 && (
                <Badge variant="secondary">
                  {filters.msa}, {filters.state}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                  <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
                  <p className="text-gray-600 mb-4">
                    {!filters.state || !filters.msa
                      ? "Please select a state and MSA to search for properties"
                      : "Try adjusting your search filters to find more properties"}
                  </p>
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
                                src={property.images[0] || "/placeholder.svg"}
                                alt={property.title}
                                className="w-full h-48 object-cover rounded-t-lg"
                              />
                              <Badge className={`absolute top-2 left-2 ${getPropertyTypeColor(property.propertyType)}`}>
                                <PropertyIcon className="h-3 w-3 mr-1" />
                                {property.propertyType}
                              </Badge>
                              <Badge className="absolute top-2 right-2 bg-white text-gray-900">
                                {property.marketData.daysOnMarket} days
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
                            <DialogTitle className="text-xl">{property.title}</DialogTitle>
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
                                  src={property.images[0] || "/placeholder.svg"}
                                  alt={property.title}
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-2xl font-bold text-green-600">{formatPrice(property.price)}</h3>
                                    <p className="text-gray-600">${property.marketData.pricePerSqFt}/sqft</p>
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
                                      <span>MLS ID:</span>
                                      <span>{property.listingSource.listingId}</span>
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
