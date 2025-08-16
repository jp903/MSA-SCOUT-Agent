import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export interface PropertySearchFilters {
  location: string
  minPrice?: number
  maxPrice?: number
  propertyType?: string
  bedrooms?: number
  bathrooms?: number
  minSquareFeet?: number
  maxSquareFeet?: number
  yearBuilt?: number
  lotSize?: number
  features?: string[]
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
  }
  marketData: {
    pricePerSqFt: number
    daysOnMarket: number
    priceHistory: Array<{
      date: string
      price: number
      event: string
    }>
    comparables: Array<{
      address: string
      price: number
      squareFeet: number
      pricePerSqFt: number
      soldDate: string
    }>
  }
  investmentMetrics: {
    estimatedRent: number
    capRate: number
    cashFlow: number
    roi: number
  }
  neighborhood: {
    walkScore: number
    crimeRate: string
    schools: Array<{
      name: string
      rating: number
      type: string
    }>
    amenities: string[]
  }
}

export class PropertySearchAgent {
  private model = openai("gpt-4o")

  async searchProperties(filters: PropertySearchFilters): Promise<Property[]> {
    try {
      console.log("🔍 Starting property search with filters:", filters)

      const prompt = this.buildSearchPrompt(filters)
      console.log("📝 Generated search prompt")

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.7,
        maxTokens: 8000,
      })

      console.log("🤖 AI response received, parsing properties...")

      const properties = this.parsePropertiesFromText(text, filters)
      console.log(`✅ Successfully generated ${properties.length} properties`)

