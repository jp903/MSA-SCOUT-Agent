import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateCode = searchParams.get("stateCode");
    const variables = searchParams.get("variables") || "NAME,B01003_001E,B19013_001E,B25003_001E";

    if (!stateCode) {
      return NextResponse.json({ error: "State code parameter required" }, { status: 400 });
    }

    // Try to fetch real Census data
    const response = await fetch(
      `https://api.census.gov/data/2022/acs/acs5?get=${variables}&for=state:${stateCode}&key=${process.env.CENSUS_API_KEY}`,
      {
        headers: {
          'User-Agent': 'MSASCOUT-AI-Agent/1.0 (contact: support@msascout.com)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Census API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length < 2) {
      throw new Error("No data available from Census");
    }

    const [, population, medianIncome, housingUnits, stateName] = data[1];

    return NextResponse.json({
      stateName,
      population: Number.parseInt(population) || 0,
      medianIncome: Number.parseInt(medianIncome) || 0,
      housingUnits: Number.parseInt(housingUnits) || 0,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching Census data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Census data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}