import { type NextRequest, NextResponse } from "next/server"
import { PortfolioManagerDB } from "@/lib/portfolio-manager-db"

export async function GET() {
  try {
    console.log("Portfolio API: Starting to fetch portfolio data...")

    // Get portfolio properties
    const portfolio = await PortfolioManagerDB.getPortfolio()
    console.log(`Portfolio API: Found ${portfolio.length} properties`)

    // Calculate metrics
    const metrics = await PortfolioManagerDB.calculatePortfolioMetrics()
    console.log("Portfolio API: Calculated metrics:", metrics)

    // Double-check total value calculation
    const manualTotalValue = portfolio.reduce((sum, property) => {
      const value = property.currentValue || 0
      console.log(`Property ${property.name}: $${value}`)
      return sum + value
    }, 0)

    console.log(`Portfolio API: Manual total value calculation: $${manualTotalValue}`)
    console.log(`Portfolio API: Metrics total value: $${metrics.totalValue}`)

    // Ensure we return the correct total value
    const finalMetrics = {
      ...metrics,
      totalValue: manualTotalValue > 0 ? manualTotalValue : metrics.totalValue,
    }

    return NextResponse.json({
      success: true,
      portfolio,
      metrics: finalMetrics,
    })
  } catch (error) {
    console.error("Portfolio API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch portfolio data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json()
    console.log("Portfolio API: Adding new property:", propertyData)

    // Validate required fields
    if (!propertyData.name || !propertyData.address) {
      return NextResponse.json(
        {
          success: false,
          error: "Property name and address are required",
        },
        { status: 400 },
      )
    }

    // Ensure numeric fields are properly set
    const sanitizedData = {
      ...propertyData,
      purchasePrice: Number(propertyData.purchasePrice) || 0,
      currentValue: Number(propertyData.currentValue) || 0,
      monthlyRent: Number(propertyData.monthlyRent) || 0,
      monthlyExpenses: Number(propertyData.monthlyExpenses) || 0,
      downPayment: Number(propertyData.downPayment) || 0,
      loanAmount: Number(propertyData.loanAmount) || 0,
      interestRate: Number(propertyData.interestRate) || 0,
      loanTermYears: Number(propertyData.loanTermYears) || 30,
    }

    console.log("Portfolio API: Sanitized property data:", sanitizedData)

    const newProperty = await PortfolioManagerDB.addProperty(sanitizedData)

    if (!newProperty) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to add property to database",
        },
        { status: 500 },
      )
    }

    console.log("Portfolio API: Successfully added property:", newProperty.id)

    return NextResponse.json({
      success: true,
      property: newProperty,
    })
  } catch (error) {
    console.error("Portfolio API Error (POST):", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add property",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
