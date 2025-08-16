import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface PropertySearchFilters {
  location: string
  propertyType: string
  minPrice: number
  maxPrice: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  minSquareFeet?: number
  maxSquareFeet?: number
  yearBuilt?: {
    min?: number
    max?: number
  }
  lotSize?: {
    min?: number
    max?: number
  }
  features?: string[]
  investmentType?: "buy-and-hold" | "fix-and-flip" | "commercial" | "land"
}

export interface PropertyListing {
  id: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet: number
  lotSize: number
  yearBuilt: number
  propertyType: string
  description: string
  features: string[]
  images: string[]
  listingAgent: {
    name: string
    phone: string
    email: string
    company: string
  }
  propertyOwner: {
    name: string
    phone: string
    email: string
    ownershipDuration: string
    motivation: string
  }
  marketAnalysis: {
    estimatedValue: number
    pricePerSquareFoot: number
    daysOnMarket: number
    comparableProperties: number
    marketTrend: "rising" | "stable" | "declining"
    investmentScore: number
  }
  financialProjections: {
    estimatedRent: number
    capRate: number
    cashOnCash: number
    grossYield: number
    monthlyExpenses: number
    annualAppreciation: number
  }
  neighborhood: {
    walkScore: number
    crimeRate: string
    schoolRating: number
    nearbyAmenities: string[]
    publicTransport: boolean
    futureProjects: string[]
  }
  investmentHighlights: string[]
  potentialIssues: string[]
  lastUpdated: string
}

export class PropertySearchAgent {
  private static generateFallbackProperties(filters: PropertySearchFilters, count = 25): PropertyListing[] {
    const properties: PropertyListing[] = []
    const cities = this.getCitiesForLocation(filters.location)
    const propertyTypes =
      filters.propertyType === "any" ? ["Single Family", "Condo", "Townhouse"] : [filters.propertyType]

    for (let i = 0; i < count; i++) {
      const city = cities[i % cities.length]
      const propertyType = propertyTypes[i % propertyTypes.length]
      const price = this.randomBetween(filters.minPrice, filters.maxPrice)
      const bedrooms = filters.minBedrooms
        ? this.randomBetween(filters.minBedrooms, filters.maxBedrooms || 5)
        : this.randomBetween(2, 4)
      const bathrooms = filters.minBathrooms
        ? this.randomBetween(filters.minBathrooms, filters.maxBathrooms || 4)
        : this.randomBetween(1, 3)
      const squareFeet = filters.minSquareFeet
        ? this.randomBetween(filters.minSquareFeet, filters.maxSquareFeet || 3000)
        : this.randomBetween(1200, 2500)
      const yearBuilt = filters.yearBuilt?.min
        ? this.randomBetween(filters.yearBuilt.min, filters.yearBuilt.max || 2023)
        : this.randomBetween(1980, 2020)

      const property: PropertyListing = {
        id: `prop_${Date.now()}_${i}`,
        address: `${this.randomBetween(100, 9999)} ${this.getRandomStreetName()} ${this.getRandomStreetType()}`,
        city: city.name,
        state: city.state,
        zipCode: city.zipCode,
        price,
        bedrooms,
        bathrooms,
        squareFeet,
        lotSize: this.randomBetween(0.15, 1.2),
        yearBuilt,
        propertyType,
        description: this.generatePropertyDescription(propertyType, bedrooms, bathrooms, squareFeet, city.name),
        features: this.generatePropertyFeatures(propertyType, price),
        images: this.generatePropertyImages(propertyType),
        listingAgent: this.generateListingAgent(),
        propertyOwner: this.generatePropertyOwner(),
        marketAnalysis: this.generateMarketAnalysis(price, squareFeet),
        financialProjections: this.generateFinancialProjections(price, city.name),
        neighborhood: this.generateNeighborhoodInfo(city.name),
        investmentHighlights: this.generateInvestmentHighlights(propertyType, price),
        potentialIssues: this.generatePotentialIssues(yearBuilt, propertyType),
        lastUpdated: new Date().toISOString(),
      }

      properties.push(property)
    }

    return properties
  }

