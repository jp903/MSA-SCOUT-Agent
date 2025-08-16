"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calculator, TrendingUp, RefreshCw } from "lucide-react"

interface CalculationResults {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  monthlyRental: number
  effectiveMonthlyRent: number
  monthlyCashFlow: number
  annualCashFlow: number
  roi: number
  capRate: number
  breakEvenRatio: number
  totalCashInvested: number
  projectedSellPrice: number
  totalReturn: number
  annualizedReturn: number
}

const PropertyCalculator = () => {
  // Purchase inputs
  const [purchasePrice, setPurchasePrice] = useState<number>(200000)
  const [useLoan, setUseLoan] = useState<string>("yes")
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20)
  const [interestRate, setInterestRate] = useState<number>(6)
  const [loanTerm, setLoanTerm] = useState<number>(30)
  const [closingCost, setClosingCost] = useState<number>(6000)
  const [needRepairs, setNeedRepairs] = useState<string>("no")
  const [repairCost, setRepairCost] = useState<number>(20000)
  const [valueAfterRepairs, setValueAfterRepairs] = useState<number>(260000)

  // Income inputs
  const [monthlyRent, setMonthlyRent] = useState<number>(2000)
  const [rentAnnualIncrease, setRentAnnualIncrease] = useState<number>(3)
  const [otherMonthlyIncome, setOtherMonthlyIncome] = useState<number>(0)
  const [otherIncomeAnnualIncrease, setOtherIncomeAnnualIncrease] = useState<number>(3)
  const [vacancyRate, setVacancyRate] = useState<number>(5)
  const [managementFee, setManagementFee] = useState<number>(0)

  // Operating expenses
  const [propertyTax, setPropertyTax] = useState<number>(3000)
  const [taxAnnualIncrease, setTaxAnnualIncrease] = useState<number>(3)
  const [totalInsurance, setTotalInsurance] = useState<number>(1200)
  const [insuranceAnnualIncrease, setInsuranceAnnualIncrease] = useState<number>(3)
  const [hoaFee, setHoaFee] = useState<number>(0)
  const [hoaAnnualIncrease, setHoaAnnualIncrease] = useState<number>(3)
  const [maintenance, setMaintenance] = useState<number>(2000)
  const [maintenanceAnnualIncrease, setMaintenanceAnnualIncrease] = useState<number>(3)
  const [otherCosts, setOtherCosts] = useState<number>(500)
  const [otherCostsAnnualIncrease, setOtherCostsAnnualIncrease] = useState<number>(3)

  // Sell inputs
  const [knowSellPrice, setKnowSellPrice] = useState<string>("no")
  const [sellPrice, setSellPrice] = useState<number>(400000)
  const [valueAppreciation, setValueAppreciation] = useState<number>(3)
  const [holdingLength, setHoldingLength] = useState<number>(20)
  const [costToSell, setCostToSell] = useState<number>(8)

  const [results, setResults] = useState<CalculationResults | null>(null)

  const calculateInvestment = () => {
    const downPayment = useLoan === "yes" ? (purchasePrice * downPaymentPercent) / 100 : 0
    const loanAmount = useLoan === "yes" ? purchasePrice - downPayment : 0
    const totalInitialInvestment = downPayment + closingCost + (needRepairs === "yes" ? repairCost : 0)

    // Monthly payment calculation
    let monthlyPayment = 0
    let totalInterest = 0

    if (useLoan === "yes" && loanAmount > 0) {
      const monthlyRate = interestRate / 100 / 12
      const numberOfPayments = loanTerm * 12

      monthlyPayment =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

      totalInterest = monthlyPayment * numberOfPayments - loanAmount
    }

    // Income calculations
    const effectiveMonthlyRent = monthlyRent * (1 - vacancyRate / 100)
    const effectiveOtherIncome = otherMonthlyIncome * (1 - vacancyRate / 100)
    const totalMonthlyIncome = effectiveMonthlyRent + effectiveOtherIncome
    const managementFeeAmount = (totalMonthlyIncome * managementFee) / 100

    // Operating expenses
    const monthlyPropertyTax = propertyTax / 12
    const monthlyInsurance = totalInsurance / 12
    const monthlyHoa = hoaFee / 12
    const monthlyMaintenance = maintenance / 12
    const monthlyOtherCosts = otherCosts / 12

    const totalMonthlyExpenses =
      monthlyPropertyTax + monthlyInsurance + monthlyHoa + monthlyMaintenance + monthlyOtherCosts + managementFeeAmount

    // Cash flow
    const monthlyCashFlow = totalMonthlyIncome - monthlyPayment - totalMonthlyExpenses
    const annualCashFlow = monthlyCashFlow * 12

    // ROI calculations
    const roi = totalInitialInvestment > 0 ? (annualCashFlow / totalInitialInvestment) * 100 : 0
    const currentValue = needRepairs === "yes" ? valueAfterRepairs : purchasePrice
    const capRate = ((totalMonthlyIncome * 12 - totalMonthlyExpenses * 12) / currentValue) * 100
    const breakEvenRatio = totalMonthlyExpenses / totalMonthlyIncome

    // Projected sell price
    const projectedSellPrice =
      knowSellPrice === "yes" ? sellPrice : currentValue * Math.pow(1 + valueAppreciation / 100, holdingLength)

    const sellCosts = projectedSellPrice * (costToSell / 100)
    const netSellProceeds = projectedSellPrice - sellCosts
    const remainingLoanBalance =
      useLoan === "yes" ? Math.max(0, loanAmount - (monthlyPayment * 12 * holdingLength - totalInterest)) : 0

    const totalCashFromSale = netSellProceeds - remainingLoanBalance
    const totalCashFlow = annualCashFlow * holdingLength
    const totalReturn = totalCashFromSale + totalCashFlow - totalInitialInvestment
    const annualizedReturn =
      totalInitialInvestment > 0
        ? Math.pow((totalReturn + totalInitialInvestment) / totalInitialInvestment, 1 / holdingLength) - 1
        : 0

    setResults({
      monthlyPayment,
      totalInterest,
      totalPayment: monthlyPayment * loanTerm * 12,
      monthlyRental: monthlyRent,
      effectiveMonthlyRent,
      monthlyCashFlow,
      annualCashFlow,
      roi,
      capRate,
      breakEvenRatio,
      totalCashInvested: totalInitialInvestment,
      projectedSellPrice,
      totalReturn,
      annualizedReturn: annualizedReturn * 100,
    })
  }

  const clearInputs = () => {
    setPurchasePrice(200000)
    setUseLoan("yes")
    setDownPaymentPercent(20)
    setInterestRate(6)
    setLoanTerm(30)
    setClosingCost(6000)
    setNeedRepairs("no")
    setRepairCost(20000)
    setValueAfterRepairs(260000)
    setMonthlyRent(2000)
    setRentAnnualIncrease(3)
    setOtherMonthlyIncome(0)
    setOtherIncomeAnnualIncrease(3)
    setVacancyRate(5)
    setManagementFee(0)
    setPropertyTax(3000)
    setTaxAnnualIncrease(3)
    setTotalInsurance(1200)
    setInsuranceAnnualIncrease(3)
    setHoaFee(0)
    setHoaAnnualIncrease(3)
    setMaintenance(2000)
    setMaintenanceAnnualIncrease(3)
    setOtherCosts(500)
    setOtherCostsAnnualIncrease(3)
    setKnowSellPrice("no")
    setSellPrice(400000)
    setValueAppreciation(3)
    setHoldingLength(20)
    setCostToSell(8)
    setResults(null)
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Property Investment Calculator</h1>
        <p className="text-gray-600">Comprehensive analysis with purchase, income, expenses, and sale projections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Section */}
        <Card>
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle>Purchase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="text-lg font-medium"
              />
            </div>

            <div>
              <Label>Use Loan?</Label>
              <RadioGroup value={useLoan} onValueChange={setUseLoan} className="flex space-x-4">
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

            {useLoan === "yes" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="downPayment">Down Payment</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <span className="text-sm text-gray-600 mb-2">%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="interestRate">Interest Rate</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <span className="text-sm text-gray-600 mb-2">%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="loanTerm">Loan Term</Label>
                    <Input
                      id="loanTerm"
                      type="number"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <span className="text-sm text-gray-600 mb-2">years</span>
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="closingCost">Closing Cost</Label>
              <Input
                id="closingCost"
                type="number"
                value={closingCost}
                onChange={(e) => setClosingCost(Number(e.target.value))}
              />
            </div>

            <div>
              <Label>Need Repairs?</Label>
              <RadioGroup value={needRepairs} onValueChange={setNeedRepairs} className="flex space-x-4">
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

            {needRepairs === "yes" && (
              <>
                <div>
                  <Label htmlFor="repairCost">Repair Cost</Label>
                  <Input
                    id="repairCost"
                    type="number"
                    value={repairCost}
                    onChange={(e) => setRepairCost(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="valueAfterRepairs">Value after Repairs</Label>
                  <Input
                    id="valueAfterRepairs"
                    type="number"
                    value={valueAfterRepairs}
                    onChange={(e) => setValueAfterRepairs(Number(e.target.value))}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Income and Expenses Section */}
        <Card>
          <CardContent className="p-0 space-y-0">
            {/* Income Section */}
            <div>
              <div className="bg-blue-600 text-white p-4">
                <h3 className="font-semibold text-lg">Income</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="monthlyRent">Monthly Rent</Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Annual Increase</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={rentAnnualIncrease}
                        onChange={(e) => setRentAnnualIncrease(Number(e.target.value))}
                        className="text-sm"
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="otherIncome">Other Monthly Income</Label>
                    <Input
                      id="otherIncome"
                      type="number"
                      value={otherMonthlyIncome}
                      onChange={(e) => setOtherMonthlyIncome(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Annual Increase</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={otherIncomeAnnualIncrease}
                        onChange={(e) => setOtherIncomeAnnualIncrease(Number(e.target.value))}
                        className="text-sm"
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="vacancyRate">Vacancy Rate</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        id="vacancyRate"
                        type="number"
                        value={vacancyRate}
                        onChange={(e) => setVacancyRate(Number(e.target.value))}
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="managementFee">Management Fee</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        id="managementFee"
                        type="number"
                        value={managementFee}
                        onChange={(e) => setManagementFee(Number(e.target.value))}
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Expenses Section */}
            <div>
              <div className="bg-blue-600 text-white p-4">
                <h3 className="font-semibold text-lg">Recurring Operating Expenses</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span></span>
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-center font-medium">Annual</span>
                    <span className="text-center font-medium">Annual Increase</span>
                  </div>
                </div>

                {[
                  {
                    label: "Property Tax",
                    value: propertyTax,
                    setValue: setPropertyTax,
                    increase: taxAnnualIncrease,
                    setIncrease: setTaxAnnualIncrease,
                  },
                  {
                    label: "Total Insurance",
                    value: totalInsurance,
                    setValue: setTotalInsurance,
                    increase: insuranceAnnualIncrease,
                    setIncrease: setInsuranceAnnualIncrease,
                  },
                  {
                    label: "HOA Fee",
                    value: hoaFee,
                    setValue: setHoaFee,
                    increase: hoaAnnualIncrease,
                    setIncrease: setHoaAnnualIncrease,
                  },
                  {
                    label: "Maintenance",
                    value: maintenance,
                    setValue: setMaintenance,
                    increase: maintenanceAnnualIncrease,
                    setIncrease: setMaintenanceAnnualIncrease,
                  },
                  {
                    label: "Other Costs",
                    value: otherCosts,
                    setValue: setOtherCosts,
                    increase: otherCostsAnnualIncrease,
                    setIncrease: setOtherCostsAnnualIncrease,
                  },
                ].map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Label className="self-center">{item.label}</Label>
                    <div className="grid grid-cols-2 gap-1">
                      <Input
                        type="number"
                        value={item.value}
                        onChange={(e) => item.setValue(Number(e.target.value))}
                        className="text-sm"
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.increase}
                          onChange={(e) => item.setIncrease(Number(e.target.value))}
                          className="text-sm"
                        />
                        <span className="text-xs">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sell Section */}
        <Card>
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle>Sell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <Label>Do You Know the Sell Price?</Label>
              <RadioGroup value={knowSellPrice} onValueChange={setKnowSellPrice} className="flex space-x-4">
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

            {knowSellPrice === "yes" ? (
              <div>
                <Label htmlFor="sellPrice">Sell Price</Label>
                <Input
                  id="sellPrice"
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Number(e.target.value))}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="valueAppreciation">Value Appreciation</Label>
                  <Input
                    id="valueAppreciation"
                    type="number"
                    value={valueAppreciation}
                    onChange={(e) => setValueAppreciation(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-end">
                  <span className="text-sm text-gray-600 mb-2">% per year</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="holdingLength">Holding Length</Label>
                <Input
                  id="holdingLength"
                  type="number"
                  value={holdingLength}
                  onChange={(e) => setHoldingLength(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end">
                <span className="text-sm text-gray-600 mb-2">years</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="costToSell">Cost to Sell</Label>
                <Input
                  id="costToSell"
                  type="number"
                  value={costToSell}
                  onChange={(e) => setCostToSell(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end">
                <span className="text-sm text-gray-600 mb-2">%</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={calculateInvestment} className="flex-1 bg-green-600 hover:bg-green-700">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
              <Button onClick={clearInputs} variant="outline" className="flex-1 bg-transparent">
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Investment Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-600 font-medium text-sm">Monthly Cash Flow</p>
                <p className={`text-2xl font-bold ${results.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(results.monthlyCashFlow)}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-600 font-medium text-sm">Annual Cash Flow</p>
                <p className={`text-2xl font-bold ${results.annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(results.annualCashFlow)}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-600 font-medium text-sm">ROI</p>
                <p className={`text-2xl font-bold ${getRoiColor(results.roi)}`}>{formatPercentage(results.roi)}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-purple-600 font-medium text-sm">Cap Rate</p>
                <p className="text-2xl font-bold text-purple-800">{formatPercentage(results.capRate)}</p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-indigo-600 font-medium text-sm">Total Cash Invested</p>
                <p className="text-2xl font-bold text-indigo-800">{formatCurrency(results.totalCashInvested)}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 font-medium text-sm">Projected Sell Price</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(results.projectedSellPrice)}</p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-emerald-600 font-medium text-sm">Total Return</p>
                <p className={`text-2xl font-bold ${results.totalReturn >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(results.totalReturn)}
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-orange-600 font-medium text-sm">Annualized Return</p>
                <p className={`text-2xl font-bold ${getRoiColor(results.annualizedReturn)}`}>
                  {formatPercentage(results.annualizedReturn)}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg border-2 border-dashed">
              <h4 className="font-semibold mb-2">Investment Quality Assessment</h4>
              {results.annualizedReturn >= 15 ? (
                <p className="text-green-600 font-medium">
                  🎯 Excellent Investment - High returns with strong cash flow
                </p>
              ) : results.annualizedReturn >= 10 ? (
                <p className="text-yellow-600 font-medium">⚡ Good Investment - Solid returns and reasonable risk</p>
              ) : results.annualizedReturn >= 5 ? (
                <p className="text-orange-600 font-medium">⚠️ Fair Investment - Consider market alternatives</p>
              ) : (
                <p className="text-red-600 font-medium">❌ Poor Investment - High risk with low returns</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { PropertyCalculator }
export default PropertyCalculator
