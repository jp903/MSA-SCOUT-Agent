import { type NextRequest, NextResponse } from "next/server"
import { PortfolioManagerDB } from "@/lib/portfolio-manager-db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: "Invalid property ID format" }, { status: 400 })
    }

    // Get single property
    const portfolio = await PortfolioManagerDB.getPortfolio()
    const property = portfolio.find((p) => p.id === id)

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      property,
    })
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch property",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updates = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    console.log("Updating property:", id, updates)

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: "Invalid property ID format" }, { status: 400 })
    }

    // Convert string numbers to actual numbers
    const cleanedUpdates = {
      ...updates,
      purchasePrice: updates.purchasePrice ? Number.parseFloat(updates.purchasePrice) : undefined,
      currentValue: updates.currentValue ? Number.parseFloat(updates.currentValue) : undefined,
      monthlyRent: updates.monthlyRent ? Number.parseFloat(updates.monthlyRent) : undefined,
      monthlyExpenses: updates.monthlyExpenses ? Number.parseFloat(updates.monthlyExpenses) : undefined,
      downPayment: updates.downPayment ? Number.parseFloat(updates.downPayment) : undefined,
      loanAmount: updates.loanAmount ? Number.parseFloat(updates.loanAmount) : undefined,
      interestRate: updates.interestRate ? Number.parseFloat(updates.interestRate) : undefined,
      loanTermYears: updates.loanTermYears ? Number.parseInt(updates.loanTermYears) : undefined,
    }

    const updatedProperty = await PortfolioManagerDB.updateProperty(id, cleanedUpdates)

    if (!updatedProperty) {
      return NextResponse.json({ error: "Property not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      property: updatedProperty,
      message: "Property updated successfully",
    })
  } catch (error) {
    console.error("Error updating property:", error)
    return NextResponse.json(
      {
        error: "Failed to update property",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    console.log("DELETE request received for property ID:", id)

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      console.error("Invalid UUID format:", id)
      return NextResponse.json(
        {
          error: "Invalid property ID format",
          details: `Expected UUID format, got: ${id}`,
        },
        { status: 400 },
      )
    }

    console.log("Attempting to delete property with valid UUID:", id)
    const deleted = await PortfolioManagerDB.deleteProperty(id)

    if (!deleted) {
      console.error("Property not found or deletion failed for ID:", id)
      return NextResponse.json({ error: "Property not found or deletion failed" }, { status: 404 })
    }

    console.log("Property successfully deleted:", id)
    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
    })
  } catch (error) {
    console.error("Error in DELETE route:", error)
    return NextResponse.json(
      {
        error: "Failed to delete property",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
