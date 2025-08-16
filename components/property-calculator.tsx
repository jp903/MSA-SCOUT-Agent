"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calculator, RotateCcw, Play } from "lucide-react"

interface CalculatorInputs {
  purchasePrice: number
  useLoan: boolean
  downPayment: number
  interestRate: number
  loanTerm: number
  closingCost: number
  needRepairs: boolean
  repairCost: number
  valueAfterRepairs: number
  monthlyRent: number
  monthlyRentIncrease: number
  otherMonthlyIncome: number
  otherIncomeIncrease: number
  vacancyRate: number
  managementFee: number
  propertyTax: number
  propertyTaxIncrease: number
  totalInsurance: number
  insuranceIncrease: number
  hoaFee: number
  hoaIncrease: number
  maintenance: number
  maintenanceIncrease: number
  otherCosts: number
  otherCostsIncrease: number
  knowSellPrice: boolean
  sellPrice: number
  valueAppreciation: number
  holdingLength: number
  costToSell: number
}

interface CalculationResults {
  monthlyMortgage: number
  monthlyCashFlow: number
  annualCashFlow: number
  totalCashInvested: number
  cashOnCashReturn: number
  capRate: number
  totalReturn: number
  annualizedReturn: number
}

export default function PropertyCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    purchasePrice: 200000,
    useLoan: true,
    downPayment: 20,
    interestRate: 6,
    loanTerm: 30,
    closingCost: 6000,
    needRepairs: false,
    repairCost: 20000,
    valueAfterRepairs: 260000,
    monthlyRent: 2000,
    monthlyRentIncrease: 3,
    otherMonthlyIncome: 0,
    otherIncomeIncrease: 3,
    vacancyRate: 5,
    managementFee: 0,
    propertyTax: 3000,
    propertyTaxIncrease: 3,
    totalInsurance: 1200,
    insuranceIncrease: 3,
    hoaFee: 0,
    hoaIncrease: 3,
    maintenance: 2000,
    maintenanceIncrease: 3,
    otherCosts: 500,
    otherCostsIncrease: 3,
    knowSellPrice: true,
    sellPrice: 400000,
    valueAppreciation: 3,
    holdingLength: 20,
    costToSell: 8,
  })

  const [results, setResults] = useState<CalculationResults | null>(null)

  const handleInputChange = (field: keyof CalculatorInputs, value: number | boolean) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  const calculateInvestment = () => {
    const {
      purchasePrice,
      useLoan,
      downPayment,
      interestRate,
      loanTerm,
      closingCost,
      needRepairs,
      repairCost,
      monthlyRent,
      otherMonthlyIncome,
      vacancyRate,
      managementFee,
      propertyTax,
      totalInsurance,
      hoaFee,
      maintenance,
      otherCosts,
      knowSellPrice,
      sellPrice,
      valueAppreciation,
      holdingLength,
      costToSell,
    } = inputs

    // Calculate initial investment
    const downPaymentAmount = useLoan ? (purchasePrice * downPayment) / 100 : purchasePrice
    const totalCashInvested = downPaymentAmount + closingCost + (needRepairs ? repairCost : 0)

    // Calculate monthly mortgage payment
    let monthlyMortgage = 0
    if (useLoan) {
      const loanAmount = purchasePrice - downPaymentAmount
      const monthlyRate = interestRate / 100 / 12
      const numPayments = loanTerm * 12
      monthlyMortgage =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
    }

    // Calculate monthly income
    const effectiveRent = monthlyRent * (1 - vacancyRate / 100)
    const effectiveOtherIncome = otherMonthlyIncome * (1 - vacancyRate / 100)
    const managementFeeAmount = (effectiveRent + effectiveOtherIncome) * (managementFee / 100)
    const netMonthlyIncome = effectiveRent + effectiveOtherIncome - managementFeeAmount

    // Calculate monthly expenses
    const monthlyExpenses = (propertyTax + totalInsurance + hoaFee + maintenance + otherCosts) / 12

    // Calculate cash flow
    const monthlyCashFlow = netMonthlyIncome - monthlyExpenses - monthlyMortgage
    const annualCashFlow = monthlyCashFlow * 12

    // Calculate returns
    const cashOnCashReturn = (annualCashFlow / totalCashInvested) * 100
    const capRate =
      ((netMonthlyIncome * 12 - (propertyTax + totalInsurance + hoaFee + maintenance + otherCosts)) / purchasePrice) *
      100

    // Calculate total return over holding period
    const finalValue = knowSellPrice ? sellPrice : purchasePrice * Math.pow(1 + valueAppreciation / 100, holdingLength)
    const sellCosts = finalValue * (costToSell / 100)
    const netSaleProceeds = finalValue - sellCosts
    const totalReturn = netSaleProceeds - totalCashInvested + annualCashFlow * holdingLength
    const annualizedReturn = (Math.pow(totalReturn / totalCashInvested, 1 / holdingLength) - 1) * 100

    setResults({
      monthlyMortgage,
      monthlyCashFlow,
      annualCashFlow,
      totalCashInvested,
      cashOnCashReturn,
      capRate,
      totalReturn,
      annualizedReturn,
    })
  }

  const clearCalculator = () => {
    setInputs({
      purchasePrice: 200000,
      useLoan: true,
      downPayment: 20,
      interestRate: 6,
      loanTerm: 30,
      closingCost: 6000,
      needRepairs: false,
      repairCost: 20000,
      valueAfterRepairs: 260000,
      monthlyRent: 2000,
      monthlyRentIncrease: 3,
      otherMonthlyIncome: 0,
      otherIncomeIncrease: 3,
      vacancyRate: 5,
      managementFee: 0,
      propertyTax: 3000,
      propertyTaxIncrease: 3,
      totalInsurance: 1200,
      insuranceIncrease: 3,
      hoaFee: 0,
      hoaIncrease: 3,
      maintenance: 2000,
      maintenanceIncrease: 3,
      otherCosts: 500,
      otherCostsIncrease: 3,
      knowSellPrice: true,
      sellPrice: 400000,
      valueAppreciation: 3,
      holdingLength: 20,
      costToSell: 8,
    })
    setResults(null)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-center gap-2">
        <Calculator className="h-6 w-6" />
        <span className="text-lg font-medium">Modify the values and click the Calculate button to use</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Purchase Section */}
          <Card>
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle>Purchase</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 items-center">
                <Label>Purchase Price</Label>
                <Input
                  type="number"
                  value={inputs.purchasePrice}
                  onChange={(e) => handleInputChange("purchasePrice", Number(e.target.value))}
                  className="text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <Label>Use Loan?</Label>
                <RadioGroup
                  value={inputs.useLoan ? "yes" : "no"}
                  onValueChange={(value) => handleInputChange("useLoan", value === "yes")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="loan-yes" />
                    <Label htmlFor="loan-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="loan-no" />
                    <Label htmlFor="loan-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {inputs.useLoan && (
                <>
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label>Down Payment</Label>
                    <Input
                      type="number"
                      value={inputs.downPayment}
                      onChange={(e) => handleInputChange("downPayment", Number(e.target.value))}
                      className="text-right"
                    />
                    <span>%</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label>Interest Rate</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={inputs.interestRate}
                      onChange={(e) => handleInputChange("interestRate", Number(e.target.value))}
                      className="text-right"
                    />
                    <span>%</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label>Loan Term</Label>
                    <Input
                      type="number"
                      value={inputs.loanTerm}
                      onChange={(e) => handleInputChange("loanTerm", Number(e.target.value))}
                      className="text-right"
                    />
                    <span>years</span>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4 items-center">
                <Label>Closing Cost</Label>
                <Input
                  type="number"
                  value={inputs.closingCost}
                  onChange={(e) => handleInputChange("closingCost", Number(e.target.value))}
                  className="text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <Label>Need Repairs?</Label>
                <RadioGroup
                  value={inputs.needRepairs ? "yes" : "no"}
                  onValueChange={(value) => handleInputChange("needRepairs", value === "yes")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="repairs-yes" />
                    <Label htmlFor="repairs-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="repairs-no" />
                    <Label htmlFor="repairs-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {inputs.needRepairs && (
                <>
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <Label>Repair Cost</Label>
                    <Input
                      type="number"
                      value={inputs.repairCost}
                      onChange={(e) => handleInputChange("repairCost", Number(e.target.value))}
                      className="text-right"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <Label>Value after Repairs</Label>
                    <Input
                      type="number"
                      value={inputs.valueAfterRepairs}
                      onChange={(e) => handleInputChange("valueAfterRepairs", Number(e.target.value))}
                      className="text-right"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recurring Operating Expenses */}
          <Card>
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle>Recurring Operating Expenses</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-4 gap-2 text-sm font-medium">
                <div></div>
                <div className="text-center">Annual</div>
                <div className="text-center">Annual</div>
                <div className="text-center">Increase</div>
              </div>

              {[
                { label: "Property Tax", field: "propertyTax", increaseField: "propertyTaxIncrease" },
                { label: "Total Insurance", field: "totalInsurance", increaseField: "insuranceIncrease" },
                { label: "HOA Fee", field: "hoaFee", increaseField: "hoaIncrease" },
                { label: "Maintenance", field: "maintenance", increaseField: "maintenanceIncrease" },
                { label: "Other Costs", field: "otherCosts", increaseField: "otherCostsIncrease" },
              ].map(({ label, field, increaseField }) => (
                <div key={field} className="grid grid-cols-4 gap-2 items-center">
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    value={inputs[field as keyof CalculatorInputs] as number}
                    onChange={(e) => handleInputChange(field as keyof CalculatorInputs, Number(e.target.value))}
                    className="text-right"
                  />
                  <Input
                    type="number"
                    value={inputs[increaseField as keyof CalculatorInputs] as number}
                    onChange={(e) => handleInputChange(increaseField as keyof CalculatorInputs, Number(e.target.value))}
                    className="text-right"
                  />
                  <span>%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Income Section */}
          <Card>
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle>Income</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-4 gap-2 text-sm font-medium">
                <div></div>
                <div></div>
                <div className="text-center">Annual</div>
                <div className="text-center">Increase</div>
              </div>

              <div className="grid grid-cols-4 gap-2 items-center">
                <Label>Monthly Rent</Label>
                <Input
                  type="number"
                  value={inputs.monthlyRent}
                  onChange={(e) => handleInputChange("monthlyRent", Number(e.target.value))}
                  className="text-right"
                />
                <Input
                  type="number"
                  value={inputs.monthlyRentIncrease}
                  onChange={(e) => handleInputChange("monthlyRentIncrease", Number(e.target.value))}
                  className="text-right"
                />
                <span>%</span>
              </div>

              <div className="grid grid-cols-4 gap-2 items-center">
                <Label>Other Monthly Income</Label>
                <Input
                  type="number"
                  value={inputs.otherMonthlyIncome}
                  onChange={(e) => handleInputChange("otherMonthlyIncome", Number(e.target.value))}
                  className="text-right"
                />
                <Input
                  type="number"
                  value={inputs.otherIncomeIncrease}
                  onChange={(e) => handleInputChange("otherIncomeIncrease", Number(e.target.value))}
                  className="text-right"
                />
                <span>%</span>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <Label>Vacancy Rate</Label>
                <Input
                  type="number"
                  value={inputs.vacancyRate}
                  onChange={(e) => handleInputChange("vacancyRate", Number(e.target.value))}
                  className="text-right"
                />
                <span>%</span>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <Label>Management Fee</Label>
                <Input
                  type="number"
                  value={inputs.managementFee}
                  onChange={(e) => handleInputChange("managementFee", Number(e.target.value))}
                  className="text-right"
                />
                <span>%</span>
              </div>
            </CardContent>
          </Card>

          {/* Sell Section */}
          <Card>
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle>Sell</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 items-center">
                <Label>Do You Know the Sell Price?</Label>
                <RadioGroup
                  value={inputs.knowSellPrice ? "yes" : "no"}
                  onValueChange={(value) => handleInputChange("knowSellPrice", value === "yes")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="sell-yes" />
                    <Label htmlFor="sell-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="sell-no" />
                    <Label htmlFor="sell-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {inputs.knowSellPrice ? (
                <div className="grid grid-cols-2 gap-4 items-center">
                  <Label>Sell Price</Label>
                  <Input
                    type="number"
                    value={inputs.sellPrice}
                    onChange={(e) => handleInputChange("sellPrice", Number(e.target.value))}
                    className="text-right"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label>Value Appreciation</Label>
                  <Input
                    type="number"
                    value={inputs.valueAppreciation}
                    onChange={(e) => handleInputChange("valueAppreciation", Number(e.target.value))}
                    className="text-right"
                  />
                  <span>% per year</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 items-center">
                <Label>Holding Length</Label>
                <Input
                  type="number"
                  value={inputs.holdingLength}
                  onChange={(e) => handleInputChange("holdingLength", Number(e.target.value))}
                  className="text-right"
                />
                <span>years</span>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <Label>Cost to Sell</Label>
                <Input
                  type="number"
                  value={inputs.costToSell}
                  onChange={(e) => handleInputChange("costToSell", Number(e.target.value))}
                  className="text-right"
                />
                <span>%</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={calculateInvestment} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Play className="h-4 w-4 mr-2" />
              Calculate
            </Button>
            <Button onClick={clearCalculator} variant="secondary" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Investment Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">${results.monthlyCashFlow.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Monthly Cash Flow</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.cashOnCashReturn.toFixed(2)}%</div>
                <div className="text-sm text-gray-600">Cash-on-Cash Return</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{results.capRate.toFixed(2)}%</div>
                <div className="text-sm text-gray-600">Cap Rate</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{results.annualizedReturn.toFixed(2)}%</div>
                <div className="text-sm text-gray-600">Annualized Return</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Total Cash Invested:</strong> ${results.totalCashInvested.toLocaleString()}
              </div>
              <div>
                <strong>Annual Cash Flow:</strong> ${results.annualCashFlow.toLocaleString()}
              </div>
              <div>
                <strong>Total Return:</strong> ${results.totalReturn.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Add named export for deployment compatibility
export { PropertyCalculator }
