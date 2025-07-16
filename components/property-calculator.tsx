"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, DollarSign } from "lucide-react"

interface CalculationResults {
  monthlyMortgage: number
  monthlyCashFlow: number
  annualCashFlow: number
  cashOnCashReturn: number
  capRate: number
  totalCashNeeded: number
}

export default function PropertyCalculator() {
  const [inputs, setInputs] = useState({
    purchasePrice: "",
    monthlyRent: "",
    monthlyExpenses: "",
    downPayment: "",
    interestRate: "",
    loanTerm: "30",
  })

  const [results, setResults] = useState<CalculationResults | null>(null)

  const calculateInvestment = () => {
    const purchasePrice = Number.parseFloat(inputs.purchasePrice)
    const monthlyRent = Number.parseFloat(inputs.monthlyRent)
    const monthlyExpenses = Number.parseFloat(inputs.monthlyExpenses)
    const downPayment = Number.parseFloat(inputs.downPayment)
    const annualRate = Number.parseFloat(inputs.interestRate) / 100
    const loanTermYears = Number.parseFloat(inputs.loanTerm)

    const loanAmount = purchasePrice - downPayment
    const monthlyRate = annualRate / 12
    const numberOfPayments = loanTermYears * 12

    const monthlyMortgage =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    const monthlyCashFlow = monthlyRent - monthlyExpenses - monthlyMortgage
    const annualCashFlow = monthlyCashFlow * 12
    const cashOnCashReturn = (annualCashFlow / downPayment) * 100
    const capRate = ((monthlyRent * 12 - monthlyExpenses * 12) / purchasePrice) * 100

    setResults({
      monthlyMortgage: Math.round(monthlyMortgage),
      monthlyCashFlow: Math.round(monthlyCashFlow),
      annualCashFlow: Math.round(annualCashFlow),
      cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
      capRate: Math.round(capRate * 100) / 100,
      totalCashNeeded: downPayment,
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Investment Calculator</h2>
        <p className="text-lg text-gray-600">Calculate your property investment returns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchasePrice" className="text-sm font-medium text-gray-700">
                  Purchase Price ($)
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={inputs.purchasePrice}
                  onChange={(e) => setInputs({ ...inputs, purchasePrice: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="downPayment" className="text-sm font-medium text-gray-700">
                  Down Payment ($)
                </Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={inputs.downPayment}
                  onChange={(e) => setInputs({ ...inputs, downPayment: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="monthlyRent" className="text-sm font-medium text-gray-700">
                  Monthly Rent ($)
                </Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  value={inputs.monthlyRent}
                  onChange={(e) => setInputs({ ...inputs, monthlyRent: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="monthlyExpenses" className="text-sm font-medium text-gray-700">
                  Monthly Expenses ($)
                </Label>
                <Input
                  id="monthlyExpenses"
                  type="number"
                  value={inputs.monthlyExpenses}
                  onChange={(e) => setInputs({ ...inputs, monthlyExpenses: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="interestRate" className="text-sm font-medium text-gray-700">
                  Interest Rate (%)
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={inputs.interestRate}
                  onChange={(e) => setInputs({ ...inputs, interestRate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="loanTerm" className="text-sm font-medium text-gray-700">
                  Loan Term (years)
                </Label>
                <Input
                  id="loanTerm"
                  type="number"
                  value={inputs.loanTerm}
                  onChange={(e) => setInputs({ ...inputs, loanTerm: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <Button onClick={calculateInvestment} className="w-full bg-blue-600 hover:bg-blue-700">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Investment Returns
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Investment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Monthly Mortgage Payment</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${results.monthlyMortgage.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 ${results.monthlyCashFlow >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Monthly Cash Flow</span>
                      <span
                        className={`text-lg font-bold ${results.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        ${results.monthlyCashFlow.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 ${results.annualCashFlow >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Annual Cash Flow</span>
                      <span
                        className={`text-lg font-bold ${results.annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        ${results.annualCashFlow.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Cash-on-Cash Return</span>
                      <span className="text-lg font-bold text-blue-600">{results.cashOnCashReturn}%</span>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Cap Rate</span>
                      <span className="text-lg font-bold text-purple-600">{results.capRate}%</span>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Total Cash Needed</span>
                      <span className="text-lg font-bold text-orange-600">
                        ${results.totalCashNeeded.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Enter property details and click calculate to see your investment analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
