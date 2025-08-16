import { NextResponse } from "next/server"
import { PortfolioManagerDB } from "@/lib/portfolio-manager-db"

export async function GET() {
  try {
    console.log("Fetching portfolio data...")

    const portfolio = await PortfolioManagerDB.getPortfolio()
    const metrics = await PortfolioManagerDB.calculatePortfolioMetrics()

    console.log(`Portfolio loaded: ${portfolio.length} properties`)
    console.log("Portfolio metrics calculated:", metrics)

    return NextResponse.json({
      success: true,
      portfolio,
      metrics,
    })
  } catch (error) {
    console.error("Error in portfolio API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch portfolio data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const propertyData = await request.json()
    console.log("Adding new property:", propertyData)

    // Convert string numbers to actual numbers
    const cleanedData = {
      ...propertyData,
      purchasePrice: propertyData.purchasePrice ? Number.parseFloat(propertyData.purchasePrice) : 0,
      currentValue: propertyData.currentValue ? Number.parseFloat(propertyData.currentValue) : 0,
      monthlyRent: propertyData.monthlyRent ? Number.parseFloat(propertyData.monthlyRent) : 0,
      monthlyExpenses: propertyData.monthlyExpenses ? Number.parseFloat(propertyData.monthlyExpenses) : 0,
      downPayment: propertyData.downPayment ? Number.parseFloat(propertyData.downPayment) : 0,
      loanAmount: propertyData.loanAmount ? Number.parseFloat(propertyData.loanAmount) : 0,
      interestRate: propertyData.interestRate ? Number.parseFloat(propertyData.interestRate) : 0,
      loanTermYears: propertyData.loanTermYears ? Number.parseInt(propertyData.loanTermYears) : 30,
    }

    const newProperty = await PortfolioManagerDB.addProperty(cleanedData)

    if (!newProperty) {
      return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
    }

    console.log("Property added successfully:", newProperty.id)

    return NextResponse.json({
      success: true,
      property: newProperty,
      message: "Property added successfully",
    })
  } catch (error) {
    console.error("Error adding property:", error)
    return NextResponse.json(
      {
        error: "Failed to add property",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
