import { searchRentCastProperties, searchLoopNetProperties, searchZillowProperties } from "./property-search-functions"
import {
  transformRentCastProperties,
  transformLoopNetProperties,
  transformZillowProperties,
} from "./property-transform-functions"

async function fetchProperties() {
  const rentCastLimit = Math.floor(Math.random() * 21) + 20
  const loopNetLimit = Math.floor(Math.random() * 21) + 20
  const zillowLimit = Math.floor(Math.random() * 21) + 20

  const rentCastProperties = await searchRentCastProperties(rentCastLimit)
  const loopNetProperties = await searchLoopNetProperties(loopNetLimit)
  const zillowProperties = await searchZillowProperties(zillowLimit)

  const transformedRentCastProperties = transformRentCastProperties(rentCastProperties)
  const transformedLoopNetProperties = transformLoopNetProperties(loopNetProperties)
  const transformedZillowProperties = transformZillowProperties(zillowProperties)

  return {
    rentCastProperties: transformedRentCastProperties,
    loopNetProperties: transformedLoopNetProperties,
    zillowProperties: transformedZillowProperties,
  }
}

export class PropertySearchAgent {
  async searchProperties(criteria?: any) {
    return await fetchProperties()
  }

  async getPropertyDetails(propertyId: string) {
    // Implementation for getting detailed property information
    return null
  }

  async analyzeMarket(location: string) {
    // Implementation for market analysis
    return null
  }
}

// Create instance for named export
export const propertySearchAgent = new PropertySearchAgent()

// Keep the default export as well
export default fetchProperties
