import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface PropertySearchFilters {
  location: string
  minPrice?: number
  maxPrice?: number
  propertyType?: string
  bedrooms?: number
  bathrooms?: number
  minSquareFeet?: number
  maxSquareFeet?: number
}

interface Property {
  id: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet: number
  propertyType: string
  yearBuilt: number
  lotSize: number
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
  }
  investmentMetrics: {
    estimatedRent: number
    capRate: number
    cashFlow: number
    roi: number
  }
}

class PropertySearchAgent {
  private async generatePropertiesWithAI(filters: PropertySearchFilters): Promise<Property[]> {
    try {
      const prompt = `Generate 25 realistic property listings for ${filters.location} with the following criteria:
      - Price range: $${filters.minPrice || 0} - $${filters.maxPrice || 2000000}
      - Property type: ${filters.propertyType || "any"}
      - Bedrooms: ${filters.bedrooms || "any"}
      - Bathrooms: ${filters.bathrooms || "any"}
      - Square feet: ${filters.minSquareFeet || 0} - ${filters.maxSquareFeet || 10000}

      For each property, provide:
      1. Realistic address in the specified location
      2. Market-appropriate pricing
      3. Detailed property features
      4. Investment metrics (estimated rent, cap rate, cash flow, ROI)
      5. Property description and amenities

      Format as JSON array with properties matching the Property interface structure.
      Make sure all properties strictly match the specified filters.
      Include realistic market data, price history, and investment calculations.`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.7,
      })

      // Parse the AI response
      const aiProperties = JSON.parse(text)

      // Validate and ensure all properties match filters
      return aiProperties
        .filter((property: Property) => {
          return this.validatePropertyAgainstFilters(property, filters)
        })
        .slice(0, 25)
    } catch (error) {
      console.error("AI property generation failed:", error)
      return this.generateFallbackProperties(filters)
    }
  }

  private validatePropertyAgainstFilters(property: Property, filters: PropertySearchFilters): boolean {
    if (filters.minPrice && property.price < filters.minPrice) return false
    if (filters.maxPrice && property.price > filters.maxPrice) return false
    if (filters.bedrooms && property.bedrooms !== filters.bedrooms) return false
    if (filters.bathrooms && property.bathrooms !== filters.bathrooms) return false
    if (filters.minSquareFeet && property.squareFeet < filters.minSquareFeet) return false
    if (filters.maxSquareFeet && property.squareFeet > filters.maxSquareFeet) return false
    if (filters.propertyType && property.propertyType.toLowerCase() !== filters.propertyType.toLowerCase()) return false

    return true
  }

  private generateFallbackProperties(filters: PropertySearchFilters): Property[] {
    const properties: Property[] = []
    const propertyTypes = ["Single Family", "Condo", "Townhouse", "Multi-Family"]
    const streetNames = ["Main St", "Oak Ave", "Pine Rd", "Maple Dr", "Cedar Ln", "Elm St", "Park Ave", "First St"]

    for (let i = 1; i <= 25; i++) {
      const bedrooms = filters.bedrooms || Math.floor(Math.random() * 4) + 2
      const bathrooms = filters.bathrooms || Math.floor(Math.random() * 3) + 1
      const squareFeet = filters.minSquareFeet || 800 + Math.floor(Math.random() * 2200)
      const propertyType = filters.propertyType || propertyTypes[Math.floor(Math.random() * propertyTypes.length)]

      // Generate price within range
      const minPrice = filters.minPrice || 150000
      const maxPrice = filters.maxPrice || 800000
      const price = Math.floor(Math.random() * (maxPrice - minPrice)) + minPrice

      const pricePerSqFt = Math.floor(price / squareFeet)
      const estimatedRent = Math.floor(price * 0.008) // 0.8% rule
      const capRate = ((estimatedRent * 12) / price) * 100
      const monthlyExpenses = Math.floor(estimatedRent * 0.3)
      const cashFlow = estimatedRent - monthlyExpenses
      const roi = ((cashFlow * 12) / (price * 0.2)) * 100 // Assuming 20% down

      const property: Property = {
        id: `prop_${i.toString().padStart(3, "0")}`,
        address: `${100 + i * 10} ${streetNames[i % streetNames.length]}`,
        city: filters.location.split(",")[0] || "Unknown City",
        state: filters.location.split(",")[1]?.trim() || "Unknown State",
        zipCode: `${10000 + Math.floor(Math.random() * 89999)}`,
        price,
        bedrooms,
        bathrooms,
        squareFeet,
        propertyType,
        yearBuilt: 1980 + Math.floor(Math.random() * 44),
        lotSize: 5000 + Math.floor(Math.random() * 10000),
        description: `Beautiful ${bedrooms} bedroom, ${bathrooms} bathroom ${propertyType.toLowerCase()} in ${filters.location}. This property features modern amenities and is perfect for investment or primary residence.`,
        features: ["Updated Kitchen", "Hardwood Floors", "Central Air", "Garage", "Fenced Yard", "New Roof"].slice(
          0,
          3 + Math.floor(Math.random() * 3),
        ),
        images: [
          "/modern-house-exterior.png",
          "/cozy-living-room.png",
          "/modern-kitchen-interior.png",
          "/cozy-bedroom.png",
          "/modern-bathroom-interior.png",
          "/cozy-backyard.png",
        ],
        listingAgent: {
          name: `Agent ${i}`,
          phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          email: `agent${i}@realty.com`,
        },
        marketData: {
          pricePerSqFt,
          daysOnMarket: Math.floor(Math.random() * 120) + 1,
          priceHistory: [
            {
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              price: price + Math.floor(Math.random() * 20000) - 10000,
              event: "Listed",
            },
          ],
        },
        investmentMetrics: {
          estimatedRent,
          capRate: Math.round(capRate * 100) / 100,
          cashFlow,
          roi: Math.round(roi * 100) / 100,
        },
      }

      properties.push(property)
    }

    return properties
  }

  async searchProperties(filters: PropertySearchFilters): Promise<Property[]> {
    try {
      console.log("Searching properties with filters:", filters)

      // Try AI generation first
      const aiProperties = await this.generatePropertiesWithAI(filters)

      if (aiProperties.length > 0) {
        console.log(`Generated ${aiProperties.length} properties with AI`)
        return aiProperties
      }

      // Fallback to generated properties
      console.log("Using fallback property generation")
      return this.generateFallbackProperties(filters)
    } catch (error) {
      console.error("Property search failed:", error)
      return this.generateFallbackProperties(filters)
    }
  }
}

// Create and export instance
const propertySearchAgent = new PropertySearchAgent()

export { PropertySearchAgent, propertySearchAgent }
export type { Property, PropertySearchFilters }