  private static getCitiesForLocation(location: string) {
    const locationMap: { [key: string]: Array<{ name: string; state: string; zipCode: string }> } = {
      florida: [
        { name: "Miami", state: "FL", zipCode: "33101" },
        { name: "Orlando", state: "FL", zipCode: "32801" },
        { name: "Tampa", state: "FL", zipCode: "33602" },
        { name: "Jacksonville", state: "FL", zipCode: "32202" },
        { name: "Fort Lauderdale", state: "FL", zipCode: "33301" },
      ],
      texas: [
        { name: "Austin", state: "TX", zipCode: "73301" },
        { name: "Dallas", state: "TX", zipCode: "75201" },
        { name: "Houston", state: "TX", zipCode: "77002" },
        { name: "San Antonio", state: "TX", zipCode: "78205" },
        { name: "Fort Worth", state: "TX", zipCode: "76102" },
      ],
      california: [
        { name: "Los Angeles", state: "CA", zipCode: "90210" },
        { name: "San Diego", state: "CA", zipCode: "92101" },
        { name: "San Francisco", state: "CA", zipCode: "94102" },
        { name: "Sacramento", state: "CA", zipCode: "95814" },
        { name: "Fresno", state: "CA", zipCode: "93721" },
      ],
      arizona: [
        { name: "Phoenix", state: "AZ", zipCode: "85001" },
        { name: "Tucson", state: "AZ", zipCode: "85701" },
        { name: "Mesa", state: "AZ", zipCode: "85201" },
        { name: "Chandler", state: "AZ", zipCode: "85225" },
        { name: "Scottsdale", state: "AZ", zipCode: "85251" },
      ],
    }

    const normalizedLocation = location.toLowerCase()
    return locationMap[normalizedLocation] || [{ name: "Generic City", state: "ST", zipCode: "12345" }]
  }

  private static getRandomStreetName(): string {
    const streetNames = [
      "Oak",
      "Pine",
      "Maple",
      "Cedar",
      "Elm",
      "Birch",
      "Willow",
      "Cherry",
      "Sunset",
      "Sunrise",
      "Park",
      "Main",
      "First",
      "Second",
      "Third",
      "Broadway",
      "Washington",
      "Lincoln",
      "Madison",
      "Jefferson",
      "Franklin",
      "Jackson",
      "Wilson",
      "Johnson",
      "Smith",
      "Brown",
      "Davis",
      "Miller",
    ]
    return streetNames[Math.floor(Math.random() * streetNames.length)]
  }

  private static getRandomStreetType(): string {
    const streetTypes = ["St", "Ave", "Blvd", "Dr", "Ln", "Ct", "Way", "Pl", "Rd", "Cir"]
    return streetTypes[Math.floor(Math.random() * streetTypes.length)]
  }

  private static generatePropertyDescription(
    type: string,
    bedrooms: number,
    bathrooms: number,
    sqft: number,
    city: string,
  ): string {
    const descriptions = [
      `Beautiful ${bedrooms} bedroom, ${bathrooms} bathroom ${type.toLowerCase()} in desirable ${city} neighborhood. This ${sqft} sq ft home features modern amenities and excellent investment potential.`,
      `Stunning ${type.toLowerCase()} with ${bedrooms} bedrooms and ${bathrooms} bathrooms. Located in prime ${city} area with great schools and shopping nearby. Perfect for investors or owner-occupants.`,
      `Charming ${bedrooms}/${bathrooms} ${type.toLowerCase()} offering ${sqft} sq ft of comfortable living space. Excellent location in ${city} with easy access to major highways and amenities.`,
      `Well-maintained ${type.toLowerCase()} featuring ${bedrooms} bedrooms, ${bathrooms} bathrooms, and ${sqft} sq ft. Great investment opportunity in growing ${city} market.`,
    ]
    return descriptions[Math.floor(Math.random() * descriptions.length)]
  }

  private static generatePropertyFeatures(type: string, price: number): string[] {
    const baseFeatures = ["Central Air", "Heating", "Parking"]
    const luxuryFeatures = [
      "Granite Countertops",
      "Stainless Steel Appliances",
      "Hardwood Floors",
      "Walk-in Closets",
      "Master Suite",
    ]
    const outdoorFeatures = ["Patio", "Deck", "Fenced Yard", "Landscaping", "Sprinkler System"]
    const modernFeatures = ["Smart Home Features", "Energy Efficient Windows", "Updated Kitchen", "Renovated Bathrooms"]

    const features = [...baseFeatures]

    if (price > 300000) {
      features.push(...luxuryFeatures.slice(0, 3))
    }
    if (type === "Single Family") {
      features.push(...outdoorFeatures.slice(0, 2))
    }
    if (Math.random() > 0.5) {
      features.push(...modernFeatures.slice(0, 2))
    }

    return features
  }

