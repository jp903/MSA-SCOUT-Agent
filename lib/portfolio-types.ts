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
