"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, DollarSign, TrendingUp, Home } from "lucide-react"

interface CalculationResults {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  monthlyRental: number
  monthlyCashFlow: number
  annualCashFlow: number
  roi: number
  capRate: number
  breakEvenRatio: number
}

const PropertyCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState<number>(300000)
  const [downPayment, setDownPayment] = useState<number>(60000)
  const [interestRate, setInterestRate] = useState<number>(6.5)
  const [loanTerm, setLoanTerm] = useState<number>(30)
  const [monthlyRent, setMonthlyRent] = useState<number>(2500)
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(800)
  const [results, setResults] = useState<CalculationResults | null>(null)

  const calculateMortgage = () => {
    const principal = purchasePrice - downPayment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12

    // Monthly payment calculation
    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    const totalPayment = monthlyPayment * numberOfPayments
    const totalInterest = totalPayment - principal

    // Investment calculations
    const monthlyCashFlow = monthlyRent - monthlyPayment - monthlyExpenses
    const annualCashFlow = monthlyCashFlow * 12
    const roi = (annualCashFlow / downPayment) * 100
    const capRate = ((monthlyRent * 12 - monthlyExpenses * 12) / purchasePrice) * 100
    const breakEvenRatio = (monthlyPayment + monthlyExpenses) / monthlyRent

    setResults({
      monthlyPayment,
      totalInterest,
      totalPayment,
      monthlyRental: monthlyRent,
      monthlyCashFlow,
      annualCashFlow,
      roi,
      capRate,
      breakEvenRatio,
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

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`
  }

  const getRoiColor = (roi: number) => {
    if (roi >= 15) return "text-green-600"
    if (roi >= 10) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Investment Calculator</h1>
        <p className="text-gray-600">Calculate mortgage payments and investment returns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Property Details
            </CardTitle>
            <CardDescription>Enter your property and financing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="purchase" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="purchase">Purchase Info</TabsTrigger>
                <TabsTrigger value="rental">Rental Info</TabsTrigger>
              </TabsList>

              <TabsContent value="purchase" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      placeholder="300000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="downPayment">Down Payment</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      placeholder="60000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      placeholder="6.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loanTerm">Loan Term (years)</Label>
                    <Input
                      id="loanTerm"
                      type="number"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      placeholder="30"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rental" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthlyRent">Monthly Rent</Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(Number(e.target.value))}
                      placeholder="2500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                    <Input
                      id="monthlyExpenses"
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                      placeholder="800"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={calculateMortgage} className="w-full">
              Calculate Investment Returns
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Investment Analysis
            </CardTitle>
            <CardDescription>Your property investment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-6">
                {/* Mortgage Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Mortgage Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-600 font-medium">Monthly Payment</p>
                      <p className="text-xl font-bold text-blue-800">{formatCurrency(results.monthlyPayment)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 font-medium">Total Interest</p>
                      <p className="text-xl font-bold text-gray-800">{formatCurrency(results.totalInterest)}</p>
                    </div>
                  </div>
                </div>

                {/* Cash Flow Analysis */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Cash Flow Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className={`p-3 rounded-lg ${results.monthlyCashFlow >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                      <p className={`font-medium ${results.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                        Monthly Cash Flow
                      </p>
                      <p
                        className={`text-xl font-bold ${results.monthlyCashFlow >= 0 ? "text-green-800" : "text-red-800"}`}
                      >
                        {formatCurrency(results.monthlyCashFlow)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${results.annualCashFlow >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                      <p className={`font-medium ${results.annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                        Annual Cash Flow
                      </p>
                      <p
                        className={`text-xl font-bold ${results.annualCashFlow >= 0 ? "text-green-800" : "text-red-800"}`}
                      >
                        {formatCurrency(results.annualCashFlow)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Investment Metrics */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Investment Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium text-yellow-700">Return on Investment (ROI)</span>
                      <span className={`text-xl font-bold ${getRoiColor(results.roi)}`}>
                        {formatPercentage(results.roi)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-purple-700">Cap Rate</span>
                      <span className="text-xl font-bold text-purple-800">{formatPercentage(results.capRate)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="font-medium text-indigo-700">Break-even Ratio</span>
                      <span className="text-xl font-bold text-indigo-800">{results.breakEvenRatio.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Investment Quality Indicator */}
                <div className="mt-6 p-4 rounded-lg border-2 border-dashed">
                  <h4 className="font-semibold mb-2">Investment Quality</h4>
                  {results.roi >= 15 ? (
                    <p className="text-green-600 font-medium">🎯 Excellent Investment - High ROI potential</p>
                  ) : results.roi >= 10 ? (
                    <p className="text-yellow-600 font-medium">⚡ Good Investment - Moderate returns</p>
                  ) : results.roi >= 5 ? (
                    <p className="text-orange-600 font-medium">⚠️ Fair Investment - Consider other options</p>
                  ) : (
                    <p className="text-red-600 font-medium">❌ Poor Investment - High risk, low returns</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter property details and click calculate to see your investment analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Named export for compatibility
export { PropertyCalculator }

// Default export
export default PropertyCalculator
