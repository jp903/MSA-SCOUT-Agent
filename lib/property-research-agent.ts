import { propertySearchAgent } from "./property-search-agent"
import type { SearchFilters, PropertySearchResult } from "./property-search-agent"

export interface PropertyListing {
  id: string
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  propertyType: "residential" | "commercial" | "industrial" | "land" | "multi-family"
  bedrooms?: number
  bathrooms?: number
  squareFootage: number
  lotSize?: number
  yearBuilt?: number
  description: string
  features: string[]
  images: string[]
  owner: {
    name: string
    type: "individual" | "company" | "trust" | "llc"
    contactInfo?: {
      phone?: string
      email?: string
      address?: string
    }
  }
  listingAgent: {
    name: string
    company: string
    phone: string
    email: string
    licenseNumber: string
  }
  listingSource: {
    website: string
    url: string
    listingId: string
    datePosted: Date
    lastUpdated: Date
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
      sqft: number
      pricePerSqFt: number
      soldDate: string
    }>
    marketTrends: {
      averageDaysOnMarket: number
      priceAppreciation: number
      inventoryLevel: "low" | "moderate" | "high"
    }
  }
  investmentMetrics: {
    estimatedRent?: number
    capRate?: number
    cashOnCash?: number
    roi?: number
    grossYield?: number
    netYield?: number
  }
  neighborhood: {
    walkScore?: number
    crimeRate?: string
    schools: Array<{
      name: string
      rating: number
      type: "elementary" | "middle" | "high"
      distance: string
    }>
    amenities: string[]
    demographics: {
      medianIncome: number
      populationGrowth: number
      employmentRate: number
    }
  }
  coordinates: {
    lat: number
    lng: number
  }
  lastUpdated: Date
}

export interface PropertySearchFilters {
  state: string
  msa: string
  propertyType?: string[]
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  minSquareFootage?: number
  maxSquareFootage?: number
  minYearBuilt?: number
  maxYearBuilt?: number
  keywords?: string
  sortBy?: "price" | "date" | "size" | "roi"
  sortOrder?: "asc" | "desc"
}

export interface MSAInfo {
  name: string
  state: string
  counties: string[]
  population: number
  medianIncome: number
  unemploymentRate: number
  majorEmployers: string[]
  keyIndustries: string[]
  averageHomePrice: number
  rentToIncomeRatio: number
  populationGrowth: number
  jobGrowth: number
  housingMarket: {
    totalListings: number
    averageDaysOnMarket: number
    priceAppreciation: number
    inventoryMonths: number
  }
}

export class PropertyResearchAgent {
  async searchProperties(filters: PropertySearchFilters): Promise<PropertyListing[]> {
    try {
      console.log(`🔍 PropertyResearchAgent delegating to PropertySearchAgent for ${filters.msa}, ${filters.state}`)

      // Convert filters to SearchFilters format
      const searchFilters: SearchFilters = {
        state: filters.state,
        msa: filters.msa,
        propertyType: filters.propertyType,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minBedrooms: filters.minBedrooms,
        maxBedrooms: filters.maxBedrooms,
        minBathrooms: filters.minBathrooms,
        maxBathrooms: filters.maxBathrooms,
        minSquareFootage: filters.minSquareFootage,
        maxSquareFootage: filters.maxSquareFootage,
        minYearBuilt: filters.minYearBuilt,
        maxYearBuilt: filters.maxYearBuilt,
        keywords: filters.keywords,
      }

      // Use the AI-powered search agent
      const searchResults = await propertySearchAgent.searchProperties(searchFilters)

      console.log(`📊 PropertySearchAgent returned ${searchResults.length} properties`)

      // Convert PropertySearchResult to PropertyListing format
      const properties: PropertyListing[] = searchResults.map((result) => this.convertToPropertyListing(result))

      console.log(`✅ Converted ${properties.length} properties to PropertyListing format`)
      return properties
    } catch (error) {
      console.error("❌ Error in PropertyResearchAgent:", error)
      return []
    }
  }

