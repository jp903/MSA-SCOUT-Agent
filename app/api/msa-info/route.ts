import { type NextRequest, NextResponse } from "next/server"

const FRED_API_KEY = process.env.FRED_API_KEY
const FRED_BASE_URL = "https://api.stlouisfed.org/fred"

// MSA to FRED series mapping for major metropolitan areas
const MSA_FRED_SERIES: Record<
  string,
  {
    unemploymentSeries: string
    populationSeries?: string
    medianIncomeSeries?: string
    name: string
  }
> = {
  // Florida MSAs
  "Miami-Fort Lauderdale-West Palm Beach": {
    unemploymentSeries: "MIAM612URN",
    populationSeries: "MIAM612POP",
    name: "Miami-Fort Lauderdale-West Palm Beach, FL",
  },
  "Tampa-St. Petersburg-Clearwater": {
    unemploymentSeries: "TAMP612URN",
    populationSeries: "TAMP612POP",
    name: "Tampa-St. Petersburg-Clearwater, FL",
  },
  "Orlando-Kissimmee-Sanford": {
    unemploymentSeries: "ORLA612URN",
    populationSeries: "ORLA612POP",
    name: "Orlando-Kissimmee-Sanford, FL",
  },
  Jacksonville: {
    unemploymentSeries: "JACK612URN",
    populationSeries: "JACK612POP",
    name: "Jacksonville, FL",
  },

  // Texas MSAs
  "Austin-Round Rock": {
    unemploymentSeries: "AUST612URN",
    populationSeries: "AUST612POP",
    name: "Austin-Round Rock-Georgetown, TX",
  },
  "Dallas-Fort Worth-Arlington": {
    unemploymentSeries: "DALL612URN",
    populationSeries: "DALL612POP",
    name: "Dallas-Fort Worth-Arlington, TX",
  },
  "Houston-The Woodlands-Sugar Land": {
    unemploymentSeries: "HOUS612URN",
    populationSeries: "HOUS612POP",
    name: "Houston-The Woodlands-Sugar Land, TX",
  },
  "San Antonio-New Braunfels": {
    unemploymentSeries: "SANT612URN",
    populationSeries: "SANT612POP",
    name: "San Antonio-New Braunfels, TX",
  },

  // California MSAs
  "Los Angeles-Long Beach-Anaheim": {
    unemploymentSeries: "LOSA606URN",
    populationSeries: "LOSA606POP",
    name: "Los Angeles-Long Beach-Anaheim, CA",
  },
  "San Francisco-Oakland-Berkeley": {
    unemploymentSeries: "SANF606URN",
    populationSeries: "SANF606POP",
    name: "San Francisco-Oakland-Berkeley, CA",
  },
  "San Diego-Chula Vista-Carlsbad": {
    unemploymentSeries: "SAND606URN",
    populationSeries: "SAND606POP",
    name: "San Diego-Chula Vista-Carlsbad, CA",
  },

  // New York MSAs
  "New York-Newark-Jersey City": {
    unemploymentSeries: "NYIR636URN",
    populationSeries: "NYIR636POP",
    name: "New York-Newark-Jersey City, NY-NJ-PA",
  },

  // Illinois MSAs
  "Chicago-Naperville-Elgin": {
    unemploymentSeries: "CHIC917URN",
    populationSeries: "CHIC917POP",
    name: "Chicago-Naperville-Elgin, IL-IN-WI",
  },

  // Georgia MSAs
  "Atlanta-Sandy Springs-Alpharetta": {
    unemploymentSeries: "ATLA913URN",
    populationSeries: "ATLA913POP",
    name: "Atlanta-Sandy Springs-Alpharetta, GA",
  },

  // Arizona MSAs
  "Phoenix-Mesa-Chandler": {
    unemploymentSeries: "PHOE604URN",
    populationSeries: "PHOE604POP",
    name: "Phoenix-Mesa-Chandler, AZ",
  },

  // Washington MSAs
  "Seattle-Tacoma-Bellevue": {
    unemploymentSeries: "SEAT653URN",
    populationSeries: "SEAT653POP",
    name: "Seattle-Tacoma-Bellevue, WA",
  },

  // Colorado MSAs
  "Denver-Aurora-Lakewood": {
    unemploymentSeries: "DENV608URN",
    populationSeries: "DENV608POP",
    name: "Denver-Aurora-Lakewood, CO",
  },

  // Nevada MSAs
  "Las Vegas-Henderson-Paradise": {
    unemploymentSeries: "LASV632URN",
    populationSeries: "LASV632POP",
    name: "Las Vegas-Henderson-Paradise, NV",
  },

  // North Carolina MSAs
  "Charlotte-Concord-Gastonia": {
    unemploymentSeries: "CHAR637URN",
    populationSeries: "CHAR637POP",
    name: "Charlotte-Concord-Gastonia, NC-SC",
  },

  // Tennessee MSAs
  "Nashville-Davidson-Murfreesboro-Franklin": {
    unemploymentSeries: "NASH634URN",
    populationSeries: "NASH634POP",
    name: "Nashville-Davidson--Murfreesboro--Franklin, TN",
  },

  // Pennsylvania MSAs
  "Philadelphia-Camden-Wilmington": {
    unemploymentSeries: "PHIL642URN",
    populationSeries: "PHIL642POP",
    name: "Philadelphia-Camden-Wilmington, PA-NJ-DE-MD",
  },

  // Massachusetts MSAs
  "Boston-Cambridge-Newton": {
    unemploymentSeries: "BOST625URN",
    populationSeries: "BOST625POP",
    name: "Boston-Cambridge-Newton, MA-NH",
  },

  // Michigan MSAs
  "Detroit-Warren-Dearborn": {
    unemploymentSeries: "DETR626URN",
    populationSeries: "DETR626POP",
    name: "Detroit-Warren-Dearborn, MI",
  },

  // Minnesota MSAs
  "Minneapolis-St. Paul-Bloomington": {
    unemploymentSeries: "MINN627URN",
    populationSeries: "MINN627POP",
    name: "Minneapolis-St. Paul-Bloomington, MN-WI",
  },

  // Missouri MSAs
  "St. Louis": {
    unemploymentSeries: "STLO629URN",
    populationSeries: "STLO629POP",
    name: "St. Louis, MO-IL",
  },

  // Ohio MSAs
  Cincinnati: {
    unemploymentSeries: "CINC639URN",
    populationSeries: "CINC639POP",
    name: "Cincinnati, OH-KY-IN",
  },
  "Cleveland-Elyria": {
    unemploymentSeries: "CLEV617URN",
    populationSeries: "CLEV617POP",
    name: "Cleveland-Elyria, OH",
  },
  Columbus: {
    unemploymentSeries: "COLU618URN",
    populationSeries: "COLU618POP",
    name: "Columbus, OH",
  },

  // Oregon MSAs
  "Portland-Vancouver-Hillsboro": {
    unemploymentSeries: "PORT641URN",
    populationSeries: "PORT641POP",
    name: "Portland-Vancouver-Hillsboro, OR-WA",
  },

  // Utah MSAs
  "Salt Lake City": {
    unemploymentSeries: "SALT649URN",
    populationSeries: "SALT649POP",
    name: "Salt Lake City, UT",
  },

  // Virginia MSAs
  "Virginia Beach-Norfolk-Newport News": {
    unemploymentSeries: "VIRG651URN",
    populationSeries: "VIRG651POP",
    name: "Virginia Beach-Norfolk-Newport News, VA-NC",
  },

  // Wisconsin MSAs
  "Milwaukee-Waukesha": {
    unemploymentSeries: "MILW655URN",
    populationSeries: "MILW655POP",
    name: "Milwaukee-Waukesha, WI",
  },
}

