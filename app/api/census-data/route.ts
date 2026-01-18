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

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If response is not JSON, it's likely an error page
      const text = await response.text();
      console.error("Census API returned non-JSON response:", text);
      return NextResponse.json({
        success: false,
        message: "Census API returned an error page instead of data",
        error: text.substring(0, 200) // Limit error message length
      }, { status: 400 });
    }

    const data = await response.json();

    if (!data || data.length < 2) {
      return NextResponse.json({
        success: false,
        message: "No data available from Census for this state",
        stateCode
      }, { status: 404 });
    }

    const [, population, medianIncome, housingUnits, stateName] = data[1];

    return NextResponse.json({
      stateName,
      population: Number.parseInt(population) || 0,
      medianIncome: Number.parseInt(medianIncome) || 0,
      housingUnits: Number.parseInt(housingUnits) || 0,
      success: true,
    });
  } catch (error: any) {
    console.error("Error fetching Census data:", error);

    // Check if it's a parsing error (HTML response)
    if (error.message && error.message.includes("Unexpected token")) {
      return NextResponse.json({
        success: false,
        message: "Census API returned an error page instead of data",
        error: error.message
      }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch Census data",
        details: error instanceof Error ? error.message : String(error),
        success: false
      },
      { status: 500 },
    );
  }
}