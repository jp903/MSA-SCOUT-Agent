import { sql } from "./db"
import type { Property, PortfolioMetrics, PropertyPerformance, PropertyImage } from "./portfolio-types"

export class PortfolioManagerDB {
  static async getPortfolio(): Promise<Property[]> {
    try {
      const properties = await sql`
        SELECT 
          id,
          name,
          address,
          state,
          purchase_price as "purchasePrice",
          purchase_date as "purchaseDate",
          current_value as "currentValue",
          monthly_rent as "monthlyRent",
          monthly_expenses as "monthlyExpenses",
          down_payment as "downPayment",
          loan_amount as "loanAmount",
          interest_rate as "interestRate",
          loan_term_years as "loanTermYears",
          property_type as "propertyType",
          status,
          notes,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM properties 
        ORDER BY created_at DESC
      `

      // Get images for each property
      const propertiesWithImages = await Promise.all(
        properties.map(async (property) => {
          const images = await this.getPropertyImages(property.id)
          return {
            ...property,
            purchaseDate: property.purchaseDate ? property.purchaseDate.toISOString().split("T")[0] : "",
            createdAt: property.createdAt.toISOString(),
            updatedAt: property.updatedAt.toISOString(),
            images,
          }
        }),
      )

      return propertiesWithImages
    } catch (error) {
      console.error("Error fetching portfolio:", error)
      return []
    }
  }

  static async addProperty(
    property: Omit<Property, "id" | "createdAt" | "updatedAt" | "images">,
  ): Promise<Property | null> {
    try {
      const result = await sql`
        INSERT INTO properties (
          name, address, state, purchase_price, purchase_date, current_value,
          monthly_rent, monthly_expenses, down_payment, loan_amount, interest_rate,
          loan_term_years, property_type, status, notes
        ) VALUES (
          ${property.name}, ${property.address}, ${property.state}, ${property.purchasePrice},
          ${property.purchaseDate || null}, ${property.currentValue}, ${property.monthlyRent},
          ${property.monthlyExpenses}, ${property.downPayment}, ${property.loanAmount},
          ${property.interestRate}, ${property.loanTermYears}, ${property.propertyType},
          ${property.status}, ${property.notes || null}
        )
        RETURNING 
          id,
          name,
          address,
          state,
          purchase_price as "purchasePrice",
          purchase_date as "purchaseDate",
          current_value as "currentValue",
          monthly_rent as "monthlyRent",
          monthly_expenses as "monthlyExpenses",
          down_payment as "downPayment",
          loan_amount as "loanAmount",
          interest_rate as "interestRate",
          loan_term_years as "loanTermYears",
          property_type as "propertyType",
          status,
          notes,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `

      if (result.length > 0) {
        const newProperty = result[0]
        return {
          ...newProperty,
          purchaseDate: newProperty.purchaseDate ? newProperty.purchaseDate.toISOString().split("T")[0] : "",
          createdAt: newProperty.createdAt.toISOString(),
          updatedAt: newProperty.updatedAt.toISOString(),
          images: [],
        }
      }
      return null
    } catch (error) {
      console.error("Error adding property:", error)
      return null
    }
  }

