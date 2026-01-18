import { type NextRequest, NextResponse } from "next/server"

const FRED_API_KEY = process.env.FRED_API_KEY
const FRED_BASE_URL = "https://api.stlouisfed.org/fred"

export async function GET(request: NextRequest) {
  try {
    if (!FRED_API_KEY) {
      return NextResponse.json({ error: "FRED_API_KEY environment variable is not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const series = searchParams.get("series")

    if (!series) {
      return NextResponse.json({ error: "Series parameter required" }, { status: 400 })
    }

    console.log(`🔍 Fetching FRED data for series: ${series}`)
    const url = `${FRED_BASE_URL}/series/observations?series_id=${series}&api_key=${FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`
    console.log(`📡 FRED API URL: ${url.replace(FRED_API_KEY!, "[API_KEY]")}`)

    // Fetch data from FRED API
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
      throw new Error(`FRED API error: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`📋 FRED API Response Data:`, JSON.stringify(data, null, 2))

    if (!data.observations || data.observations.length === 0) {
      console.warn(`No observations found for FRED series: ${series}`)
      return NextResponse.json({
        series_id: series,
        value: null,
        date: null,
        success: false,
        message: "No data available for this series"
      })
    }

    const latestObservation = data.observations[0]

    return NextResponse.json({
      series_id: series,
      value: Number.parseFloat(latestObservation.value),
      date: latestObservation.date,
      success: true,
    })
  } catch (error: any) {
    console.error("Error fetching FRED data:", error)

    // Check if it's a 400/404 error indicating invalid series
    if (error.message && (error.message.includes("400") || error.message.includes("404"))) {
      return NextResponse.json({
        series_id: series,
        value: null,
        date: null,
        success: false,
        message: "Invalid series ID or series does not exist"
      }, { status: 404 })
    }

    return NextResponse.json(
      {
        error: "Failed to fetch FRED data",
        details: error instanceof Error ? error.message : String(error),
        series_id: series,
        success: false
      },
      { status: 500 },
    )
  }
}
