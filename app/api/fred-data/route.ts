import { type NextRequest, NextResponse } from "next/server"

const FRED_API_KEY = process.env.FRED_API_KEY
const FRED_BASE_URL = "https://api.stlouisfed.org"

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

    // Fetch data from FRED API
    const response = await fetch(
      `${FRED_BASE_URL}/fred/series/observations?series_id=${series}&api_key=${FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`,
    )

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.observations || data.observations.length === 0) {
      throw new Error("No data available from FRED")
    }

    const latestObservation = data.observations[0]

    return NextResponse.json({
      series_id: series,
      value: Number.parseFloat(latestObservation.value),
      date: latestObservation.date,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching FRED data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch FRED data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
