"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Calculator, TrendingUp, DollarSign, PieChart, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CalculationResults {
  monthlyMortgage: number
  monthlyRent: number
  monthlyExpenses: number
  monthlyCashFlow: number
  annualCashFlow: number
  totalInvestment: number
  capRate: number
  cashOnCashReturn: number
  totalROI: number
  sellPrice: number
  totalProfit: number
  annualizedReturn: number
}

function PropertyCalculator() {
  // Property info
  const [propertyName, setPropertyName] = useState("")
  const [address, setAddress] = useState("")

  // Purchase inputs
  const [purchasePrice, setPurchasePrice] = useState(200000)
  const [useLoan, setUseLoan] = useState(true)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [interestRate, setInterestRate] = useState(6)
  const [loanTerm, setLoanTerm] = useState(30)
  const [closingCost, setClosingCost] = useState(6000)
  const [needRepairs, setNeedRepairs] = useState(false)
  const [repairCost, setRepairCost] = useState(0)
  const [valueAfterRepairs, setValueAfterRepairs] = useState(purchasePrice)

  // Income inputs
  const [monthlyRent, setMonthlyRent] = useState(2000)
  const [rentIncreasePercent, setRentIncreasePercent] = useState(3)
  const [otherMonthlyIncome, setOtherMonthlyIncome] = useState(0)
  const [otherIncomeIncreasePercent, setOtherIncomeIncreasePercent] = useState(3)
  const [vacancyRate, setVacancyRate] = useState(5)
  const [managementFee, setManagementFee] = useState(0)

  // Operating expenses
  const [propertyTax, setPropertyTax] = useState(3000)
  const [propertyTaxIncreasePercent, setPropertyTaxIncreasePercent] = useState(3)
  const [totalInsurance, setTotalInsurance] = useState(1200)
  const [insuranceIncreasePercent, setInsuranceIncreasePercent] = useState(3)
  const [hoaFee, setHoaFee] = useState(0)
  const [hoaIncreasePercent, setHoaIncreasePercent] = useState(3)
  const [maintenance, setMaintenance] = useState(2000)
  const [maintenanceIncreasePercent, setMaintenanceIncreasePercent] = useState(3)
  const [otherCosts, setOtherCosts] = useState(500)
  const [otherCostsIncreasePercent, setOtherCostsIncreasePercent] = useState(3)

  // Sell inputs
  const [knowSellPrice, setKnowSellPrice] = useState(false)
  const [sellPrice, setSellPrice] = useState(400000)
  const [valueAppreciation, setValueAppreciation] = useState(3)
  const [holdingLength, setHoldingLength] = useState(20)
  const [costToSell, setCostToSell] = useState(8)

  const [results, setResults] = useState<CalculationResults | null>(null)
  const [saving, setSaving] = useState(false)

  const calculateResults = () => {
    // Calculate down payment and loan amount
    const downPayment = (purchasePrice * downPaymentPercent) / 100
    const loanAmount = useLoan ? purchasePrice - downPayment : 0

    // Calculate monthly mortgage payment
    const monthlyInterestRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12
    let monthlyMortgage = 0

    if (useLoan && loanAmount > 0) {
      monthlyMortgage =
        (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
    }

    // Calculate effective monthly rent (accounting for vacancy)
    const effectiveMonthlyRent = monthlyRent * (1 - vacancyRate / 100)
    const effectiveOtherIncome = otherMonthlyIncome * (1 - vacancyRate / 100)
    const totalMonthlyIncome = effectiveMonthlyRent + effectiveOtherIncome

    // Calculate monthly expenses
    const monthlyPropertyTax = propertyTax / 12
    const monthlyInsurance = totalInsurance / 12
    const monthlyHoa = hoaFee / 12
    const monthlyMaintenance = maintenance / 12
    const monthlyOtherCosts = otherCosts / 12
    const monthlyManagementFee = (totalMonthlyIncome * managementFee) / 100

    const totalMonthlyExpenses =
      monthlyMortgage +
      monthlyPropertyTax +
      monthlyInsurance +
      monthlyHoa +
      monthlyMaintenance +
      monthlyOtherCosts +
      monthlyManagementFee

    // Calculate cash flow
    const monthlyCashFlow = totalMonthlyIncome - totalMonthlyExpenses
    const annualCashFlow = monthlyCashFlow * 12

    // Calculate total investment
    const totalInvestment = downPayment + closingCost + (needRepairs ? repairCost : 0)

    // Calculate returns
    const propertyValue = needRepairs ? valueAfterRepairs : purchasePrice
    const capRate = (annualCashFlow / propertyValue) * 100
    const cashOnCashReturn = (annualCashFlow / totalInvestment) * 100

    // Calculate sell scenario
    let finalSellPrice = sellPrice
    if (!knowSellPrice) {
      finalSellPrice = propertyValue * Math.pow(1 + valueAppreciation / 100, holdingLength)
    }

    const sellingCosts = (finalSellPrice * costToSell) / 100
    const remainingLoanBalance = useLoan
      ? loanAmount * Math.pow(1 + monthlyInterestRate, numberOfPayments - holdingLength * 12) -
        monthlyMortgage *
          ((Math.pow(1 + monthlyInterestRate, numberOfPayments - holdingLength * 12) - 1) / monthlyInterestRate)
      : 0

    const netSaleProceeds = finalSellPrice - sellingCosts - Math.max(0, remainingLoanBalance)
    const totalCashFlowOverHolding = annualCashFlow * holdingLength
    const totalProfit = netSaleProceeds - totalInvestment + totalCashFlowOverHolding
    const totalROI = (totalProfit / totalInvestment) * 100
    const annualizedReturn = Math.pow(1 + totalROI / 100, 1 / holdingLength) - 1

    setResults({
      monthlyMortgage,
      monthlyRent: totalMonthlyIncome,
      monthlyExpenses: totalMonthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      totalInvestment,
      capRate,
      cashOnCashReturn,
      totalROI,
      sellPrice: finalSellPrice,
      totalProfit,
      annualizedReturn: annualizedReturn * 100,
    })
  }

  const saveCalculation = async () => {
    if (!results || !propertyName.trim() || !address.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter property name, address, and calculate results before saving",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const calculationData = {
        name: propertyName,
        address: address,
        purchasePrice: purchasePrice,
        purchaseDate: new Date().toISOString().split("T")[0],
        currentValue: needRepairs ? valueAfterRepairs : purchasePrice,
        monthlyRent: monthlyRent,
        monthlyExpenses: results.monthlyExpenses,
        downPayment: (purchasePrice * downPaymentPercent) / 100,
        loanAmount: useLoan ? purchasePrice - (purchasePrice * downPaymentPercent) / 100 : 0,
        interestRate: interestRate,
        loanTermYears: loanTerm,
        propertyType: "single-family",
        status: "analyzed",
        notes: `Calculator Results - Cap Rate: ${results.capRate.toFixed(2)}%, Cash-on-Cash: ${results.cashOnCashReturn.toFixed(2)}%, Total ROI: ${results.totalROI.toFixed(2)}%`,
      }

      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calculationData),
      })

      if (!response.ok) {
        throw new Error("Failed to save calculation")
      }

      toast({
        title: "Calculation Saved",
        description: "Your property calculation has been saved to your portfolio",
      })

      // Clear form after successful save
      setPropertyName("")
      setAddress("")
      setResults(null)
    } catch (error) {
      console.error("Error saving calculation:", error)
      toast({
        title: "Error",
        description: "Failed to save calculation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const clearForm = () => {
    setPropertyName("")
    setAddress("")
    setPurchasePrice(200000)
    setUseLoan(true)
    setDownPaymentPercent(20)
    setInterestRate(6)
    setLoanTerm(30)
    setClosingCost(6000)
    setNeedRepairs(false)
    setRepairCost(0)
    setValueAfterRepairs(200000)
    setMonthlyRent(2000)
    setRentIncreasePercent(3)
    setOtherMonthlyIncome(0)
    setOtherIncomeIncreasePercent(3)
    setVacancyRate(5)
    setManagementFee(0)
    setPropertyTax(3000)
    setPropertyTaxIncreasePercent(3)
    setTotalInsurance(1200)
    setInsuranceIncreasePercent(3)
    setHoaFee(0)
    setHoaIncreasePercent(3)
    setMaintenance(2000)
    setMaintenanceIncreasePercent(3)
    setOtherCosts(500)
    setOtherCostsIncreasePercent(3)
    setKnowSellPrice(false)
    setSellPrice(400000)
    setValueAppreciation(3)
    setHoldingLength(20)
    setCostToSell(8)
    setResults(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Property Investment Calculator
        </h1>
        <p className="text-gray-600 text-lg">Modify the values and click the Calculate button to analyze your investment</p>

        {/* Property Name and Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 max-w-2xl mx-auto">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <Label htmlFor="propertyName">Property Name</Label>
            <Input
              id="propertyName"
              type="text"
              placeholder="e.g., Main Street Rental"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="e.g., 123 Main St, City, State"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <Card className="border-0 shadow-lg bg-gradient-to-b from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Purchase
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                <Label>Use Loan?</Label>
                <RadioGroup
                  value={useLoan ? "yes" : "no"}
                  onValueChange={(value) => setUseLoan(value === "yes")}
                  className="flex gap-4 mt-2"
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

              {useLoan && (
                <>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="downPayment">Down Payment</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                        className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div className="flex items-end">
                      <span className="text-sm text-gray-500 mb-2">%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="interestRate">Interest Rate</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div className="flex items-end">
                      <span className="text-sm text-gray-500 mb-2">%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="loanTerm">Loan Term</Label>
                      <Input
                        id="loanTerm"
                        type="number"
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(Number(e.target.value))}
                        className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div className="flex items-end">
                      <span className="text-sm text-gray-500 mb-2">years</span>
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
                  className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                <Label>Need Repairs?</Label>
                <RadioGroup
                  value={needRepairs ? "yes" : "no"}
                  onValueChange={(value) => setNeedRepairs(value === "yes")}
                  className="flex gap-4 mt-2"
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

              {needRepairs && (
                <>
                  <div>
                    <Label htmlFor="repairCost">Repair Cost</Label>
                    <Input
                      id="repairCost"
                      type="number"
                      value={repairCost}
                      onChange={(e) => setRepairCost(Number(e.target.value))}
                      className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valueAfterRepairs">Value after Repairs</Label>
                    <Input
                      id="valueAfterRepairs"
                      type="number"
                      value={valueAfterRepairs}
                      onChange={(e) => setValueAfterRepairs(Number(e.target.value))}
                      className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Income Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <Card className="border-0 shadow-lg bg-gradient-to-b from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Income
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="monthlyRent">Monthly Rent</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="w-20">
                  <Label htmlFor="rentIncrease">Annual Increase</Label>
                  <div className="flex gap-1 mt-1">
                    <Input
                      id="rentIncrease"
                      type="number"
                      value={rentIncreasePercent}
                      onChange={(e) => setRentIncreasePercent(Number(e.target.value))}
                      className="w-12 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm text-gray-500 mt-2">%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="otherIncome">Other Monthly Income</Label>
                  <Input
                    id="otherIncome"
                    type="number"
                    value={otherMonthlyIncome}
                    onChange={(e) => setOtherMonthlyIncome(Number(e.target.value))}
                    className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="w-20">
                  <Label htmlFor="otherIncomeIncrease">Annual Increase</Label>
                  <div className="flex gap-1 mt-1">
                    <Input
                      id="otherIncomeIncrease"
                      type="number"
                      value={otherIncomeIncreasePercent}
                      onChange={(e) => setOtherIncomeIncreasePercent(Number(e.target.value))}
                      className="w-12 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm text-gray-500 mt-2">%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="vacancyRate">Vacancy Rate</Label>
                  <Input
                    id="vacancyRate"
                    type="number"
                    value={vacancyRate}
                    onChange={(e) => setVacancyRate(Number(e.target.value))}
                    className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="flex items-end">
                  <span className="text-sm text-gray-500 mb-2">%</span>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="managementFee">Management Fee</Label>
                  <Input
                    id="managementFee"
                    type="number"
                    value={managementFee}
                    onChange={(e) => setManagementFee(Number(e.target.value))}
                    className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="flex items-end">
                  <span className="text-sm text-gray-500 mb-2">%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sell Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Card className="border-0 shadow-lg bg-gradient-to-b from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sell
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Do You Know the Sell Price?</Label>
                <RadioGroup
                  value={knowSellPrice ? "yes" : "no"}
                  onValueChange={(value) => setKnowSellPrice(value === "yes")}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="know-price-yes" />
                    <Label htmlFor="know-price-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="know-price-no" />
                    <Label htmlFor="know-price-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {knowSellPrice ? (
                <div>
                  <Label htmlFor="sellPrice">Sell Price</Label>
                  <Input
                    id="sellPrice"
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="valueAppreciation">Value Appreciation</Label>
                    <Input
                      id="valueAppreciation"
                      type="number"
                      step="0.1"
                      value={valueAppreciation}
                      onChange={(e) => setValueAppreciation(Number(e.target.value))}
                      className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div className="flex items-end">
                    <span className="text-sm text-gray-500 mb-2">% per year</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="holdingLength">Holding Length</Label>
                  <Input
                    id="holdingLength"
                    type="number"
                    value={holdingLength}
                    onChange={(e) => setHoldingLength(Number(e.target.value))}
                    className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="flex items-end">
                  <span className="text-sm text-gray-500 mb-2">years</span>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="costToSell">Cost to Sell</Label>
                  <Input
                    id="costToSell"
                    type="number"
                    value={costToSell}
                    onChange={(e) => setCostToSell(Number(e.target.value))}
                    className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="flex items-end">
                  <span className="text-sm text-gray-500 mb-2">%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recurring Operating Expenses Section */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
        <Card className="border-0 shadow-lg bg-gradient-to-b from-amber-50 to-amber-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Recurring Operating Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="propertyTax">Property Tax</Label>
                    <Input
                      id="propertyTax"
                      type="number"
                      value={propertyTax}
                      onChange={(e) => setPropertyTax(Number(e.target.value))}
                      className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Annual</p>
                  </div>
                  <div className="w-20">
                    <Label htmlFor="propertyTaxIncrease">Annual Increase</Label>
                    <div className="flex gap-1 mt-1">
                      <Input
                        id="propertyTaxIncrease"
                        type="number"
                        value={propertyTaxIncreasePercent}
                        onChange={(e) => setPropertyTaxIncreasePercent(Number(e.target.value))}
                        className="w-12 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="text-sm text-gray-500 mt-2">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="totalInsurance">Total Insurance</Label>
                    <Input
                      id="totalInsurance"
                      type="number"
                      value={totalInsurance}
                      onChange={(e) => setTotalInsurance(Number(e.target.value))}
                      className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Annual</p>
                  </div>
                  <div className="w-20">
                    <Label htmlFor="insuranceIncrease">Annual Increase</Label>
                    <div className="flex gap-1 mt-1">
                      <Input
                        id="insuranceIncrease"
                        type="number"
                        value={insuranceIncreasePercent}
                        onChange={(e) => setInsuranceIncreasePercent(Number(e.target.value))}
                        className="w-12 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="text-sm text-gray-500 mt-2">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="hoaFee">HOA Fee</Label>
                    <Input
                      id="hoaFee"
                      type="number"
                      value={hoaFee}
                      onChange={(e) => setHoaFee(Number(e.target.value))}
                      className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Annual</p>
                  </div>
                  <div className="w-20">
                    <Label htmlFor="hoaIncrease">Annual Increase</Label>
                    <div className="flex gap-1 mt-1">
                      <Input
                        id="hoaIncrease"
                        type="number"
                        value={hoaIncreasePercent}
                        onChange={(e) => setHoaIncreasePercent(Number(e.target.value))}
                        className="w-12 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="text-sm text-gray-500 mt-2">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="maintenance">Maintenance</Label>
                    <Input
                      id="maintenance"
                      type="number"
                      value={maintenance}
                      onChange={(e) => setMaintenance(Number(e.target.value))}
                      className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Annual</p>
                  </div>
                  <div className="w-20">
                    <Label htmlFor="maintenanceIncrease">Annual Increase</Label>
                    <div className="flex gap-1 mt-1">
                      <Input
                        id="maintenanceIncrease"
                        type="number"
                        value={maintenanceIncreasePercent}
                        onChange={(e) => setMaintenanceIncreasePercent(Number(e.target.value))}
                        className="w-12 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="text-sm text-gray-500 mt-2">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="otherCosts">Other Costs</Label>
                    <Input
                      id="otherCosts"
                      type="number"
                      value={otherCosts}
                      onChange={(e) => setOtherCosts(Number(e.target.value))}
                      className="mt-1 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Annual</p>
                  </div>
                  <div className="w-20">
                    <Label htmlFor="otherCostsIncrease">Annual Increase</Label>
                    <div className="flex gap-1 mt-1">
                      <Input
                        id="otherCostsIncrease"
                        type="number"
                        value={otherCostsIncreasePercent}
                        onChange={(e) => setOtherCostsIncreasePercent(Number(e.target.value))}
                        className="w-12 shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="text-sm text-gray-500 mt-2">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <Button 
          onClick={calculateResults} 
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Calculator className="h-5 w-5 mr-2" />
          Calculate
        </Button>
        <Button 
          onClick={clearForm} 
          variant="outline" 
          className="px-8 py-3 text-lg border-2 border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
        >
          Clear
        </Button>
        {results && (
          <Button
            onClick={saveCalculation}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? "Saving..." : "Save to Portfolio"}
          </Button>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
          <Card className="mt-8 border-0 shadow-xl bg-gradient-to-b from-gray-50 to-gray-100">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl">
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Investment Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Monthly Cash Flow</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Income:</span>
                      <span className="font-medium">${results.monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Expenses:</span>
                      <span className="font-medium">${results.monthlyExpenses.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold">Net Cash Flow:</span>
                      <span className={`font-bold ${results.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${results.monthlyCashFlow.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Annual Returns</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Cash Flow:</span>
                      <span className="font-medium">${results.annualCashFlow.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cap Rate:</span>
                      <span className="font-medium">{results.capRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash-on-Cash Return:</span>
                      <span className="font-medium">{results.cashOnCashReturn.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Investment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Investment:</span>
                      <span className="font-medium">${results.totalInvestment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projected Sell Price:</span>
                      <span className="font-medium">${results.sellPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Profit:</span>
                      <span className={`font-medium ${results.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${results.totalProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Total Returns</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total ROI:</span>
                      <span className={`font-bold text-lg ${results.totalROI >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {results.totalROI.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annualized Return:</span>
                      <span
                        className={`font-bold text-lg ${results.annualizedReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {results.annualizedReturn.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Export both named and default exports
export { PropertyCalculator }
export default PropertyCalculator