interface MSAInfo {
  name: string
  population: number
  medianIncome: number
  averageHomePrice: number
  unemploymentRate: number
  populationGrowth: number
}

async function fetchFREDData(seriesId: string): Promise<number | null> {
  try {
    console.log(`🔍 Fetching FRED data for series: ${seriesId}`)

    const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`
    console.log(`📡 FRED API URL: ${url.replace(FRED_API_KEY!, "[API_KEY]")}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "PropertyInvestmentAgent/1.0",
      },
    })

    console.log(`📊 FRED API Response Status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ FRED API Error Response: ${errorText}`)
      return null
    }

    const data = await response.json()
    console.log(`📋 FRED API Response Data:`, JSON.stringify(data, null, 2))

    if (!data.observations || data.observations.length === 0) {
      console.warn(`⚠️ No observations found for FRED series ${seriesId}`)
      return null
    }

    const value = Number.parseFloat(data.observations[0].value)
    if (isNaN(value)) {
      console.warn(`⚠️ Invalid data value for FRED series ${seriesId}: ${data.observations[0].value}`)
      return null
    }

    console.log(`✅ Successfully fetched ${seriesId}: ${value}`)
    return value
  } catch (error) {
    console.error(`❌ Error fetching FRED data for ${seriesId}:`, error)
    return null
  }
}

