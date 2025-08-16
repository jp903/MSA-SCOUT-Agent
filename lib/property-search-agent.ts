import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface PropertySearchFilters {
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
}

export interface PropertyListing {
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

export interface MSAInfo {
  name: string
  population: number
  medianIncome: number
  averageHomePrice: number
  unemploymentRate: number
  populationGrowth: number
}

export class PropertySearchAgent {
  private model = openai("gpt-4o")

  async searchProperties(filters: PropertySearchFilters): Promise<PropertyListing[]> {
    try {
      console.log("🔍 Starting AI-powered property search with filters:", filters)

      const prompt = this.buildSearchPrompt(filters)
      console.log("📝 Generated search prompt for AI")

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.8,
        maxTokens: 8000,
      })

      console.log("🤖 AI response received, parsing properties...")

      const properties = this.parseAIResponse(text, filters)

      if (properties.length === 0) {
        console.log("⚠️ AI returned no valid properties, using enhanced fallback")
        return this.generateEnhancedFallbackProperties(filters)
      }

      console.log(`✅ Successfully generated ${properties.length} properties with AI`)
      return properties
    } catch (error) {
      console.error("❌ AI property search failed:", error)
      console.log("🔄 Using enhanced fallback property generator")
      return this.generateEnhancedFallbackProperties(filters)
    }
  }

  private buildSearchPrompt(filters: PropertySearchFilters): string {
    const propertyTypes = filters.propertyType.length > 0 ? filters.propertyType.join(", ") : "all types"

    return `You are an expert real estate AI agent. Generate exactly 25 realistic property listings for investment in ${filters.msa}, ${filters.state} that strictly match these criteria:

SEARCH REQUIREMENTS:
- Location: ${filters.msa}, ${filters.state}
- Property Types: ${propertyTypes}
- Price Range: $${filters.minPrice.toLocaleString()} - $${filters.maxPrice.toLocaleString()}
- Bedrooms: ${filters.minBedrooms} - ${filters.maxBedrooms}
- Bathrooms: ${filters.minBathrooms || 1} - ${filters.maxBathrooms || 10}

CRITICAL REQUIREMENTS:
1. ALL properties MUST be within the specified price range
2. ALL properties MUST have bedrooms within the specified range
3. Generate realistic addresses in ${filters.msa}, ${filters.state}
4. Include accurate investment metrics (rent estimates, cap rates, ROI)
5. Provide realistic market data and comparable sales
6. Include detailed property features and neighborhood information
7. Generate realistic listing agent information
8. Calculate proper investment returns for each property

For each property, provide complete details including:
- Realistic street addresses in ${filters.msa}
- Market-appropriate pricing for ${filters.state}
- Accurate square footage and lot sizes
- Realistic rental income estimates
- Investment metrics (cap rate 4-12%, ROI 8-20%)
- Neighborhood schools and amenities
- Property features and condition
- Days on market (5-180 days)
- Comparable sales data

Return ONLY a JSON array with exactly 25 properties using this structure:
[
  {
    "id": "prop_001",
    "title": "Beautiful 3BR/2BA Single Family Home",
    "address": "123 Oak Street",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701",
    "price": 450000,
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFootage": 1800,
    "lotSize": 0.25,
    "yearBuilt": 2015,
    "propertyType": "residential",
    "description": "Charming home with modern updates...",
    "features": ["Updated Kitchen", "Hardwood Floors", "Central AC"],
    "images": ["/modern-house-exterior.png", "/cozy-living-room.png"],
    "listingSource": {
      "website": "Zillow",
      "listingId": "ZIL123456",
      "url": "https://zillow.com/property/123456"
    },
    "listingAgent": {
      "name": "Sarah Johnson",
      "phone": "(512) 555-0123",
      "email": "sarah@austinrealty.com",
      "company": "Austin Realty Group"
    },
    "marketData": {
      "daysOnMarket": 28,
      "pricePerSqFt": 250,
      "comparables": [
        {
          "address": "456 Pine Ave",
          "price": 440000,
          "sqft": 1750,
          "pricePerSqFt": 251,
          "soldDate": "2024-01-15"
        }
      ]
    },
    "investmentMetrics": {
      "estimatedRent": 2800,
      "capRate": 7.5,
      "cashOnCash": 12.3,
      "roi": 15.8
    },
    "neighborhood": {
      "walkScore": 75,
      "crimeRate": "Low",
      "schools": [
        {
          "name": "Austin Elementary",
          "rating": 9,
          "type": "Elementary"
        }
      ]
    },
    "lastUpdated": "2024-01-20T10:00:00Z"
  }
]

Generate exactly 25 properties that strictly match ALL the specified criteria. Make all data realistic for ${filters.msa}, ${filters.state} market conditions.`
  }

  private parseAIResponse(text: string, filters: PropertySearchFilters): PropertyListing[] {
    try {
      // Extract JSON from the AI response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.log("❌ No JSON array found in AI response")
        return []
      }

      const rawProperties = JSON.parse(jsonMatch[0])

      if (!Array.isArray(rawProperties)) {
        console.log("❌ AI response is not an array")
        return []
      }

      // Process and validate each property
      const validProperties: PropertyListing[] = []

      for (let i = 0; i < rawProperties.length; i++) {
        try {
          const property = this.processAIProperty(rawProperties[i], filters, i)
          if (this.validateProperty(property, filters)) {
            validProperties.push(property)
          }
        } catch (error) {
          console.warn(`⚠️ Skipping invalid property ${i}:`, error)
          continue
        }
      }

      console.log(`✅ Successfully processed ${validProperties.length} valid properties from AI`)
      return validProperties.slice(0, 25) // Ensure max 25 properties
    } catch (error) {
      console.error("❌ Failed to parse AI response:", error)
      return []
    }
  }

  private processAIProperty(rawProperty: any, filters: PropertySearchFilters, index: number): PropertyListing {
    const id = rawProperty.id || `ai_prop_${Date.now()}_${index}`

    return {
      id,
      title:
        rawProperty.title ||
        `${rawProperty.bedrooms || 3}BR/${rawProperty.bathrooms || 2}BA ${rawProperty.propertyType || "Home"}`,
      address: rawProperty.address || `${1000 + index} Main St`,
      city: rawProperty.city || filters.msa.split("-")[0],
      state: rawProperty.state || filters.state,
      zipCode: rawProperty.zipCode || this.generateZipCode(),
      price: Number(rawProperty.price) || this.generatePrice(filters),
      bedrooms: Number(rawProperty.bedrooms) || filters.minBedrooms,
      bathrooms: Number(rawProperty.bathrooms) || Math.max(1, Math.floor(rawProperty.bedrooms * 0.75)),
      squareFootage: Number(rawProperty.squareFootage) || this.generateSquareFootage(rawProperty.bedrooms || 3),
      lotSize: Number(rawProperty.lotSize) || Math.round((Math.random() * 0.5 + 0.1) * 100) / 100,
      yearBuilt: Number(rawProperty.yearBuilt) || Math.floor(Math.random() * 30) + 1995,
      propertyType: rawProperty.propertyType || "residential",
      description: rawProperty.description || this.generateDescription(rawProperty),
      features: Array.isArray(rawProperty.features) ? rawProperty.features : this.generateFeatures(),
      images: Array.isArray(rawProperty.images) ? rawProperty.images : this.getDefaultImages(),
      listingSource: {
        website: rawProperty.listingSource?.website || "Zillow",
        listingId: rawProperty.listingSource?.listingId || `ZIL${Math.random().toString(36).substr(2, 9)}`,
        url: rawProperty.listingSource?.url || `https://zillow.com/property/${id}`,
      },
      listingAgent: {
        name: rawProperty.listingAgent?.name || this.generateAgentName(),
        phone: rawProperty.listingAgent?.phone || this.generatePhoneNumber(),
        email: rawProperty.listingAgent?.email || this.generateAgentEmail(),
        company: rawProperty.listingAgent?.company || this.generateCompanyName(),
      },
      marketData: {
        daysOnMarket: Number(rawProperty.marketData?.daysOnMarket) || Math.floor(Math.random() * 120) + 5,
        pricePerSqFt:
          Number(rawProperty.marketData?.pricePerSqFt) || Math.floor(rawProperty.price / rawProperty.squareFootage),
        comparables: Array.isArray(rawProperty.marketData?.comparables)
          ? rawProperty.marketData.comparables
          : this.generateComparables(rawProperty.price, rawProperty.squareFootage),
      },
      investmentMetrics: {
        estimatedRent: Number(rawProperty.investmentMetrics?.estimatedRent) || Math.floor(rawProperty.price * 0.008),
        capRate: Number(rawProperty.investmentMetrics?.capRate) || Math.round((Math.random() * 8 + 4) * 100) / 100,
        cashOnCash:
          Number(rawProperty.investmentMetrics?.cashOnCash) || Math.round((Math.random() * 12 + 8) * 100) / 100,
        roi: Number(rawProperty.investmentMetrics?.roi) || Math.round((Math.random() * 12 + 10) * 100) / 100,
      },
      neighborhood: {
        walkScore: Number(rawProperty.neighborhood?.walkScore) || Math.floor(Math.random() * 40) + 60,
        crimeRate: rawProperty.neighborhood?.crimeRate || ["Low", "Low", "Medium"][Math.floor(Math.random() * 3)],
        schools: Array.isArray(rawProperty.neighborhood?.schools)
          ? rawProperty.neighborhood.schools
          : this.generateSchools(),
      },
      lastUpdated: rawProperty.lastUpdated || new Date().toISOString(),
    }
  }

  private validateProperty(property: PropertyListing, filters: PropertySearchFilters): boolean {
    // Validate price range
    if (property.price < filters.minPrice || property.price > filters.maxPrice) {
      return false
    }

    // Validate bedrooms
    if (property.bedrooms && (property.bedrooms < filters.minBedrooms || property.bedrooms > filters.maxBedrooms)) {
      return false
    }

    // Validate property type if specified
    if (filters.propertyType.length > 0 && !filters.propertyType.includes(property.propertyType)) {
      return false
    }

    return true
  }

  private generateEnhancedFallbackProperties(filters: PropertySearchFilters): PropertyListing[] {
    console.log("🏠 Generating 25 enhanced fallback properties...")

    const properties: PropertyListing[] = []
    const propertyTypes =
      filters.propertyType.length > 0 ? filters.propertyType : ["residential", "multi-family", "commercial"]
    const streetNames = ["Oak", "Pine", "Maple", "Cedar", "Elm", "Main", "Park", "Hill", "Lake", "River"]
    const streetTypes = ["St", "Ave", "Dr", "Ln", "Ct", "Blvd", "Way", "Pl"]

    for (let i = 1; i <= 25; i++) {
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)]
      const price = this.generatePrice(filters)
      const bedrooms = Math.floor(Math.random() * (filters.maxBedrooms - filters.minBedrooms + 1)) + filters.minBedrooms
      const bathrooms = Math.max(1, Math.floor(bedrooms * 0.75) + Math.floor(Math.random() * 2))
      const squareFootage = this.generateSquareFootage(bedrooms)
      const estimatedRent = Math.floor(price * 0.008 + Math.random() * 500)

      const property: PropertyListing = {
        id: `fallback_prop_${i.toString().padStart(3, "0")}`,
        title: `${bedrooms}BR/${bathrooms}BA ${this.capitalizeFirst(propertyType)} Home`,
        address: `${1000 + i * 25} ${streetNames[i % streetNames.length]} ${streetTypes[i % streetTypes.length]}`,
        city: filters.msa.split("-")[0] || "Austin",
        state: filters.state,
        zipCode: this.generateZipCode(),
        price,
        bedrooms,
        bathrooms,
        squareFootage,
        lotSize: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100,
        yearBuilt: Math.floor(Math.random() * 30) + 1995,
        propertyType,
        description: this.generateDescription({ bedrooms, bathrooms, propertyType, city: filters.msa }),
        features: this.generateFeatures(),
        images: this.getDefaultImages(),
        listingSource: {
          website: ["Zillow", "Realtor.com", "Redfin"][Math.floor(Math.random() * 3)],
          listingId: `${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          url: `https://zillow.com/property/fallback_${i}`,
        },
        listingAgent: {
          name: this.generateAgentName(),
          phone: this.generatePhoneNumber(),
          email: this.generateAgentEmail(),
          company: this.generateCompanyName(),
        },
        marketData: {
          daysOnMarket: Math.floor(Math.random() * 120) + 5,
          pricePerSqFt: Math.floor(price / squareFootage),
          comparables: this.generateComparables(price, squareFootage),
        },
        investmentMetrics: {
          estimatedRent,
          capRate: Math.round(((estimatedRent * 12 * 0.7) / price) * 100 * 100) / 100, // 70% of rent after expenses
          cashOnCash: Math.round((Math.random() * 12 + 8) * 100) / 100,
          roi: Math.round((Math.random() * 12 + 10) * 100) / 100,
        },
        neighborhood: {
          walkScore: Math.floor(Math.random() * 40) + 60,
          crimeRate: ["Low", "Low", "Medium", "High"][Math.floor(Math.random() * 4)],
          schools: this.generateSchools(),
        },
        lastUpdated: new Date().toISOString(),
      }

      properties.push(property)
    }

    console.log(`✅ Generated ${properties.length} enhanced fallback properties`)
    return properties
  }

  // Helper methods
  private generatePrice(filters: PropertySearchFilters): number {
    return Math.floor(Math.random() * (filters.maxPrice - filters.minPrice) + filters.minPrice)
  }

  private generateSquareFootage(bedrooms: number): number {
    const baseSize = bedrooms * 400 + 600 // Base calculation
    return baseSize + Math.floor(Math.random() * 800) // Add variance
  }

  private generateZipCode(): string {
    return (Math.floor(Math.random() * 90000) + 10000).toString()
  }

  private generateDescription(property: any): string {
    const templates = [
      `Beautiful ${property.bedrooms || 3}-bedroom, ${property.bathrooms || 2}-bathroom ${property.propertyType || "home"} in ${property.city || "desirable area"}. This well-maintained property features modern amenities and excellent investment potential.`,
      `Charming ${property.propertyType || "property"} with ${property.bedrooms || 3} bedrooms and ${property.bathrooms || 2} bathrooms. Located in prime ${property.city || "location"} with great schools and shopping nearby.`,
      `Spacious ${property.bedrooms || 3}BR/${property.bathrooms || 2}BA ${property.propertyType || "home"} offering excellent investment opportunity. Move-in ready with updates throughout.`,
      `Well-positioned ${property.propertyType || "property"} in growing ${property.city || "market"}. Perfect for investors seeking strong rental income and appreciation potential.`,
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  private generateFeatures(): string[] {
    const allFeatures = [
      "Updated Kitchen",
      "Hardwood Floors",
      "Central AC",
      "Granite Countertops",
      "Stainless Appliances",
      "Master Suite",
      "Walk-in Closets",
      "Fireplace",
      "Patio/Deck",
      "Garage",
      "New Roof",
      "Fresh Paint",
      "Landscaped Yard",
      "Storage Space",
      "Energy Efficient",
      "Open Floor Plan",
    ]
    const count = Math.floor(Math.random() * 6) + 4 // 4-9 features
    const shuffled = allFeatures.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  private getDefaultImages(): string[] {
    return [
      "/modern-house-exterior.png",
      "/cozy-living-room.png",
      "/modern-kitchen-interior.png",
      "/cozy-bedroom.png",
      "/modern-bathroom-interior.png",
      "/cozy-backyard.png",
    ]
  }

  private generateAgentName(): string {
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
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
  }

  private generatePhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 800) + 200
    const exchange = Math.floor(Math.random() * 800) + 200
    const number = Math.floor(Math.random() * 9000) + 1000
    return `(${areaCode}) ${exchange}-${number}`
  }

  private generateAgentEmail(): string {
    const domains = ["realty.com", "homes.com", "properties.com", "realtor.com"]
    const username = Math.random().toString(36).substring(2, 8)
    return `${username}@${domains[Math.floor(Math.random() * domains.length)]}`
  }

  private generateCompanyName(): string {
    const companies = [
      "Premier Realty Group",
      "Elite Properties",
      "Citywide Real Estate",
      "Prime Realty Partners",
      "Metro Property Group",
      "Signature Real Estate",
      "Pinnacle Properties",
      "Crown Realty",
      "Summit Real Estate",
      "Apex Property Group",
    ]
    return companies[Math.floor(Math.random() * companies.length)]
  }

  private generateComparables(
    price: number,
    sqft: number,
  ): Array<{ address: string; price: number; sqft: number; pricePerSqFt: number; soldDate: string }> {
    const comparables = []
    for (let i = 0; i < 3; i++) {
      const compPrice = price + (Math.random() * 60000 - 30000) // +/- 30k variance
      const compSqft = sqft + (Math.random() * 400 - 200) // +/- 200 sqft variance
      const soldDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Last 90 days

      comparables.push({
        address: `${Math.floor(Math.random() * 9999) + 100} Comparable St`,
        price: Math.floor(compPrice),
        sqft: Math.floor(compSqft),
        pricePerSqFt: Math.floor(compPrice / compSqft),
        soldDate: soldDate.toISOString().split("T")[0],
      })
    }
    return comparables
  }

  private generateSchools(): Array<{ name: string; rating: number; type: string }> {
    const schoolTypes = ["Elementary", "Middle", "High"]
    const schools = []

    for (const type of schoolTypes) {
      schools.push({
        name: `${["Lincoln", "Washington", "Roosevelt", "Jefferson"][Math.floor(Math.random() * 4)]} ${type}`,
        rating: Math.floor(Math.random() * 4) + 7, // 7-10 rating
        type,
      })
    }

    return schools
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  async getMSAInfo(msa: string, state: string): Promise<MSAInfo> {
    // Generate realistic MSA information
    const population = Math.floor(Math.random() * 2000000) + 500000 // 500k - 2.5M
    const medianIncome = Math.floor(Math.random() * 40000) + 50000 // $50k - $90k
    const averageHomePrice = Math.floor(Math.random() * 300000) + 250000 // $250k - $550k

    return {
      name: `${msa}, ${state}`,
      population,
      medianIncome,
      averageHomePrice,
      unemploymentRate: Math.round((Math.random() * 5 + 2) * 100) / 100, // 2-7%
      populationGrowth: Math.round((Math.random() * 4 + 1) * 100) / 100, // 1-5%
    }
  }
}

// Export instance
export const propertySearchAgent = new PropertySearchAgent()