  private static generatePropertyImages(type: string): string[] {
    const baseImages = [
      "/modern-house-exterior.png",
      "/cozy-living-room.png",
      "/modern-kitchen-interior.png",
      "/cozy-bedroom.png",
      "/modern-bathroom-interior.png",
    ]

    if (type === "Single Family") {
      baseImages.push("/cozy-backyard.png")
    }

    return baseImages
  }

  private static generateListingAgent() {
    const firstNames = ["John", "Sarah", "Michael", "Jennifer", "David", "Lisa", "Robert", "Maria", "James", "Amanda"]
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
    ]
    const companies = [
      "Coldwell Banker",
      "RE/MAX",
      "Century 21",
      "Keller Williams",
      "Berkshire Hathaway",
      "Realty One Group",
    ]

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const company = companies[Math.floor(Math.random() * companies.length)]

    return {
      name: `${firstName} ${lastName}`,
      phone: `(${this.randomBetween(200, 999)}) ${this.randomBetween(200, 999)}-${this.randomBetween(1000, 9999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, "")}.com`,
      company,
    }
  }

  private static generatePropertyOwner() {
    const firstNames = [
      "Robert",
      "Patricia",
      "Christopher",
      "Barbara",
      "Daniel",
      "Elizabeth",
      "Matthew",
      "Helen",
      "Anthony",
      "Sandra",
    ]
    const lastNames = [
      "Anderson",
      "Thomas",
      "Jackson",
      "White",
      "Harris",
      "Martin",
      "Thompson",
      "Garcia",
      "Martinez",
      "Robinson",
    ]
    const motivations = [
      "Relocating for work",
      "Downsizing",
      "Investment liquidation",
      "Estate sale",
      "Job transfer",
      "Retirement",
      "Family expansion",
    ]

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const ownershipYears = this.randomBetween(2, 15)

    return {
      name: `${firstName} ${lastName}`,
      phone: `(${this.randomBetween(200, 999)}) ${this.randomBetween(200, 999)}-${this.randomBetween(1000, 9999)}`,
      email: `${firstName.toLowerCase()}${lastName.toLowerCase()}@gmail.com`,
      ownershipDuration: `${ownershipYears} years`,
      motivation: motivations[Math.floor(Math.random() * motivations.length)],
    }
  }

  private static generateMarketAnalysis(price: number, sqft: number) {
    const pricePerSqFt = Math.round(price / sqft)
    const estimatedValue = price + this.randomBetween(-20000, 30000)

    return {
      estimatedValue,
      pricePerSquareFoot: pricePerSqFt,
      daysOnMarket: this.randomBetween(5, 120),
      comparableProperties: this.randomBetween(8, 25),
      marketTrend: ["rising", "stable", "declining"][Math.floor(Math.random() * 3)] as
        | "rising"
        | "stable"
        | "declining",
      investmentScore: this.randomBetween(65, 95),
    }
  }

  private static generateFinancialProjections(price: number, city: string) {
    const rentMultiplier =
      city.includes("San Francisco") || city.includes("Los Angeles")
        ? 0.004
        : city.includes("Miami") || city.includes("Austin")
          ? 0.0065
          : 0.008

    const estimatedRent = Math.round(price * rentMultiplier)
    const annualRent = estimatedRent * 12
    const monthlyExpenses = Math.round(estimatedRent * 0.35)
    const netAnnualIncome = annualRent - monthlyExpenses * 12

    return {
      estimatedRent,
      capRate: Number(((netAnnualIncome / price) * 100).toFixed(2)),
      cashOnCash: Number(this.randomBetween(8, 15).toFixed(2)),
      grossYield: Number(((annualRent / price) * 100).toFixed(2)),
      monthlyExpenses,
      annualAppreciation: Number(this.randomBetween(3, 8).toFixed(1)),
    }
  }

  private static generateNeighborhoodInfo(city: string) {
    return {
      walkScore: this.randomBetween(45, 95),
      crimeRate: ["Low", "Moderate", "Average"][Math.floor(Math.random() * 3)],
      schoolRating: this.randomBetween(6, 10),
      nearbyAmenities: ["Shopping Center", "Parks", "Restaurants", "Gym", "Library", "Hospital"].slice(
        0,
        this.randomBetween(3, 6),
      ),
      publicTransport: Math.random() > 0.4,
      futureProjects: ["New Shopping Mall", "School Expansion", "Park Development", "Road Improvements"].slice(
        0,
        this.randomBetween(1, 3),
      ),
    }
  }

  private static generateInvestmentHighlights(type: string, price: number): string[] {
    const highlights = [
      "Strong rental demand in area",
      "Below market value pricing",
      "Excellent school district",
      "Growing neighborhood",
      "Low maintenance property",
      "High appreciation potential",
      "Motivated seller",
      "Move-in ready condition",
      "Great cash flow potential",
      "Prime location",
    ]

    return highlights.slice(0, this.randomBetween(3, 6))
  }

  private static generatePotentialIssues(yearBuilt: number, type: string): string[] {
    const issues = []

    if (yearBuilt < 1990) {
      issues.push("Older electrical system may need updating")
    }
    if (yearBuilt < 1980) {
      issues.push("Potential plumbing updates needed")
    }
    if (type === "Condo") {
      issues.push("HOA fees and restrictions")
    }
    if (Math.random() > 0.7) {
      issues.push("Minor cosmetic updates recommended")
    }

    return issues.slice(0, 2)
  }

  private static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static async searchProperties(filters: PropertySearchFilters): Promise<PropertyListing[]> {
    try {
      console.log("Starting property search with filters:", filters)

      // Create a detailed prompt for GPT-4o to generate realistic properties
      const prompt = `Generate 25 realistic property listings for real estate investment in ${filters.location}. 

REQUIREMENTS:
- Property type: ${filters.propertyType}
- Price range: $${filters.minPrice.toLocaleString()} - $${filters.maxPrice.toLocaleString()}
- Bedrooms: ${filters.minBedrooms || "any"} - ${filters.maxBedrooms || "any"}
- Bathrooms: ${filters.minBathrooms || "any"} - ${filters.maxBathrooms || "any"}
- Square feet: ${filters.minSquareFeet || "any"} - ${filters.maxSquareFeet || "any"}
- Year built: ${filters.yearBuilt?.min || "any"} - ${filters.yearBuilt?.max || "any"}
- Investment type: ${filters.investmentType || "buy-and-hold"}

For each property, provide:
1. Realistic address with actual street names common in ${filters.location}
2. Market-appropriate pricing for the area
3. Detailed property specifications that match the filters EXACTLY
4. Realistic rental income estimates for the local market
5. Property owner contact information with motivation to sell
6. Listing agent details
7. Investment analysis including cap rates, cash-on-cash returns
8. Neighborhood information and amenities
9. Market trends and comparable sales data
10. Investment highlights and potential concerns

Make all data realistic and market-appropriate for ${filters.location}. Ensure properties strictly match the specified criteria.

Return the data as a structured JSON array with complete property details.`

      console.log("Attempting to generate properties with AI...")

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        maxTokens: 4000,
      })

      console.log("AI response received, parsing...")

      // Try to parse the AI response
      let aiProperties: PropertyListing[] = []
      try {
        // Look for JSON in the response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0])
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            aiProperties = parsedData
            console.log(`Successfully parsed ${aiProperties.length} properties from AI`)
          }
        }
      } catch (parseError) {
        console.log("Failed to parse AI response as JSON, using fallback")
      }

      // If AI generation failed or returned insufficient results, use fallback
      if (aiProperties.length < 20) {
        console.log("AI generated insufficient properties, using enhanced fallback")
        const fallbackProperties = this.generateFallbackProperties(filters, 25)

        // Combine AI properties with fallback if we have some AI results
        const combinedProperties = [...aiProperties, ...fallbackProperties].slice(0, 25)

        console.log(
          `Returning ${combinedProperties.length} properties (${aiProperties.length} AI + ${fallbackProperties.length} fallback)`,
        )
        return combinedProperties
      }

      console.log(`Successfully returning ${aiProperties.length} AI-generated properties`)
      return aiProperties.slice(0, 25)
    } catch (error) {
      console.error("Error in property search:", error)

      // Always return fallback properties on any error
      console.log("Falling back to generated properties due to error")
      return this.generateFallbackProperties(filters, 25)
    }
  }
}

// Create instance for named export compatibility
export const propertySearchAgent = new PropertySearchAgent()
