"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import PropertyListings from "@/components/property-listings"

// US States and their major MSAs
const US_STATES_MSA = {
  Alabama: ["Birmingham-Hoover", "Huntsville", "Mobile", "Montgomery"],
  Alaska: ["Anchorage"],
  Arizona: ["Phoenix-Mesa-Scottsdale", "Tucson", "Flagstaff"],
  Arkansas: ["Little Rock-North Little Rock-Conway", "Fayetteville-Springdale-Rogers"],
  California: [
    "Los Angeles-Long Beach-Anaheim",
    "San Francisco-Oakland-Hayward",
    "Riverside-San Bernardino-Ontario",
    "San Diego-Carlsbad",
    "Sacramento--Roseville--Arden-Arcade",
    "San Jose-Sunnyvale-Santa Clara",
    "Fresno",
    "Bakersfield",
    "Stockton-Lodi",
    "Modesto",
  ],
  Colorado: ["Denver-Aurora-Lakewood", "Colorado Springs", "Fort Collins", "Boulder", "Grand Junction"],
  Connecticut: ["Hartford-West Hartford-East Hartford", "Bridgeport-Stamford-Norwalk", "New Haven-Milford"],
  Delaware: ["Dover"],
  Florida: [
    "Miami-Fort Lauderdale-West Palm Beach",
    "Tampa-St. Petersburg-Clearwater",
    "Orlando-Kissimmee-Sanford",
    "Jacksonville",
    "Cape Coral-Fort Myers",
    "North Port-Sarasota-Bradenton",
    "Lakeland-Winter Haven",
    "Deltona-Daytona Beach-Ormond Beach",
    "Palm Bay-Melbourne-Titusville",
    "Pensacola-Ferry Pass-Brent",
  ],
  Georgia: ["Atlanta-Sandy Springs-Roswell", "Augusta-Richmond County", "Columbus", "Savannah"],
  Hawaii: ["Urban Honolulu"],
  Idaho: ["Boise City", "Coeur d'Alene"],
  Illinois: ["Chicago-Naperville-Elgin", "Rockford", "Peoria", "Champaign-Urbana", "Springfield"],
  Indiana: ["Indianapolis-Carmel-Anderson", "Fort Wayne", "Evansville", "South Bend-Mishawaka"],
  Iowa: ["Des Moines-West Des Moines", "Cedar Rapids", "Davenport-Moline-Rock Island"],
  Kansas: ["Wichita", "Kansas City", "Topeka"],
  Kentucky: ["Louisville/Jefferson County", "Lexington-Fayette"],
  Louisiana: ["New Orleans-Metairie", "Baton Rouge", "Shreveport-Bossier City", "Lafayette"],
  Maine: ["Portland-South Portland", "Bangor"],
  Maryland: ["Baltimore-Columbia-Towson", "Washington-Arlington-Alexandria"],
  Massachusetts: ["Boston-Cambridge-Newton", "Worcester", "Springfield"],
  Michigan: [
    "Detroit-Warren-Dearborn",
    "Grand Rapids-Wyoming",
    "Flint",
    "Lansing-East Lansing",
    "Ann Arbor",
    "Kalamazoo-Portage",
  ],
  Minnesota: ["Minneapolis-St. Paul-Bloomington", "Duluth", "Rochester"],
  Mississippi: ["Jackson", "Gulfport-Biloxi-Pascagoula"],
  Missouri: ["St. Louis", "Kansas City", "Springfield", "Columbia"],
  Montana: ["Billings", "Missoula", "Great Falls"],
  Nebraska: ["Omaha-Council Bluffs", "Lincoln"],
  Nevada: ["Las Vegas-Henderson-Paradise", "Reno"],
  "New Hampshire": ["Manchester-Nashua"],
  "New Jersey": ["New York-Newark-Jersey City", "Philadelphia-Camden-Wilmington", "Trenton"],
  "New Mexico": ["Albuquerque", "Las Cruces", "Santa Fe"],
  "New York": [
    "New York-Newark-Jersey City",
    "Buffalo-Cheektowaga-Niagara Falls",
    "Rochester",
    "Syracuse",
    "Albany-Schenectady-Troy",
  ],
  "North Carolina": [
    "Charlotte-Concord-Gastonia",
    "Raleigh",
    "Greensboro-High Point",
    "Durham-Chapel Hill",
    "Winston-Salem",
    "Fayetteville",
    "Asheville",
  ],
  "North Dakota": ["Fargo", "Bismarck"],
  Ohio: ["Columbus", "Cleveland-Elyria", "Cincinnati", "Dayton", "Akron", "Toledo", "Youngstown-Warren-Boardman"],
  Oklahoma: ["Oklahoma City", "Tulsa"],
  Oregon: ["Portland-Vancouver-Hillsboro", "Eugene", "Salem", "Medford"],
  Pennsylvania: [
    "Philadelphia-Camden-Wilmington",
    "Pittsburgh",
    "Allentown-Bethlehem-Easton",
    "Reading",
    "Scranton--Wilkes-Barre--Hazleton",
    "Lancaster",
    "York-Hanover",
    "Harrisburg-Carlisle",
  ],
  "Rhode Island": ["Providence-Warwick"],
  "South Carolina": ["Charleston-North Charleston", "Columbia", "Greenville-Anderson-Mauldin"],
  "South Dakota": ["Sioux Falls", "Rapid City"],
  Tennessee: ["Nashville-Davidson--Murfreesboro--Franklin", "Memphis", "Knoxville", "Chattanooga", "Clarksville"],
  Texas: [
    "Dallas-Fort Worth-Arlington",
    "Houston-The Woodlands-Sugar Land",
    "San Antonio-New Braunfels",
    "Austin-Round Rock",
    "McAllen-Edinburg-Mission",
    "El Paso",
    "Fort Worth-Arlington",
    "Corpus Christi",
    "Killeen-Temple",
    "Beaumont-Port Arthur",
    "Brownsville-Harlingen",
    "Lubbock",
    "Laredo",
    "Amarillo",
    "Waco",
  ],
  Utah: ["Salt Lake City", "Provo-Orem", "Ogden-Clearfield"],
  Vermont: ["Burlington-South Burlington"],
  Virginia: ["Washington-Arlington-Alexandria", "Virginia Beach-Norfolk-Newport News", "Richmond", "Roanoke"],
  Washington: ["Seattle-Tacoma-Bellevue", "Spokane-Spokane Valley", "Kennewick-Richland", "Olympia-Tumwater"],
  "West Virginia": ["Charleston", "Huntington-Ashland"],
  Wisconsin: ["Milwaukee-Waukesha-West Allis", "Madison", "Green Bay", "Racine", "Appleton"],
  Wyoming: ["Cheyenne", "Casper"],
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

export default function PropertyListingsPage() {
  const [filters, setFilters] = useState<PropertySearchFilters>({
    state: "",
    msa: "",
    propertyType: ["residential"],
    minPrice: 100000,
    maxPrice: 2000000,
    minBedrooms: 1,
    maxBedrooms: 10,
    minBathrooms: 1,
    maxBathrooms: 10,
    sortBy: "price",
    sortOrder: "asc",
    listingStatus: "for_sale",
  })

  const handleStateChange = (state: string) => {
    setFilters((prev) => ({
      ...prev,
      state,
      msa: "", // Reset MSA when state changes
    }))
  }

  const handleMSAChange = (msa: string) => {
    setFilters((prev) => ({
      ...prev,
      msa,
    }))
  }

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: checked ? [...prev.propertyType, type] : prev.propertyType.filter((t) => t !== type),
    }))
  }

  const handlePriceChange = (field: "minPrice" | "maxPrice", value: string) => {
    const numValue = Number.parseInt(value) || 0
    setFilters((prev) => ({
      ...prev,
      [field]: numValue,
    }))
  }

  const handleBedroomChange = (field: "minBedrooms" | "maxBedrooms", value: string) => {
    const numValue = Number.parseInt(value) || 0
    setFilters((prev) => ({
      ...prev,
      [field]: numValue,
    }))
  }

  const availableMSAs = filters.state ? US_STATES_MSA[filters.state as keyof typeof US_STATES_MSA] || [] : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Property Listings</h1>
        <p className="text-gray-600">Find investment properties across the United States</p>
      </div>

      {/* Search Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Select value={filters.state} onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(US_STATES_MSA).map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="msa">Metropolitan Statistical Area (MSA)</Label>
              <Select value={filters.msa} onValueChange={handleMSAChange} disabled={!filters.state}>
                <SelectTrigger>
                  <SelectValue placeholder={filters.state ? "Select an MSA" : "Select state first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableMSAs.map((msa) => (
                    <SelectItem key={msa} value={msa}>
                      {msa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <Label>Property Type</Label>
            <div className="flex gap-4 mt-2">
              {["residential", "commercial", "industrial"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={filters.propertyType.includes(type)}
                    onCheckedChange={(checked) => handlePropertyTypeChange(type, checked as boolean)}
                  />
                  <Label htmlFor={type} className="capitalize">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice">Minimum Price</Label>
              <Input
                id="minPrice"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                placeholder="100000"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Maximum Price</Label>
              <Input
                id="maxPrice"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                placeholder="2000000"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minBedrooms">Minimum Bedrooms</Label>
              <Select
                value={filters.minBedrooms.toString()}
                onValueChange={(value) => handleBedroomChange("minBedrooms", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}+ bedrooms
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxBedrooms">Maximum Bedrooms</Label>
              <Select
                value={filters.maxBedrooms.toString()}
                onValueChange={(value) => handleBedroomChange("maxBedrooms", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} bedrooms
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="squareFootage">Square Footage</SelectItem>
                  <SelectItem value="yearBuilt">Year Built</SelectItem>
                  <SelectItem value="daysOnMarket">Days on Market</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, sortOrder: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Low to High</SelectItem>
                  <SelectItem value="desc">High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Listings */}
      <PropertyListings filters={filters} />
    </div>
  )
}
