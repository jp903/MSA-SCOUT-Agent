import type { Property, PortfolioMetrics, PropertyPerformance } from "./portfolio-types"
import { ImageManager } from "./image-manager"

export class PortfolioManager {
  private static STORAGE_KEY = "property-portfolio"

  static getPortfolio(): Property[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static savePortfolio(properties: Property[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(properties))
  }

  static addProperty(property: Omit<Property, "id" | "createdAt" | "updatedAt">): Property {
    const newProperty: Property = {
      ...property,
      id: crypto.randomUUID(),
      images: [], // Initialize empty images array
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const portfolio = this.getPortfolio()
    portfolio.push(newProperty)
    this.savePortfolio(portfolio)
    return newProperty
  }

  static updateProperty(id: string, updates: Partial<Property>): Property | null {
    const portfolio = this.getPortfolio()
    const index = portfolio.findIndex((p) => p.id === id)

    if (index === -1) return null

    portfolio[index] = {
      ...portfolio[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.savePortfolio(portfolio)
    return portfolio[index]
  }

  static deleteProperty(id: string): boolean {
    const portfolio = this.getPortfolio()
    const filtered = portfolio.filter((p) => p.id !== id)

    if (filtered.length === portfolio.length) return false

    this.savePortfolio(filtered)
    return true
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

  static calculatePortfolioMetrics(): PortfolioMetrics {
    const portfolio = this.getPortfolio()
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
  }

  static getPropertyWithImages(id: string): Property | null {
    const portfolio = this.getPortfolio()
    const property = portfolio.find((p) => p.id === id)

    if (!property) return null

    // Sync images from ImageManager
    property.images = ImageManager.getPropertyImages(id)
    return property
  }
}
