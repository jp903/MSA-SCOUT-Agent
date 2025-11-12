export interface Property {
  id: string
  name: string
  address: string
  state: string
  purchasePrice: number
  purchaseDate: string
  currentValue: number
  monthlyRent: number
  monthlyExpenses: number
  downPayment: number
  loanAmount: number
  interestRate: number
  loanTermYears: number
  propertyType: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  images: PropertyImage[]
  // Optional enriched fields used by portfolio analysis
  equity?: number
  location?: string
  dateAdded?: string
}

export interface PropertyImage {
  id: string
  propertyId: string
  url: string
  filename: string
  size: number
  caption?: string
  isPrimary: boolean
  uploadedAt: string
}

export interface PortfolioMetrics {
  totalProperties: number
  totalValue: number
  totalEquity: number
  totalMonthlyIncome: number
  totalMonthlyExpenses: number
  totalMonthlyCashFlow: number
  averageCapRate: number
  averageCashOnCashReturn: number
  totalROI: number
}

export interface PropertyPerformance {
  property: Property
  monthlyMortgage: number
  monthlyCashFlow: number
  annualCashFlow: number
  cashOnCashReturn: number
  capRate: number
  totalReturn: number
  appreciation: number
  appreciationPercent: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatHistoryItem {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  avatarUrl?: string
}

export interface Portfolio {
  properties: Property[]
  totalValue: number
  totalEquity: number
  totalMonthlyIncome: number
  totalMonthlyExpenses: number
  totalCashFlow: number
  propertyCount: number
}

export interface PortfolioAnalysis {
  portfolio: Portfolio
  aiAnalysis: string
  aiMetrics: Record<string, any>
  recommendations: string[]
  riskFactors: string[]
  opportunities: string[]
  projectedPerformance: Record<string, any>
}