async function fetchPopulationGrowth(populationSeries: string): Promise<number | null> {
  try {
    console.log(`📈 Calculating population growth for series: ${populationSeries}`)

    const url = `${FRED_BASE_URL}/series/observations?series_id=${populationSeries}&api_key=${FRED_API_KEY}&file_type=json&limit=2&sort_order=desc`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "PropertyInvestmentAgent/1.0",
      },
    })

    if (!response.ok) {
      console.warn(`⚠️ Failed to fetch population growth data for ${populationSeries}`)
      return null
    }

    const data = await response.json()

    if (!data.observations || data.observations.length < 2) {
      console.warn(`⚠️ Insufficient population data for growth calculation: ${populationSeries}`)
      return null
    }

    const currentPop = Number.parseFloat(data.observations[0].value)
    const previousPop = Number.parseFloat(data.observations[1].value)

    if (isNaN(currentPop) || isNaN(previousPop) || previousPop === 0) {
      console.warn(`⚠️ Invalid population data for growth calculation: ${populationSeries}`)
      return null
    }

    const growthRate = ((currentPop - previousPop) / previousPop) * 100
    const roundedGrowth = Math.round(growthRate * 10) / 10

    console.log(`📈 Population growth calculated: ${roundedGrowth}%`)
    return roundedGrowth
  } catch (error) {
    console.error(`❌ Error calculating population growth for ${populationSeries}:`, error)
    return null
  }
}