      return properties
    } catch (error) {
      console.error("❌ Error in AI property search:", error)
      console.log("🔄 Falling back to generated properties...")
      return this.generateFallbackProperties(filters)
    }
  }

  private buildSearchPrompt(filters: PropertySearchFilters): string {
    const location = filters.location || "Austin, TX"
    const priceRange =
      filters.minPrice && filters.maxPrice
        ? `between $${filters.minPrice.toLocaleString()} and $${filters.maxPrice.toLocaleString()}`
        : filters.minPrice
          ? `starting from $${filters.minPrice.toLocaleString()}`
          : filters.maxPrice
            ? `up to $${filters.maxPrice.toLocaleString()}`
            : "in various price ranges"

    return `Generate 25 realistic property listings for ${location} ${priceRange}.

REQUIREMENTS:
- All properties must be in or near ${location}
- Price range: ${priceRange}
- Property type: ${filters.propertyType || "any type"}
- Bedrooms: ${filters.bedrooms ? `${filters.bedrooms}+` : "any"}
- Bathrooms: ${filters.bathrooms ? `${filters.bathrooms}+` : "any"}
- Square feet: ${filters.minSquareFeet ? `${filters.minSquareFeet}+` : "any size"}

For each property, provide:
1. Realistic address in ${location}
2. Market-appropriate pricing for the area
3. Detailed property specifications
4. Investment metrics (estimated rent, cap rate, cash flow, ROI)
5. Neighborhood information
6. Comparable sales data
7. Property features and amenities

Format as JSON array with this structure:
[
  {
    "id": "unique-id",
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701",
    "price": 450000,
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFeet": 1800,
    "lotSize": 0.25,
    "yearBuilt": 2015,
    "propertyType": "Single Family",
    "description": "Beautiful home with...",
    "features": ["Hardwood floors", "Updated kitchen"],
    "images": ["/modern-house-exterior.png", "/cozy-living-room.png"],
    "listingAgent": {
      "name": "John Smith",
      "phone": "(512) 555-0123",
      "email": "john@realty.com"
    },
    "marketData": {
      "pricePerSqFt": 250,
      "daysOnMarket": 15,
      "priceHistory": [
        {"date": "2024-01-15", "price": 450000, "event": "Listed"}
      ],
      "comparables": [
        {
          "address": "456 Oak St",
          "price": 440000,
          "squareFeet": 1750,
          "pricePerSqFt": 251,
          "soldDate": "2024-01-10"
        }
      ]
    },
    "investmentMetrics": {
      "estimatedRent": 2800,
      "capRate": 7.5,
      "cashFlow": 450,
      "roi": 12.3
    },
    "neighborhood": {
      "walkScore": 85,
      "crimeRate": "Low",
      "schools": [
        {"name": "Austin Elementary", "rating": 9, "type": "Elementary"}
      ],
      "amenities": ["Parks", "Shopping", "Restaurants"]
    }
  }
]

Make all data realistic for ${location} market conditions. Ensure investment metrics are calculated properly and make sense for the property price and estimated rent.`
  }

  private parsePropertiesFromText(text: string, filters: PropertySearchFilters): Property[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const properties = JSON.parse(jsonMatch[0])
        if (Array.isArray(properties) && properties.length > 0) {
          return properties.map((prop, index) => ({
            ...prop,
            id: prop.id || `ai-prop-${Date.now()}-${index}`,
            images: prop.images || [
              "/modern-house-exterior.png",
              "/cozy-living-room.png",
              "/modern-kitchen-interior.png",
            ],
          }))
        }
      }

      // If JSON parsing fails, generate fallback
      console.log("⚠️ Could not parse AI response as JSON, using fallback")
      return this.generateFallbackProperties(filters)
    } catch (error) {
      console.error("❌ Error parsing AI response:", error)
      return this.generateFallbackProperties(filters)
    }
  }

  private generateFallbackProperties(filters: PropertySearchFilters): Property[] {
    const location = filters.location || "Austin, TX"
    const [city, state] = location.split(", ")

    const properties: Property[] = []
    const propertyTypes = ["Single Family", "Townhouse", "Condo", "Duplex"]
    const streetNames = ["Main St", "Oak Ave", "Pine Dr", "Elm St", "Cedar Ln", "Maple Way", "Park Blvd", "Hill Rd"]
    const features = [
      "Hardwood floors",
      "Updated kitchen",
      "Granite countertops",
      "Stainless appliances",
      "Master suite",
      "Walk-in closets",
      "Fireplace",
      "Patio",
      "Garage",
      "Central AC",
      "New roof",
      "Fresh paint",
      "Landscaped yard",
      "Storage space",
    ]

    for (let i = 0; i < 25; i++) {
      const basePrice = filters.minPrice || 300000
      const maxPrice = filters.maxPrice || 800000
      const price = Math.floor(Math.random() * (maxPrice - basePrice) + basePrice)

      const bedrooms = filters.bedrooms || Math.floor(Math.random() * 4) + 2
      const bathrooms = filters.bathrooms || Math.floor(Math.random() * 3) + 1
      const squareFeet = filters.minSquareFeet || Math.floor(Math.random() * 2000) + 1200
      const yearBuilt = filters.yearBuilt || Math.floor(Math.random() * 30) + 1995

      const estimatedRent = Math.floor(price * 0.006) // 0.6% of price as monthly rent
      const capRate = ((estimatedRent * 12) / price) * 100
      const monthlyPayment = Math.floor(price * 0.004) // Rough mortgage payment
      const cashFlow = estimatedRent - monthlyPayment - 500 // Minus expenses
      const roi = ((cashFlow * 12) / (price * 0.2)) * 100 // 20% down payment assumption

      const property: Property = {
        id: `prop-${Date.now()}-${i}`,
        address: `${Math.floor(Math.random() * 9999) + 100} ${streetNames[i % streetNames.length]}`,
        city: city || "Austin",
        state: state || "TX",
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        price,
        bedrooms,
        bathrooms,
        squareFeet,
        lotSize: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100,
        yearBuilt,
        propertyType: filters.propertyType || propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
        description: `Beautiful ${bedrooms} bedroom, ${bathrooms} bathroom home in ${city}. This well-maintained property features modern amenities and is perfect for investors or homeowners.`,
        features: features.slice(0, Math.floor(Math.random() * 6) + 4),
        images: [
          "/modern-house-exterior.png",
          "/cozy-living-room.png",
          "/modern-kitchen-interior.png",
          "/cozy-bedroom.png",
          "/modern-bathroom-interior.png",
        ],
        listingAgent: {
          name: `Agent ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}. Smith`,
          phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          email: `agent${i}@realty.com`,
        },
        marketData: {
          pricePerSqFt: Math.floor(price / squareFeet),
          daysOnMarket: Math.floor(Math.random() * 60) + 1,
          priceHistory: [
            {
              date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              price,
              event: "Listed",
            },
          ],
          comparables: [
            {
              address: `${Math.floor(Math.random() * 9999) + 100} ${streetNames[Math.floor(Math.random() * streetNames.length)]}`,
              price: price + Math.floor(Math.random() * 40000) - 20000,
              squareFeet: squareFeet + Math.floor(Math.random() * 400) - 200,
              pricePerSqFt: Math.floor(
                (price + Math.floor(Math.random() * 40000) - 20000) /
                  (squareFeet + Math.floor(Math.random() * 400) - 200),
              ),
              soldDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            },
          ],
        },
        investmentMetrics: {
          estimatedRent,
          capRate: Math.round(capRate * 100) / 100,
          cashFlow,
          roi: Math.round(roi * 100) / 100,
        },
        neighborhood: {
          walkScore: Math.floor(Math.random() * 40) + 60,
          crimeRate: ["Low", "Medium", "Low", "Low"][Math.floor(Math.random() * 4)],
          schools: [
            {
              name: `${city} Elementary`,
              rating: Math.floor(Math.random() * 4) + 7,
              type: "Elementary",
            },
          ],
          amenities: ["Parks", "Shopping", "Restaurants", "Schools", "Public Transit"].slice(
            0,
            Math.floor(Math.random() * 3) + 3,
          ),
        },
      }

      properties.push(property)
    }

    return properties
  }
}

// Create and export instance
export const propertySearchAgent = new PropertySearchAgent()
