export interface PropertyImage {
  id: string
  property_id?: string
  url: string
  filename: string
  size: number
  uploadedAt: string
  caption?: string
  isPrimary: boolean
}

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
  propertyType: "single-family" | "multi-family" | "condo" | "townhouse" | "commercial"
  status: "owned" | "under-contract" | "analyzing" | "sold"
  notes?: string
  images: PropertyImage[]
  createdAt: string
  updatedAt: string
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

export interface ChatHistoryItem {
  id: string
  title: string
  messages: Array<{
    id: string
    content: string
    sender: "user" | "ai"
    timestamp: string
  }>
  createdAt: string
  updatedAt: string
}
