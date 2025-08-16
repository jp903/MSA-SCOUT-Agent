"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calculator, DollarSign, Percent, TrendingUp } from "lucide-react"

interface CalculationResults {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  monthlyRental: number
  monthlyCashFlow: number
  capRate: number
  cashOnCashReturn: number
  totalROI: number
}

const PropertyCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState<string>("")
  const [downPayment, setDownPayment] = useState<string>("")
  const [interestRate, setInterestRate] = useState<string>("")
  const [loanTerm, setLoanTerm] = useState<string>("30")
  const [monthlyRent, setMonthlyRent] = useState<string>("")
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>("")
  const [results, setResults] = useState<CalculationResults | null>(null)

  const calculateMortgage = () => {
    const price = Number.parseFloat(purchasePrice) || 0
    const down = Number.parseFloat(downPayment) || 0
    const rate = Number.parseFloat(interestRate) || 0
    const term = Number.parseFloat(loanTerm) || 30
    const rent = Number.parseFloat(monthlyRent) || 0
    const expenses = Number.parseFloat(monthlyExpenses) || 0

    if (price <= 0 || down < 0 || rate < 0 || term <= 0) {
      return
    }

    const loanAmount = price - down
    const monthlyRate = rate / 100 / 12
    const numPayments = term * 12

    let monthlyPayment = 0
    if (monthlyRate > 0) {
      monthlyPayment =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
    } else {
      monthlyPayment = loanAmount / numPayments
    }

    const totalPayment = monthlyPayment * numPayments
    const totalInterest = totalPayment - loanAmount
    const monthlyCashFlow = rent - monthlyPayment - expenses
    const annualRent = rent * 12
    const capRate = price > 0 ? ((annualRent - expenses * 12) / price) * 100 : 0
    const annualCashFlow = monthlyCashFlow * 12
    const cashOnCashReturn = down > 0 ? (annualCashFlow / down) * 100 : 0
    const totalROI = down > 0 ? ((annualCashFlow + price * 0.03) / down) * 100 : 0 // Assuming 3% appreciation

    setResults({
      monthlyPayment,
      totalInterest,
      totalPayment,
      monthlyRental: rent,
      monthlyCashFlow,
      capRate,
      cashOnCashReturn,
      totalROI,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(2)}%`
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Calculator className="h-8 w-8" />
          Property Investment Calculator
        </h1>
        <p className="text-muted-foreground">
          Calculate mortgage payments, cash flow, and investment returns for your property
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>Enter your property and loan information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purchase-price">Purchase Price</Label>
              <Input
                id="purchase-price"
                type="number"
                placeholder="500000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="down-payment">Down Payment</Label>
              <Input
                id="down-payment"
                type="number"
                placeholder="100000"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest-rate">Interest Rate (%)</Label>
              <Input
                id="interest-rate"
                type="number"
                step="0.01"
                placeholder="6.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-term">Loan Term (years)</Label>
              <Input
                id="loan-term"
                type="number"
                placeholder="30"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="monthly-rent">Monthly Rent</Label>
              <Input
                id="monthly-rent"
                type="number"
                placeholder="3000"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-expenses">Monthly Expenses</Label>
              <Input
                id="monthly-expenses"
                type="number"
                placeholder="500"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
              />
            </div>

            <Button onClick={calculateMortgage} className="w-full">
              Calculate Investment Returns
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Analysis</CardTitle>
            <CardDescription>Your property investment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-6">
                {/* Mortgage Details */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Mortgage Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Payment:</span>
                      <span className="font-medium">{formatCurrency(results.monthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-medium">{formatCurrency(results.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Payment:</span>
                      <span className="font-medium">{formatCurrency(results.totalPayment)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Cash Flow */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Cash Flow Analysis
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Rent:</span>
                      <span className="font-medium text-green-600">{formatCurrency(results.monthlyRental)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Cash Flow:</span>
                      <span
                        className={`font-medium ${results.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(results.monthlyCashFlow)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Investment Returns */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Investment Returns
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cap Rate:</span>
                      <span className="font-medium">{formatPercent(results.capRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cash-on-Cash Return:</span>
                      <span className="font-medium">{formatPercent(results.cashOnCashReturn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total ROI (with appreciation):</span>
                      <span className="font-medium">{formatPercent(results.totalROI)}</span>
                    </div>
                  </div>
                </div>

                {/* Investment Quality Indicator */}
                <div className="mt-4 p-3 rounded-lg bg-muted">
                  <div className="text-sm">
                    <strong>Investment Quality:</strong>
                    <span
                      className={`ml-2 ${
                        results.cashOnCashReturn >= 8
                          ? "text-green-600"
                          : results.cashOnCashReturn >= 5
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {results.cashOnCashReturn >= 8 ? "Excellent" : results.cashOnCashReturn >= 5 ? "Good" : "Poor"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on cash-on-cash return. Good investments typically yield 8%+ returns.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter property details to see investment analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Default export
export default PropertyCalculator

// Named export for compatibility
export { PropertyCalculator }