function findMSAMatch(searchMSA: string): (typeof MSA_FRED_SERIES)[keyof typeof MSA_FRED_SERIES] | null {
  // Direct match first
  if (MSA_FRED_SERIES[searchMSA]) {
    return MSA_FRED_SERIES[searchMSA]
  }

  // Partial match - find the MSA that contains the search term
  const searchLower = searchMSA.toLowerCase()
  for (const [key, value] of Object.entries(MSA_FRED_SERIES)) {
    const keyLower = key.toLowerCase()
    if (keyLower.includes(searchLower) || searchLower.includes(keyLower.split("-")[0])) {
      return value
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { msa, state } = body

    if (!msa || !state) {
      return NextResponse.json({ error: "MSA and state are required", success: false }, { status: 400 })
    }

    console.log(`🔍 Getting REAL FRED data for MSA: ${msa}, ${state}`)

    // Check if FRED API key is configured
    if (!FRED_API_KEY) {
      console.error("❌ FRED API key not configured")
      return NextResponse.json(
        {
          error: "FRED API key not configured",
          success: false,
          details: "Please configure FRED_API_KEY environment variable to access real economic data",
        },
        { status: 500 },
      )
    }

    console.log(`🔑 FRED API Key configured: ${FRED_API_KEY.substring(0, 8)}...`)

    // Find MSA in our FRED series mapping
    const msaSeries = findMSAMatch(msa)

    if (!msaSeries) {
      console.warn(`⚠️ MSA "${msa}" not found in FRED series mapping`)
      return NextResponse.json(
        {
          error: "MSA not supported",
          success: false,
          details: `MSA "${msa}" is not available in our FRED database mapping`,
          supportedMSAs: Object.keys(MSA_FRED_SERIES),
        },
        { status: 404 },
      )
    }

    console.log(`📊 Found FRED series mapping for: ${msaSeries.name}`)
    console.log(
      `📋 Series IDs - Unemployment: ${msaSeries.unemploymentSeries}, Population: ${msaSeries.populationSeries}`,
    )

    // Fetch real data from FRED API with better error handling
    const results = await Promise.allSettled([
      fetchFREDData(msaSeries.unemploymentSeries),
      msaSeries.populationSeries ? fetchFREDData(msaSeries.populationSeries) : Promise.resolve(null),
      msaSeries.populationSeries ? fetchPopulationGrowth(msaSeries.populationSeries) : Promise.resolve(null),
      fetchFREDData("MEHOINUSA646N"), // Real Median Household Income in the United States
      fetchFREDData("ASPUS"), // Average Sales Price of Houses Sold in the United States
    ])

    // Extract results with fallback values
    const unemploymentRate = results[0].status === "fulfilled" ? results[0].value : null
    const population = results[1].status === "fulfilled" ? results[1].value : null
    const populationGrowth = results[2].status === "fulfilled" ? results[2].value : null
    const nationalMedianIncome = results[3].status === "fulfilled" ? results[3].value : null
    const nationalHomePrice = results[4].status === "fulfilled" ? results[4].value : null

    console.log(`📊 FRED Data Results:`)
    console.log(`   Unemployment Rate: ${unemploymentRate}%`)
    console.log(`   Population: ${population?.toLocaleString()}`)
    console.log(`   Population Growth: ${populationGrowth}%`)
    console.log(`   National Median Income: $${nationalMedianIncome?.toLocaleString()}`)
    console.log(`   National Home Price: $${nationalHomePrice?.toLocaleString()}`)

    // Check if we have at least some data
    if (!unemploymentRate && !population) {
      return NextResponse.json(
        {
          error: "No FRED data available",
          success: false,
          details: `Unable to retrieve any economic data for ${msaSeries.name} from FRED API`,
          attemptedSeries: {
            unemployment: msaSeries.unemploymentSeries,
            population: msaSeries.populationSeries,
          },
        },
        { status: 503 },
      )
    }

    // Calculate regional adjustments based on MSA characteristics
    const getRegionalMultiplier = (msaName: string) => {
      const highCostAreas = ["San Francisco", "New York", "Los Angeles", "Boston", "Seattle", "Washington"]
      const moderateCostAreas = ["Chicago", "Philadelphia", "Denver", "Austin", "Miami"]

      if (highCostAreas.some((area) => msaName.includes(area))) {
        return { income: 1.3, housing: 1.8 }
      } else if (moderateCostAreas.some((area) => msaName.includes(area))) {
        return { income: 1.1, housing: 1.2 }
      }
      return { income: 0.9, housing: 0.8 }
    }

    const multiplier = getRegionalMultiplier(msaSeries.name)

    // Build MSA info with real FRED data and reasonable defaults
    const realMSAInfo: MSAInfo = {
      name: msaSeries.name,
      population: population || 850000, // Default if no population data
      medianIncome: nationalMedianIncome ? Math.floor(nationalMedianIncome * multiplier.income) : 65000,
      averageHomePrice: nationalHomePrice ? Math.floor(nationalHomePrice * multiplier.housing) : 350000,
      unemploymentRate: unemploymentRate || 4.2, // Default if no unemployment data
      populationGrowth: populationGrowth || 1.5, // Default if no growth data
    }

    console.log(`✅ Successfully processed FRED data for ${msaSeries.name}`)

    return NextResponse.json({
      success: true,
      msaInfo: realMSAInfo,
      dataSource: "FRED_API",
      dataAvailability: {
        unemployment: unemploymentRate !== null,
        population: population !== null,
        populationGrowth: populationGrowth !== null,
        nationalIncome: nationalMedianIncome !== null,
        nationalHomePrice: nationalHomePrice !== null,
      },
      fredSeries: {
        unemployment: msaSeries.unemploymentSeries,
        population: msaSeries.populationSeries,
        nationalIncome: "MEHOINUSA646N",
        nationalHomePrice: "ASPUS",
      },
      message: `FRED data retrieved for ${msaSeries.name}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Error in MSA info API:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch MSA data",
        details: error.message || "Unknown error occurred",
        message: "Unable to retrieve economic data from FRED API",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "MSA Information API - Powered by FRED",
    description: "Provides real MSA economic data using Federal Reserve Economic Data (FRED) API",
    supportedMSAs: Object.keys(MSA_FRED_SERIES),
    fredApiConfigured: !!FRED_API_KEY,
    totalSupportedMSAs: Object.keys(MSA_FRED_SERIES).length,
    dataSources: [
      "Unemployment rates from Bureau of Labor Statistics via FRED",
      "Population data from U.S. Census Bureau via FRED",
      "Median income from national FRED data with regional adjustments",
      "Home prices from national FRED data with regional adjustments",
      "Population growth calculated from year-over-year FRED data",
    ],
    examples: [
      "Miami-Fort Lauderdale-West Palm Beach",
      "Austin-Round Rock",
      "Dallas-Fort Worth-Arlington",
      "Los Angeles-Long Beach-Anaheim",
      "New York-Newark-Jersey City",
    ],
  })
}