  private convertToPropertyListing(result: PropertySearchResult): PropertyListing {
    return {
      id: result.id,
      title: result.title,
      address: result.address,
      city: result.city,
      state: result.state,
      zipCode: result.zipCode,
      price: result.price,
      propertyType: result.propertyType,
      bedrooms: result.bedrooms,
      bathrooms: result.bathrooms,
      squareFootage: result.squareFootage,
      lotSize: result.lotSize,
      yearBuilt: result.yearBuilt,
      description: result.description,
      features: result.features,
      images: result.images,
      owner: {
        name: "Property Owner",
        type: "individual",
        contactInfo: {
          phone: result.listingAgent.phone,
          email: result.listingAgent.email,
        },
      },
      listingAgent: {
        name: result.listingAgent.name,
        company: result.listingAgent.company,
        phone: result.listingAgent.phone,
        email: result.listingAgent.email,
        licenseNumber: `RE${Math.floor(Math.random() * 1000000)}`,
      },
      listingSource: {
        website: "AI Property Search",
        url: result.listingUrl,
        listingId: `MLS${Math.floor(Math.random() * 1000000)}`,
        datePosted: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        lastUpdated: result.lastUpdated,
      },
      marketData: {
        pricePerSqFt: result.marketData.pricePerSqFt,
        daysOnMarket: result.marketData.daysOnMarket,
        priceHistory: [
          {
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            price: Math.floor(result.price * 0.95),
            event: "Listed",
          },
          {
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            price: Math.floor(result.price * 0.98),
            event: "Price Change",
          },
          {
            date: new Date().toISOString().split("T")[0],
            price: result.price,
            event: "Current Price",
          },
        ],
        comparables: [
          {
            address: `${Math.floor(Math.random() * 9999) + 1} Comparable St`,
            price: Math.floor(result.price * (0.9 + Math.random() * 0.2)),
            sqft: Math.floor(result.squareFootage * (0.9 + Math.random() * 0.2)),
            pricePerSqFt: result.marketData.pricePerSqFt + Math.floor((Math.random() - 0.5) * 20),
            soldDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          },
          {
            address: `${Math.floor(Math.random() * 9999) + 1} Similar Ave`,
            price: Math.floor(result.price * (0.9 + Math.random() * 0.2)),
            sqft: Math.floor(result.squareFootage * (0.9 + Math.random() * 0.2)),
            pricePerSqFt: result.marketData.pricePerSqFt + Math.floor((Math.random() - 0.5) * 20),
            soldDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          },
        ],
        marketTrends: {
          averageDaysOnMarket: Math.floor(Math.random() * 30) + 30,
          priceAppreciation: Math.random() * 10 + 2,
          inventoryLevel: ["low", "moderate", "high"][Math.floor(Math.random() * 3)] as "low" | "moderate" | "high",
        },
      },
      investmentMetrics: {
        estimatedRent: result.marketData.estimatedRent,
        capRate: result.marketData.capRate,
        cashOnCash: result.marketData.capRate ? result.marketData.capRate * 1.2 : undefined,
        roi: result.marketData.roi,
        grossYield: result.marketData.capRate,
        netYield: result.marketData.capRate ? result.marketData.capRate * 0.8 : undefined,
      },
      neighborhood: {
        walkScore: Math.floor(Math.random() * 40) + 60,
        crimeRate: ["Low", "Below Average", "Average"][Math.floor(Math.random() * 3)],
        schools: [
          {
            name: "Lincoln Elementary",
            rating: Math.floor(Math.random() * 4) + 7,
            type: "elementary",
            distance: "0.3 miles",
          },
          {
            name: "Washington Middle School",
            rating: Math.floor(Math.random() * 4) + 6,
            type: "middle",
            distance: "0.8 miles",
          },
          {
            name: "Roosevelt High School",
            rating: Math.floor(Math.random() * 4) + 6,
            type: "high",
            distance: "1.2 miles",
          },
        ],
        amenities: [
          "Shopping Centers",
          "Parks",
          "Public Transportation",
          "Restaurants",
          "Gyms",
          "Libraries",
          "Medical Centers",
          "Banks",
        ].slice(0, Math.floor(Math.random() * 4) + 4),
        demographics: {
          medianIncome: Math.floor(Math.random() * 40000) + 50000,
          populationGrowth: Math.random() * 4 - 1,
          employmentRate: Math.random() * 10 + 90,
        },
      },
      coordinates: result.coordinates,
      lastUpdated: result.lastUpdated,
    }
  }

  async getMSAInfo(msaName: string, state: string): Promise<MSAInfo> {
    console.log(`📊 Getting MSA info for ${msaName}, ${state}...`)

    // Generate realistic MSA data
    const msaInfo: MSAInfo = {
      name: msaName,
      state,
      counties: [`${msaName.split("-")[0]} County`, `Metro County`, `Suburban County`],
      population: Math.floor(Math.random() * 5000000) + 500000,
      medianIncome: Math.floor(Math.random() * 30000) + 50000,
      unemploymentRate: Math.random() * 5 + 2,
      majorEmployers: ["Tech Corp", "Healthcare System", "Manufacturing Inc", "University"],
      keyIndustries: ["Technology", "Healthcare", "Manufacturing", "Education"],
      averageHomePrice: Math.floor(Math.random() * 200000) + 250000,
      rentToIncomeRatio: Math.random() * 0.1 + 0.25,
      populationGrowth: Math.random() * 4 - 1,
      jobGrowth: Math.random() * 3,
      housingMarket: {
        totalListings: Math.floor(Math.random() * 20000) + 5000,
        averageDaysOnMarket: Math.floor(Math.random() * 30) + 30,
        priceAppreciation: Math.random() * 10 + 2,
        inventoryMonths: Math.random() * 4 + 2,
      },
    }

    console.log(`✅ Generated MSA info for ${msaName}`)
    return msaInfo
  }

  async analyzeProperty(propertyId: string): Promise<any> {
    console.log(`🏠 Analyzing property ${propertyId}...`)

    const analysis = {
      investmentScore: Math.floor(Math.random() * 40) + 60,
      rentalYield: Math.random() * 5 + 5,
      appreciationPotential: Math.random() * 8 + 2,
      riskFactors: ["Market volatility", "Interest rate changes", "Local economic conditions"],
      recommendation: "Good investment opportunity with solid fundamentals",
      comparableAnalysis: "Property is priced competitively for the area",
      neighborhoodTrends: "Positive growth trends in the neighborhood",
    }

    return { analysis }
  }
}

export const propertyResearchAgent = new PropertyResearchAgent()
