import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface PropertySearchFilters {
  location: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  propertyType?: string[]
  minSquareFootage?: number
  maxSquareFootage?: number
  minYearBuilt?: number
  maxYearBuilt?: number
  minCapRate?: number
  maxDaysOnMarket?: number
  investmentFocus?: "cash-flow" | "appreciation" | "balanced"
}

export interface Property {
  id: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFootage: number
  lotSize: number
  yearBuilt: number
  propertyType: "Single Family" | "Condo" | "Townhouse" | "Multi-Family" | "Commercial"
  listingStatus: "For Sale" | "Under Contract" | "Sold" | "Off Market"
  daysOnMarket: number
  pricePerSqFt: number
  estimatedRent: number
  capRate: number
  cashFlow: number
  roi: number
  neighborhood: string
  schoolRating: number
  crimeRating: "Low" | "Medium" | "High"
  walkScore: number
  nearbyAmenities: string[]
  description: string
  images: string[]
  listingAgent: {
    name: string
    phone: string
    email: string
  }
  marketTrends: {
    priceChange30Days: number
    priceChange90Days: number
    averageDaysOnMarket: number
  }
  investmentMetrics: {
    grossYield: number
    netYield: number
    totalReturn: number
    paybackPeriod: number
  }
}

export class PropertySearchAgent {
  private readonly model = openai("gpt-4o")

  async searchProperties(filters: PropertySearchFilters): Promise<Property[]> {
    try {
      console.log("🔍 Starting AI property search with filters:", filters)

      const prompt = this.buildSearchPrompt(filters)

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.7,
        maxTokens: 4000,
      })

      console.log("🤖 AI Response received, parsing properties...")

      const properties = this.parseAIResponse(text, filters)

      if (properties.length === 0) {
        console.log("⚠️ AI returned no properties, using fallback generator")
        return this.generateFallbackProperties(filters)
      }

