import { sql } from "./db"
import type { Property, PortfolioMetrics, PropertyPerformance, PropertyImage } from "./portfolio-types"

export class PortfolioManagerDB {
  static async getPortfolio(): Promise<Property[]> {
    try {
      console.log("PortfolioManagerDB: Querying properties from database...")
      const properties = await sql`
        SELECT 
          id::text as id,
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

      console.log(`PortfolioManagerDB: Found ${properties.length} properties in database`)

      const propertiesWithImages = await Promise.all(
        properties.map(async (property) => {
          let images: PropertyImage[] = []
          try {
            images = await this.getPropertyImages(property.id)
          } catch (error) {
            console.warn(`Failed to load images for property ${property.id}:`, error)
            images = []
          }

          const processedProperty = {
            ...property,
            purchasePrice: Number(property.purchasePrice) || 0,
            currentValue: Number(property.currentValue) || 0,
            monthlyRent: Number(property.monthlyRent) || 0,
            monthlyExpenses: Number(property.monthlyExpenses) || 0,
            downPayment: Number(property.downPayment) || 0,
            loanAmount: Number(property.loanAmount) || 0,
            interestRate: Number(property.interestRate) || 0,
            loanTermYears: Number(property.loanTermYears) || 30,
            purchaseDate: property.purchaseDate ? property.purchaseDate.toISOString().split("T")[0] : "",
            createdAt: property.createdAt.toISOString(),
            updatedAt: property.updatedAt.toISOString(),
            images,
          }

          console.log(`Property ${processedProperty.name}: Current Value = $${processedProperty.currentValue}`)
          return processedProperty
        }),
      )

      return propertiesWithImages
    } catch (error) {
      console.error("PortfolioManagerDB: Error fetching portfolio:", error)
      throw error
    }
  }

  static async addProperty(
    property: Omit<Property, "id" | "createdAt" | "updatedAt" | "images">,
  ): Promise<Property | null> {
    try {
      console.log("PortfolioManagerDB: Inserting property into database:", property)

      const result = await sql`
        INSERT INTO properties (
          name, address, state, purchase_price, purchase_date, current_value,
          monthly_rent, monthly_expenses, down_payment, loan_amount, interest_rate,
          loan_term_years, property_type, status, notes
        ) VALUES (
          ${property.name}, 
          ${property.address}, 
          ${property.state}, 
          ${property.purchasePrice},
          ${property.purchaseDate || null}, 
          ${property.currentValue}, 
          ${property.monthlyRent || 0},
          ${property.monthlyExpenses || 0}, 
          ${property.downPayment || 0}, 
          ${property.loanAmount || 0},
          ${property.interestRate || 0}, 
          ${property.loanTermYears || 30}, 
          ${property.propertyType},
          ${property.status || "analyzing"}, 
          ${property.notes || null}
        )
        RETURNING 
          id::text as id,
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
        console.log("PortfolioManagerDB: Property inserted successfully with ID:", newProperty.id)
        console.log("PortfolioManagerDB: New property current value:", newProperty.currentValue)

        return {
          ...newProperty,
          purchasePrice: Number(newProperty.purchasePrice) || 0,
          currentValue: Number(newProperty.currentValue) || 0,
          monthlyRent: Number(newProperty.monthlyRent) || 0,
          monthlyExpenses: Number(newProperty.monthlyExpenses) || 0,
          downPayment: Number(newProperty.downPayment) || 0,
          loanAmount: Number(newProperty.loanAmount) || 0,
          interestRate: Number(newProperty.interestRate) || 0,
          loanTermYears: Number(newProperty.loanTermYears) || 30,
          purchaseDate: newProperty.purchaseDate ? newProperty.purchaseDate.toISOString().split("T")[0] : "",
          createdAt: newProperty.createdAt.toISOString(),
          updatedAt: newProperty.updatedAt.toISOString(),
          images: [],
        }
      }

      console.error("PortfolioManagerDB: No property returned from insert operation")
      return null
    } catch (error) {
      console.error("PortfolioManagerDB: Error adding property to database:", error)
      throw error
    }
  }

  static async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    try {
      console.log("PortfolioManagerDB: Updating property:", id, updates)

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        throw new Error(`Invalid UUID format: ${id}`)
      }

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
          notes = COALESCE(${updates.notes}, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}::uuid
        RETURNING 
          id::text as id,
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
        let images: PropertyImage[] = []
        try {
          images = await this.getPropertyImages(id)
        } catch (error) {
          console.warn(`Failed to load images for updated property ${id}:`, error)
          images = []
        }

        return {
          ...updatedProperty,
          purchasePrice: Number(updatedProperty.purchasePrice) || 0,
          currentValue: Number(updatedProperty.currentValue) || 0,
          monthlyRent: Number(updatedProperty.monthlyRent) || 0,
          monthlyExpenses: Number(updatedProperty.monthlyExpenses) || 0,
          downPayment: Number(updatedProperty.downPayment) || 0,
          loanAmount: Number(updatedProperty.loanAmount) || 0,
          interestRate: Number(updatedProperty.interestRate) || 0,
          loanTermYears: Number(updatedProperty.loanTermYears) || 30,
          purchaseDate: updatedProperty.purchaseDate ? updatedProperty.purchaseDate.toISOString().split("T")[0] : "",
          createdAt: updatedProperty.createdAt.toISOString(),
          updatedAt: updatedProperty.updatedAt.toISOString(),
          images,
        }
      }
      return null
    } catch (error) {
      console.error("PortfolioManagerDB: Error updating property:", error)
      throw error
    }
  }

  static async deleteProperty(id: string): Promise<boolean> {
    try {
      console.log("PortfolioManagerDB: Deleting property with UUID:", id)

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        console.error("Invalid UUID format:", id)
        throw new Error(`Invalid UUID format: ${id}`)
      }

      // Delete the property (CASCADE will handle images)
      const result = await sql`DELETE FROM properties WHERE id = ${id}::uuid`

      console.log("PortfolioManagerDB: Property deleted, affected rows:", result.count)
      return result.count > 0
    } catch (error) {
      console.error("PortfolioManagerDB: Error deleting property:", error)
      throw error
    }
  }

  static async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    try {
      // Check if property_images table exists first
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'property_images'
        )
      `

      if (!tableExists[0].exists) {
        console.log("property_images table does not exist, returning empty array")
        return []
      }

      const images = await sql`
        SELECT 
          id::text as id,
          property_id::text as "propertyId",
          url,
          filename,
          size,
          caption,
          is_primary as "isPrimary",
          uploaded_at as "uploadedAt"
        FROM property_images 
        WHERE property_id = ${propertyId}::uuid
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
        VALUES (${propertyId}::uuid, ${image.url}, ${image.filename}, ${image.size}, ${image.caption || null}, ${image.isPrimary})
        RETURNING 
          id::text as id,
          property_id::text as "propertyId",
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
      throw error
    }
  }

  static async deletePropertyImage(imageId: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM property_images WHERE id = ${imageId}::uuid`
      return result.count > 0
    } catch (error) {
      console.error("Error deleting property image:", error)
      return false
    }
  }

  static async setPrimaryImage(propertyId: string, imageId: string): Promise<boolean> {
    try {
      await sql`UPDATE property_images SET is_primary = false WHERE property_id = ${propertyId}::uuid`

      const result = await sql`
        UPDATE property_images 
        SET is_primary = true 
        WHERE id = ${imageId}::uuid AND property_id = ${propertyId}::uuid
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
      console.log(`PortfolioManagerDB: Calculating metrics for ${portfolio.length} properties`)

      if (portfolio.length === 0) {
        console.log("PortfolioManagerDB: No properties found, returning zero metrics")
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

      // Calculate totals from ALL properties
      let totalValue = 0
      let totalDebt = 0
      let totalMonthlyIncome = 0
      let totalMonthlyExpenses = 0
      let totalMonthlyCashFlow = 0
      let totalCapRate = 0
      let totalCashOnCashReturn = 0
      let totalInvested = 0

      portfolio.forEach((property) => {
        const currentValue = Number(property.currentValue) || 0
        const loanAmount = Number(property.loanAmount) || 0
        const monthlyRent = Number(property.monthlyRent) || 0
        const monthlyExpenses = Number(property.monthlyExpenses) || 0
        const downPayment = Number(property.downPayment) || 0

        totalValue += currentValue
        totalDebt += loanAmount
        totalMonthlyIncome += monthlyRent
        totalMonthlyExpenses += monthlyExpenses
        totalInvested += downPayment

        console.log(
          `Property ${property.name}: Value=$${currentValue}, Rent=$${monthlyRent}, Expenses=$${monthlyExpenses}`,
        )

        // Calculate performance for this property
        const performance = this.calculatePropertyPerformance(property)
        totalMonthlyCashFlow += performance.monthlyCashFlow
        totalCapRate += performance.capRate
        totalCashOnCashReturn += performance.cashOnCashReturn
      })

      const totalEquity = totalValue - totalDebt
      const averageCapRate = portfolio.length > 0 ? totalCapRate / portfolio.length : 0
      const averageCashOnCashReturn = portfolio.length > 0 ? totalCashOnCashReturn / portfolio.length : 0
      const totalROI = totalInvested > 0 ? ((totalEquity - totalInvested) / totalInvested) * 100 : 0

      const metrics = {
        totalProperties: portfolio.length,
        totalValue: Math.round(totalValue),
        totalEquity: Math.round(totalEquity),
        totalMonthlyIncome: Math.round(totalMonthlyIncome),
        totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
        totalMonthlyCashFlow: Math.round(totalMonthlyCashFlow),
        averageCapRate: Math.round(averageCapRate * 100) / 100,
        averageCashOnCashReturn: Math.round(averageCashOnCashReturn * 100) / 100,
        totalROI: Math.round(totalROI * 100) / 100,
      }

      console.log("PortfolioManagerDB: Final calculated metrics:", metrics)
      return metrics
    } catch (error) {
      console.error("PortfolioManagerDB: Error calculating portfolio metrics:", error)
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
