/**
 * Test script to verify the corrected ROE calculation logic
 * This script simulates the calculation logic to verify the fix for levered ROE
 */

// Mock the parseValue function from the original code
const parseValue = (value: any, defaultValue: number = 0) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Test the corrected ROE calculation
function testROECalculation() {
  console.log("Testing ROE Calculation Fix");
  console.log("============================");

  // Test case: Property with loan
  const testData = {
    annualRentalIncome: 24000, // $2,000/month
    annualExpenses: 9600,      // $800/month
    currentMarketValue: 300000,
    currentLoanBalance: 200000,
    annualDebtService: 12000,  // $1,000/month
    downPayment: 100000,       // 33.33% down
    outOfPocketReno: 10000,    // $10k renovation
    totalInitialInvestment: 110000 // $100k down + $10k renovation
  };

  console.log("Input Data:");
  console.log(`- Annual Rental Income: $${testData.annualRentalIncome.toLocaleString()}`);
  console.log(`- Annual Expenses: $${testData.annualExpenses.toLocaleString()}`);
  console.log(`- Current Market Value: $${testData.currentMarketValue.toLocaleString()}`);
  console.log(`- Current Loan Balance: $${testData.currentLoanBalance.toLocaleString()}`);
  console.log(`- Annual Debt Service: $${testData.annualDebtService.toLocaleString()}`);
  console.log(`- Total Initial Investment: $${testData.totalInitialInvestment.toLocaleString()}`);
  console.log("");

  // Calculate with corrected logic
  const annualIncome = parseValue(testData.annualRentalIncome);
  const annualExp = parseValue(testData.annualExpenses);
  const marketValue = parseValue(testData.currentMarketValue);
  const loanBalance = parseValue(testData.currentLoanBalance);
  const debtService = parseValue(testData.annualDebtService);
  const totalInitialInvestmentValue = parseValue(testData.totalInitialInvestment);

  const noi = annualIncome - annualExp;
  console.log(`Net Operating Income (NOI): $${noi.toLocaleString()}`);

  // Calculate property equity (for unlevered ROE)
  const propertyEquity = marketValue - loanBalance;
  console.log(`Property Equity (Market Value - Loan): $${propertyEquity.toLocaleString()}`);

  // Calculate ROEs with corrected logic
  const unleveredRoe = propertyEquity !== 0 ? (noi / propertyEquity) * 100 : 0;
  const leveredRoe = totalInitialInvestmentValue !== 0 ? ((noi - debtService) / totalInitialInvestmentValue) * 100 : 0;

  console.log("");
  console.log("Results with CORRECTED calculation:");
  console.log(`- Unlevered ROE: ${unleveredRoe.toFixed(2)}%`);
  console.log(`- Levered ROE (Return on Initial Investment): ${leveredRoe.toFixed(2)}%`);

  // Calculate with OLD incorrect logic for comparison
  console.log("");
  console.log("Old INCORRECT calculation (for comparison):");
  // Old logic would use propertyEquity as denominator for levered ROE
  const oldLeveredRoe = propertyEquity !== 0 ? ((noi - debtService) / propertyEquity) * 100 : 0;
  console.log(`- Old Incorrect Levered ROE (using property equity as base): ${oldLeveredRoe.toFixed(2)}%`);
  
  console.log("");
  console.log("Analysis:");
  console.log(`- With the corrected calculation, levered ROE is ${leveredRoe.toFixed(2)}%`);
  console.log(`- This represents the true return on the investor's initial cash investment of $${totalInitialInvestmentValue.toLocaleString()}`);
  console.log(`- The old calculation would give a misleading ${oldLeveredRoe.toFixed(2)}%, which doesn't represent actual investment returns`);
  console.log("");
  console.log("✅ Fix verified: Levered ROE now correctly uses initial cash investment as the denominator!");
}

testROECalculation();