import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateCode = searchParams.get("stateCode");

    if (!stateCode) {
      return NextResponse.json({ error: "State code parameter required" }, { status: 400 });
    }

    // BLS Series ID format: LAUST + FIPS code + other identifiers
    // For state unemployment rate: LAUST[2-digit FIPS]0000000000003
    const seriesId = `LAUST${stateCode}0000000000003`;
    
    // BLS API requires a JSON payload with series IDs
    const requestBody = {
      seriesid: [seriesId],
      startyear: new Date().getFullYear() - 1, // Get last year's data
      endyear: new Date().getFullYear(),
      registrationkey: process.env.BLS_API_KEY
    };

    // BLS API only accepts POST requests for most data
    const response = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`BLS API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "REQUEST_SUCCEEDED" || !data.Results?.series?.[0]?.data?.[0]) {
      throw new Error("No data available from BLS");
    }

    const latestData = data.Results.series[0].data[0];

    return NextResponse.json({
      seriesId,
      value: Number.parseFloat(latestData.value) || 0,
      period: latestData.period,
      year: latestData.year,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching BLS data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch BLS data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}