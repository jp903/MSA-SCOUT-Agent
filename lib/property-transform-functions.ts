interface StandardProperty {
  id: string
  address: string
  price: number
  bedrooms?: number
  bathrooms?: number
  squareFootage: number
  propertyType: string
  listDate: string
  latitude: number
  longitude: number
  source: string
  images?: string[]
  description?: string
}

export function transformRentCastProperties(properties: any[]): StandardProperty[] {
  return properties.map((property) => ({
    id: property.id || `rc_${Math.random().toString(36).substr(2, 9)}`,
    address: property.address || "Address not available",
    price: property.rent || 0,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareFootage: property.squareFootage || 0,
    propertyType: property.propertyType || "Unknown",
    listDate: property.listDate || new Date().toISOString().split("T")[0],
    latitude: property.latitude || 33.749,
    longitude: property.longitude || -84.388,
    source: "RentCast",
    images: property.images || [],
    description: property.description || "No description available",
  }))
}

export function transformLoopNetProperties(properties: any[]): StandardProperty[] {
  return properties.map((property) => ({
    id: property.id || `ln_${Math.random().toString(36).substr(2, 9)}`,
    address: property.address || "Address not available",
    price: property.price || 0,
    squareFootage: property.squareFootage || 0,
    propertyType: property.propertyType || "Unknown",
    listDate: property.listingDate || new Date().toISOString().split("T")[0],
    latitude: property.latitude || 33.749,
    longitude: property.longitude || -84.388,
    source: "LoopNet",
    images: property.images || [],
    description: property.description || "No description available",
  }))
}

export function transformZillowProperties(properties: any[]): StandardProperty[] {
  return properties.map((property) => ({
    id: property.zpid || `zl_${Math.random().toString(36).substr(2, 9)}`,
    address: property.address || "Address not available",
    price: property.price || 0,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareFootage: property.livingArea || 0,
    propertyType: property.propertyType || "Unknown",
    listDate: property.datePostedString || new Date().toISOString().split("T")[0],
    latitude: property.latitude || 33.749,
    longitude: property.longitude || -84.388,
    source: "Zillow",
    images: property.images || [],
    description: property.description || "No description available",
  }))
}