      console.log(`✅ Successfully generated ${properties.length} properties`)
      return properties
    } catch (error) {
      console.error("❌ AI property search failed:", error)
      console.log("🔄 Falling back to realistic property generator")
      return this.generateFallbackProperties(filters)
    }
  }

  private buildSearchPrompt(filters: PropertySearchFilters): string {
    return `You are a real estate AI agent. Generate 25 realistic investment properties in ${filters.location} that match these criteria:

SEARCH CRITERIA:
- Location: ${filters.location}
- Price Range: $${filters.minPrice?.toLocaleString() || "0"} - $${filters.maxPrice?.toLocaleString() || "1,000,000"}
- Bedrooms: ${filters.minBedrooms || 1} - ${filters.maxBedrooms || 10}
- Bathrooms: ${filters.minBathrooms || 1} - ${filters.maxBathrooms || 10}
- Property Types: ${filters.propertyType?.join(", ") || "All types"}
- Square Footage: ${filters.minSquareFootage || 500} - ${filters.maxSquareFootage || 10000} sq ft
- Year Built: ${filters.minYearBuilt || 1900} - ${filters.maxYearBuilt || 2024}
- Investment Focus: ${filters.investmentFocus || "balanced"}

REQUIREMENTS:
1. All properties MUST be within the specified price range
2. All properties MUST match bedroom/bathroom requirements
3. Generate realistic addresses for ${filters.location}
4. Include accurate market data for the area
5. Calculate realistic rental estimates and investment metrics
6. Provide diverse property types and neighborhoods
7. Include realistic days on market (1-180 days)
8. School ratings should be 1-10 scale
9. Walk scores should be 0-100
10. Cap rates should be realistic for the market (typically 4-12%)

FORMAT: Return ONLY a JSON array of 25 properties with this exact structure:
[
  {
    "id": "unique-id",
    "address": "123 Main St",
    "city": "City Name",
    "state": "State",
    "zipCode": "12345",
    "price": 350000,
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFootage": 1800,
    "lotSize": 0.25,
    "yearBuilt": 2010,
    "propertyType": "Single Family",
    "listingStatus": "For Sale",
    "daysOnMarket": 45,
    "pricePerSqFt": 194,
    "estimatedRent": 2800,
    "capRate": 8.5,
    "cashFlow": 450,
    "roi": 12.5,
    "neighborhood": "Downtown",
    "schoolRating": 8,
    "crimeRating": "Low",
    "walkScore": 75,
    "nearbyAmenities": ["Shopping", "Parks", "Schools"],
    "description": "Beautiful property description",
    "images": ["/modern-house-exterior.png", "/cozy-living-room.png"],
    "listingAgent": {
      "name": "Agent Name",
      "phone": "(555) 123-4567",
      "email": "agent@realty.com"
    },
    "marketTrends": {
      "priceChange30Days": 2.5,
      "priceChange90Days": 5.2,
      "averageDaysOnMarket": 35
    },
    "investmentMetrics": {
      "grossYield": 9.6,
      "netYield": 7.2,
      "totalReturn": 15.8,
      "paybackPeriod": 8.5
    }
  }
]

Generate exactly 25 properties that strictly comply with ALL filter criteria.`
  }

  private parseAIResponse(text: string, filters: PropertySearchFilters): Property[] {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.log("❌ No JSON array found in AI response")
        return []
      }

      const properties: Property[] = JSON.parse(jsonMatch[0])

      // Validate and filter properties
      const validProperties = properties
        .filter((property) => {
          return this.validateProperty(property, filters)
        })
        .slice(0, 25) // Ensure max 25 properties

      console.log(`✅ Parsed ${validProperties.length} valid properties from AI response`)
      return validProperties
    } catch (error) {
      console.error("❌ Failed to parse AI response:", error)
      return []
    }
  }

  private validateProperty(property: Property, filters: PropertySearchFilters): boolean {
    // Validate required fields
    if (!property.id || !property.address || !property.price) {
      return false
    }

    // Validate against filters
    if (filters.minPrice && property.price < filters.minPrice) return false
    if (filters.maxPrice && property.price > filters.maxPrice) return false
    if (filters.minBedrooms && property.bedrooms < filters.minBedrooms) return false
    if (filters.maxBedrooms && property.bedrooms > filters.maxBedrooms) return false
    if (filters.minBathrooms && property.bathrooms < filters.minBathrooms) return false
    if (filters.maxBathrooms && property.bathrooms > filters.maxBathrooms) return false

    return true
  }

  private generateFallbackProperties(filters: PropertySearchFilters): Property[] {
    console.log("🏠 Generating 25 fallback properties...")

    const properties: Property[] = []
    const propertyTypes: Property["propertyType"][] = ["Single Family", "Condo", "Townhouse", "Multi-Family"]
    const neighborhoods = this.getNeighborhoodsForLocation(filters.location)
    const amenities = [
      "Shopping Centers",
      "Parks",
      "Schools",
      "Public Transit",
      "Restaurants",
      "Gyms",
      "Libraries",
      "Hospitals",
    ]

    for (let i = 1; i <= 25; i++) {
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)]
      const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)]

      // Generate price within range
      const minPrice = filters.minPrice || 200000
      const maxPrice = filters.maxPrice || 800000
      const price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice)

      // Generate bedrooms/bathrooms within range
      const minBed = filters.minBedrooms || 2
      const maxBed = filters.maxBedrooms || 5
      const bedrooms = Math.floor(Math.random() * (maxBed - minBed + 1) + minBed)
      const bathrooms = Math.max(1, Math.floor(bedrooms * 0.75) + Math.floor(Math.random() * 2))

      // Generate square footage
      const minSqFt = filters.minSquareFootage || 1000
      const maxSqFt = filters.maxSquareFootage || 3000
      const squareFootage = Math.floor(Math.random() * (maxSqFt - minSqFt) + minSqFt)

      const estimatedRent = Math.floor(price * 0.008 + Math.random() * 500) // ~0.8% of price + variance
      const monthlyExpenses = Math.floor(estimatedRent * 0.3) // 30% of rent for expenses
      const annualRent = estimatedRent * 12
      const annualExpenses = monthlyExpenses * 12
      const netIncome = annualRent - annualExpenses
      const capRate = (netIncome / price) * 100
      const cashFlow = estimatedRent - monthlyExpenses - (price * 0.05) / 12 // Assuming 5% annual debt service
      const roi = ((cashFlow * 12) / (price * 0.2)) * 100 // Assuming 20% down payment

      const property: Property = {
        id: `prop-${i.toString().padStart(3, "0")}`,
        address: `${100 + i * 15} ${this.getRandomStreetName()} ${this.getRandomStreetType()}`,
        city: this.getCityFromLocation(filters.location),
        state: this.getStateFromLocation(filters.location),
        zipCode: this.generateZipCode(),
        price,
        bedrooms,
        bathrooms,
        squareFootage,
        lotSize: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100, // 0.1 to 0.6 acres
        yearBuilt: Math.floor(Math.random() * 50) + 1975, // 1975-2024
        propertyType,
        listingStatus: Math.random() > 0.1 ? "For Sale" : "Under Contract",
        daysOnMarket: Math.floor(Math.random() * 120) + 1,
        pricePerSqFt: Math.floor(price / squareFootage),
        estimatedRent,
        capRate: Math.round(capRate * 100) / 100,
        cashFlow: Math.round(cashFlow),
        roi: Math.round(roi * 100) / 100,
        neighborhood,
        schoolRating: Math.floor(Math.random() * 4) + 6, // 6-10 rating
        crimeRating: ["Low", "Low", "Medium", "High"][Math.floor(Math.random() * 4)] as "Low" | "Medium" | "High",
        walkScore: Math.floor(Math.random() * 60) + 40, // 40-100
        nearbyAmenities: this.getRandomAmenities(amenities),
        description: this.generatePropertyDescription(propertyType, bedrooms, bathrooms, neighborhood),
        images: this.getRandomImages(),
        listingAgent: {
          name: this.getRandomAgentName(),
          phone: this.generatePhoneNumber(),
          email: this.generateAgentEmail(),
        },
        marketTrends: {
          priceChange30Days: Math.round((Math.random() * 10 - 2) * 100) / 100, // -2% to +8%
          priceChange90Days: Math.round((Math.random() * 15 - 3) * 100) / 100, // -3% to +12%
          averageDaysOnMarket: Math.floor(Math.random() * 40) + 25, // 25-65 days
        },
        investmentMetrics: {
          grossYield: Math.round((annualRent / price) * 100 * 100) / 100,
          netYield: Math.round((netIncome / price) * 100 * 100) / 100,
          totalReturn: Math.round((roi + 3) * 100) / 100, // ROI + appreciation
          paybackPeriod: Math.round(((price * 0.2) / (cashFlow * 12)) * 100) / 100, // Years to payback down payment
        },
      }

      properties.push(property)
    }

    console.log(`✅ Generated ${properties.length} fallback properties`)
    return properties
  }

  private getNeighborhoodsForLocation(location: string): string[] {
    const defaultNeighborhoods = [
      "Downtown",
      "Midtown",
      "Riverside",
      "Hillcrest",
      "Oakwood",
      "Sunset",
      "Garden District",
      "Historic District",
    ]

    // Add location-specific neighborhoods if needed
    if (location.toLowerCase().includes("austin")) {
      return [
        "South Austin",
        "East Austin",
        "West Lake Hills",
        "Cedar Park",
        "Round Rock",
        "Pflugerville",
        "Georgetown",
        "Lakeway",
      ]
    }
    if (location.toLowerCase().includes("dallas")) {
      return ["Deep Ellum", "Bishop Arts", "Uptown", "Highland Park", "Plano", "Frisco", "Allen", "McKinney"]
    }

    return defaultNeighborhoods
  }

  private getCityFromLocation(location: string): string {
    const parts = location.split(",")
    return parts[0].trim()
  }

  private getStateFromLocation(location: string): string {
    const parts = location.split(",")
    if (parts.length > 1) {
      return parts[1].trim().split(" ")[0]
    }
    return "TX" // Default to Texas
  }

  private generateZipCode(): string {
    return (Math.floor(Math.random() * 90000) + 10000).toString()
  }

  private getRandomStreetName(): string {
    const streetNames = [
      "Oak",
      "Maple",
      "Cedar",
      "Pine",
      "Elm",
      "Main",
      "Park",
      "Hill",
      "Lake",
      "River",
      "Spring",
      "Garden",
      "Forest",
      "Valley",
      "Ridge",
    ]
    return streetNames[Math.floor(Math.random() * streetNames.length)]
  }

  private getRandomStreetType(): string {
    const streetTypes = ["St", "Ave", "Dr", "Ln", "Ct", "Blvd", "Way", "Pl"]
    return streetTypes[Math.floor(Math.random() * streetTypes.length)]
  }

  private getRandomAmenities(amenities: string[]): string[] {
    const count = Math.floor(Math.random() * 4) + 2 // 2-5 amenities
    const shuffled = [...amenities].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  private generatePropertyDescription(type: string, bedrooms: number, bathrooms: number, neighborhood: string): string {
    const descriptions = [
      `Beautiful ${bedrooms}-bedroom, ${bathrooms}-bathroom ${type.toLowerCase()} in desirable ${neighborhood}. Move-in ready with modern updates throughout.`,
      `Charming ${type.toLowerCase()} featuring ${bedrooms} bedrooms and ${bathrooms} bathrooms. Located in the heart of ${neighborhood} with easy access to amenities.`,
      `Spacious ${type.toLowerCase()} with ${bedrooms} bedrooms and ${bathrooms} bathrooms. Perfect investment opportunity in growing ${neighborhood} area.`,
      `Well-maintained ${type.toLowerCase()} offering ${bedrooms} bedrooms and ${bathrooms} bathrooms. Great location in ${neighborhood} with strong rental demand.`,
    ]
    return descriptions[Math.floor(Math.random() * descriptions.length)]
  }

  private getRandomImages(): string[] {
    const images = [
      "/modern-house-exterior.png",
      "/cozy-living-room.png",
      "/modern-kitchen-interior.png",
      "/cozy-bedroom.png",
      "/modern-bathroom-interior.png",
      "/cozy-backyard.png",
    ]
    const count = Math.floor(Math.random() * 3) + 2 // 2-4 images
    const shuffled = [...images].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  private getRandomAgentName(): string {
    const firstNames = ["Sarah", "Mike", "Jennifer", "David", "Lisa", "Robert", "Amanda", "Chris", "Michelle", "Brian"]
    const lastNames = [
      "Johnson",
      "Smith",
      "Williams",
      "Brown",
      "Davis",
      "Miller",
      "Wilson",
      "Moore",
      "Taylor",
      "Anderson",
    ]
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    return `${firstName} ${lastName}`
  }

  private generatePhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 800) + 200
    const exchange = Math.floor(Math.random() * 800) + 200
    const number = Math.floor(Math.random() * 9000) + 1000
    return `(${areaCode}) ${exchange}-${number}`
  }

  private generateAgentEmail(): string {
    const domains = ["realty.com", "homes.com", "properties.com", "realtor.com"]
    const domain = domains[Math.floor(Math.random() * domains.length)]
    const username = Math.random().toString(36).substring(2, 8)
    return `${username}@${domain}`
  }
}

// Create and export an instance
export const propertySearchAgent = new PropertySearchAgent()
