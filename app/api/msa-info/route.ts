import { type NextRequest, NextResponse } from "next/server"
import { propertyResearchAgent } from "@/lib/property-research-agent"

export async function POST(request: NextRequest) {
  try {
    const { msa, state } = await request.json()

    console.log("📊 MSA info request:", { msa, state })

    if (!msa || !state) {
      return NextResponse.json({ error: "MSA and state are required" }, { status: 400 })
    }

    const msaInfo = await propertyResearchAgent.getMSAInfo(msa, state)

    console.log(`✅ Retrieved MSA info for ${msa}, ${state}`)

    return NextResponse.json({
      msaInfo,
    })
  } catch (error) {
    console.error("❌ Error getting MSA info:", error)
    return NextResponse.json({ error: "Failed to get MSA information" }, { status: 500 })
  }
}
