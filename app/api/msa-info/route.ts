import { type NextRequest, NextResponse } from "next/server"
import { PropertySearchAgent } from "@/lib/property-search-agent"

export async function POST(request: NextRequest) {
  try {
    console.log("📊 MSA info API endpoint called")

    const body = await request.json()
    console.log("📋 Received MSA request:", body)

    if (!body.msa || !body.state) {
      console.log("❌ Missing required fields: msa or state")
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Both msa and state are required",
          success: false,
        },
        { status: 400 },
      )
    }

    // Create search agent and get MSA info
    const searchAgent = new PropertySearchAgent()
    const msaInfo = await searchAgent.getMSAInfo(body.msa, body.state)

    console.log(`✅ MSA info retrieved successfully for ${body.msa}, ${body.state}`)

    return NextResponse.json({
      success: true,
      msaInfo,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ MSA info API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get MSA information",
        details: error.message || "Unknown error occurred",
        msaInfo: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "MSA Information API",
    version: "1.0.0",
    status: "active",
    endpoints: {
      "POST /api/msa-info": "Get MSA demographic and market information",
    },
    requiredFields: ["msa", "state"],
  })
}
