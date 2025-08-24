interface RentCastProperty {
  id: string
  address: string
  rent: number
  bedrooms: number
  bathrooms: number
  squareFootage: number
  propertyType: string
  listDate: string
  latitude: number
  longitude: number
}

interface LoopNetProperty {
  id: string
  address: string
  price: number
  propertyType: string
  squareFootage: number
  listingDate: string
  latitude: number
  longitude: number
}

interface ZillowProperty {
  zpid: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  livingArea: number
  propertyType: string
  datePostedString: string
  latitude: number
  longitude: number
}

// Demo data for RentCast properties
const demoRentCastProperties: RentCastProperty[] = [
  {
    id: "rc_001",
    address: "123 Main St, Atlanta, GA 30309",
    rent: 2500,
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1200,
    propertyType: "Apartment",
    listDate: "2024-01-15",
    latitude: 33.749,
    longitude: -84.388,
  },
  {
    id: "rc_002",
    address: "456 Oak Ave, Atlanta, GA 30305",
    rent: 3200,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFootage: 1800,
    propertyType: "Townhouse",
    listDate: "2024-01-10",
    latitude: 33.8034,
    longitude: -84.3963,
  },
]

// Demo data for LoopNet properties
const demoLoopNetProperties: LoopNetProperty[] = [
  {
    id: "ln_001",
    address: "789 Business Blvd, Atlanta, GA 30309",
    price: 450000,
    propertyType: "Office",
    squareFootage: 5000,
    listingDate: "2024-01-12",
    latitude: 33.7701,
    longitude: -84.3876,
  },
  {
    id: "ln_002",
    address: "321 Commerce St, Atlanta, GA 30313",
    price: 850000,
    propertyType: "Retail",
    squareFootage: 8500,
    listingDate: "2024-01-08",
    latitude: 33.7537,
    longitude: -84.3901,
  },
]

// Demo data for Zillow properties
const demoZillowProperties: ZillowProperty[] = [
  {
    zpid: "zl_001",
    address: "567 Pine St, Atlanta, GA 30309",
    price: 425000,
    bedrooms: 3,
    bathrooms: 2,
    livingArea: 1600,
    propertyType: "SingleFamily",
    datePostedString: "2024-01-14",
    latitude: 33.7701,
    longitude: -84.387,
  },
  {
    zpid: "zl_002",
    address: "890 Elm Dr, Atlanta, GA 30305",
    price: 675000,
    bedrooms: 4,
    bathrooms: 3,
    livingArea: 2400,
    propertyType: "SingleFamily",
    datePostedString: "2024-01-09",
    latitude: 33.815,
    longitude: -84.37,
  },
]

export async function searchRentCastProperties(limit = 20): Promise<RentCastProperty[]> {
  const apiKey = process.env.RENTCAST_API_KEY

  if (!apiKey) {
    console.log("RentCast API key not found, using demo data")
    return demoRentCastProperties.slice(0, Math.min(limit, demoRentCastProperties.length))
  }

  try {
    const response = await fetch(`https://api.rentcast.io/v1/listings/rental?city=Atlanta&state=GA&limit=${limit}`, {
      headers: {
        "X-Api-Key": apiKey,
      },
    })

    if (!response.ok) {
      console.log("RentCast API request failed, using demo data")
      return demoRentCastProperties.slice(0, Math.min(limit, demoRentCastProperties.length))
    }

    const data = await response.json()
    return data.listings || []
  } catch (error) {
    console.error("Error fetching RentCast properties:", error)
    return demoRentCastProperties.slice(0, Math.min(limit, demoRentCastProperties.length))
  }
}

export async function searchLoopNetProperties(limit = 20): Promise<LoopNetProperty[]> {
  const apiKey = process.env.LOOPNET_API_KEY

  if (!apiKey) {
    console.log("LoopNet API key not found, using demo data")
    return demoLoopNetProperties.slice(0, Math.min(limit, demoLoopNetProperties.length))
  }

  try {
    const response = await fetch(`https://api.loopnet.com/properties?city=Atlanta&state=GA&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      console.log("LoopNet API request failed, using demo data")
      return demoLoopNetProperties.slice(0, Math.min(limit, demoLoopNetProperties.length))
    }

    const data = await response.json()
    return data.properties || []
  } catch (error) {
    console.error("Error fetching LoopNet properties:", error)
    return demoLoopNetProperties.slice(0, Math.min(limit, demoLoopNetProperties.length))
  }
}

export async function searchZillowProperties(limit = 20): Promise<ZillowProperty[]> {
  const apiKey = process.env.RAPIDAPI_KEY

  if (!apiKey) {
    console.log("Zillow API key not found, using demo data")
    return demoZillowProperties.slice(0, Math.min(limit, demoZillowProperties.length))
  }

  try {
    const response = await fetch(`https://zillow56.p.rapidapi.com/search?location=Atlanta%2C%20GA`, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "zillow56.p.rapidapi.com",
      },
    })

    if (!response.ok) {
      console.log("Zillow API request failed, using demo data")
      return demoZillowProperties.slice(0, Math.min(limit, demoZillowProperties.length))
    }

    const data = await response.json()
    const properties = data.results || []
    return properties.slice(0, limit)
  } catch (error) {
    console.error("Error fetching Zillow properties:", error)
    return demoZillowProperties.slice(0, Math.min(limit, demoZillowProperties.length))
  }
}
