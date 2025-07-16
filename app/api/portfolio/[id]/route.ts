import { type NextRequest, NextResponse } from "next/server"
import { PortfolioManagerDB } from "@/lib/portfolio-manager-db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const property = await PortfolioManagerDB.updateProperty(params.id, updates)

    if (property) {
      return NextResponse.json(property)
    } else {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating property:", error)
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await PortfolioManagerDB.deleteProperty(params.id)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 })
  }
}