  static async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    try {
      const result = await sql`
        UPDATE properties SET
          name = COALESCE(${updates.name}, name),
          address = COALESCE(${updates.address}, address),
          state = COALESCE(${updates.state}, state),
          purchase_price = COALESCE(${updates.purchasePrice}, purchase_price),
          purchase_date = COALESCE(${updates.purchaseDate || null}, purchase_date),
          current_value = COALESCE(${updates.currentValue}, current_value),
          monthly_rent = COALESCE(${updates.monthlyRent}, monthly_rent),
          monthly_expenses = COALESCE(${updates.monthlyExpenses}, monthly_expenses),
          down_payment = COALESCE(${updates.downPayment}, down_payment),
          loan_amount = COALESCE(${updates.loanAmount}, loan_amount),
          interest_rate = COALESCE(${updates.interestRate}, interest_rate),
          loan_term_years = COALESCE(${updates.loanTermYears}, loan_term_years),
          property_type = COALESCE(${updates.propertyType}, property_type),
          status = COALESCE(${updates.status}, status),
          notes = COALESCE(${updates.notes}, notes)
        WHERE id = ${id}
        RETURNING 
          id,
          name,
          address,
          state,
          purchase_price as "purchasePrice",
          purchase_date as "purchaseDate",
          current_value as "currentValue",
          monthly_rent as "monthlyRent",
          monthly_expenses as "monthlyExpenses",
          down_payment as "downPayment",
          loan_amount as "loanAmount",
          interest_rate as "interestRate",
          loan_term_years as "loanTermYears",
          property_type as "propertyType",
          status,
          notes,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `

      if (result.length > 0) {
        const updatedProperty = result[0]
        const images = await this.getPropertyImages(id)
        return {
          ...updatedProperty,
          purchaseDate: updatedProperty.purchaseDate ? updatedProperty.purchaseDate.toISOString().split("T")[0] : "",
          createdAt: updatedProperty.createdAt.toISOString(),
          updatedAt: updatedProperty.updatedAt.toISOString(),
          images,
        }
      }
      return null
    } catch (error) {
      console.error("Error updating property:", error)
      return null
    }
  }

  static async deleteProperty(id: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM properties WHERE id = ${id}`
      return result.count > 0
    } catch (error) {
      console.error("Error deleting property:", error)
      return false
    }
  }

  static async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    try {
      const images = await sql`
        SELECT 
          id,
          property_id as "property_id",
          url,
          filename,
          size,
          caption,
          is_primary as "isPrimary",
          uploaded_at as "uploadedAt"
        FROM property_images 
        WHERE property_id = ${propertyId}
        ORDER BY is_primary DESC, uploaded_at ASC
      `

      return images.map((img) => ({
        ...img,
        uploadedAt: img.uploadedAt.toISOString(),
      }))
    } catch (error) {
      console.error("Error fetching property images:", error)
      return []
    }
  }

  static async addPropertyImage(
    propertyId: string,
    image: Omit<PropertyImage, "id" | "uploadedAt">,
  ): Promise<PropertyImage | null> {
    try {
      const result = await sql`
        INSERT INTO property_images (property_id, url, filename, size, caption, is_primary)
        VALUES (${propertyId}, ${image.url}, ${image.filename}, ${image.size}, ${image.caption || null}, ${image.isPrimary})
        RETURNING 
          id,
          property_id as "property_id",
          url,
          filename,
          size,
          caption,
          is_primary as "isPrimary",
          uploaded_at as "uploadedAt"
      `

      if (result.length > 0) {
        const newImage = result[0]
        return {
          ...newImage,
          uploadedAt: newImage.uploadedAt.toISOString(),
        }
      }
      return null
    } catch (error) {
      console.error("Error adding property image:", error)
      return null
    }
  }

  static async deletePropertyImage(imageId: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM property_images WHERE id = ${imageId}`
      return result.count > 0
    } catch (error) {
      console.error("Error deleting property image:", error)
      return false
    }
  }

  static async setPrimaryImage(propertyId: string, imageId: string): Promise<boolean> {
    try {
      // First, unset all primary images for this property
      await sql`UPDATE property_images SET is_primary = false WHERE property_id = ${propertyId}`

      // Then set the selected image as primary
      const result = await sql`
        UPDATE property_images 
        SET is_primary = true 
        WHERE id = ${imageId} AND property_id = ${propertyId}
      `

      return result.count > 0
    } catch (error) {
      console.error("Error setting primary image:", error)
      return false
    }
  }

  static calculatePropertyPerformance(property: Property): PropertyPerformance {
    const monthlyInterestRate = property.interestRate / 100 / 12
    const numberOfPayments = property.loanTermYears * 12

    const monthlyMortgage =
      property.loanAmount > 0
        ? (property.loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
          (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
        : 0

    const monthlyCashFlow = property.monthlyRent - property.monthlyExpenses - monthlyMortgage
    const annualCashFlow = monthlyCashFlow * 12
    const cashOnCashReturn = property.downPayment > 0 ? (annualCashFlow / property.downPayment) * 100 : 0
    const capRate = ((property.monthlyRent * 12 - property.monthlyExpenses * 12) / property.purchasePrice) * 100

    const appreciation = property.currentValue - property.purchasePrice
    const appreciationPercent = (appreciation / property.purchasePrice) * 100
    const totalReturn = annualCashFlow + appreciation

    return {
      property,
      monthlyMortgage: Math.round(monthlyMortgage),
      monthlyCashFlow: Math.round(monthlyCashFlow),
      annualCashFlow: Math.round(annualCashFlow),
      cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
      capRate: Math.round(capRate * 100) / 100,
      totalReturn: Math.round(totalReturn),
      appreciation: Math.round(appreciation),
      appreciationPercent: Math.round(appreciationPercent * 100) / 100,
    }
  }

  static async calculatePortfolioMetrics(): Promise<PortfolioMetrics> {
    try {
      const portfolio = await this.getPortfolio()
      const ownedProperties = portfolio.filter((p) => p.status === "owned")

      if (ownedProperties.length === 0) {
        return {
          totalProperties: 0,
          totalValue: 0,
          totalEquity: 0,
          totalMonthlyIncome: 0,
          totalMonthlyExpenses: 0,
          totalMonthlyCashFlow: 0,
          averageCapRate: 0,
          averageCashOnCashReturn: 0,
          totalROI: 0,
        }
      }

      const performances = ownedProperties.map((p) => this.calculatePropertyPerformance(p))

      const totalValue = ownedProperties.reduce((sum, p) => sum + p.currentValue, 0)
      const totalDebt = ownedProperties.reduce((sum, p) => sum + (p.loanAmount || 0), 0)
      const totalEquity = totalValue - totalDebt
      const totalMonthlyIncome = ownedProperties.reduce((sum, p) => sum + p.monthlyRent, 0)
      const totalMonthlyExpenses = ownedProperties.reduce((sum, p) => sum + p.monthlyExpenses, 0)
      const totalMonthlyCashFlow = performances.reduce((sum, p) => sum + p.monthlyCashFlow, 0)
      const averageCapRate = performances.reduce((sum, p) => sum + p.capRate, 0) / performances.length
      const averageCashOnCashReturn = performances.reduce((sum, p) => sum + p.cashOnCashReturn, 0) / performances.length
      const totalInvested = ownedProperties.reduce((sum, p) => sum + p.downPayment, 0)
      const totalROI = totalInvested > 0 ? ((totalEquity - totalInvested) / totalInvested) * 100 : 0

      return {
        totalProperties: ownedProperties.length,
        totalValue: Math.round(totalValue),
        totalEquity: Math.round(totalEquity),
        totalMonthlyIncome: Math.round(totalMonthlyIncome),
        totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
        totalMonthlyCashFlow: Math.round(totalMonthlyCashFlow),
        averageCapRate: Math.round(averageCapRate * 100) / 100,
        averageCashOnCashReturn: Math.round(averageCashOnCashReturn * 100) / 100,
        totalROI: Math.round(totalROI * 100) / 100,
      }
    } catch (error) {
      console.error("Error calculating portfolio metrics:", error)
      return {
        totalProperties: 0,
        totalValue: 0,
        totalEquity: 0,
        totalMonthlyIncome: 0,
        totalMonthlyExpenses: 0,
        totalMonthlyCashFlow: 0,
        averageCapRate: 0,
        averageCashOnCashReturn: 0,
        totalROI: 0,
      }
    }
  }
}
