import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { propertyRoeAnalysis } from '@/lib/schema';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value;
    if (!sessionToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const user = await AuthService.verifySession(sessionToken);
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const formData = await req.json();
    const {
      annualRentalIncome,
      annualExpenses,
      currentMarketValue,
      currentLoanBalance,
      annualDebtService,
      // Additional fields
      purchasePrice,
      debt,
      downPayment,
      outOfPocketReno,
      totalInitialInvestment,
      currentFmv,
      potentialEquity,
      loanTerms,
      amortization,
      interestRate,
      acquisitionDate,
      yearsHeld,
      currentPayment,
    } = formData;

    // Helper function to safely parse float values
    const parseValue = (value: any, defaultValue: number = 0) => {
      if (value === undefined || value === null || value === '') {
        return defaultValue;
      }
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    // Calculate NOI, Equity, Unlevered ROE, and Levered ROE with safety checks
    const annualIncome = parseValue(annualRentalIncome);
    const annualExp = parseValue(annualExpenses);
    const marketValue = parseValue(currentMarketValue || currentFmv);
    const loanBalance = parseValue(currentLoanBalance);
    const debtService = parseValue(annualDebtService);

    const noi = annualIncome - annualExp;
    const equity = marketValue - loanBalance;

    // Calculate ROE with safety check for division by zero
    const unleveredRoe = equity !== 0 ? (noi / equity) * 100 : 0;
    const leveredRoe = equity !== 0 ? ((noi - debtService) / equity) * 100 : 0;

    const prompt = `
      Analyze the following property's Return on Equity (ROE).
      Provide a brief analysis based on the calculated ROE values.

      Property Data:
      - Purchase Price: $${parseValue(purchasePrice)}
      - Debt: $${parseValue(debt)}
      - Down Payment: $${parseValue(downPayment)}
      - Out of Pocket Renovation: $${parseValue(outOfPocketReno)}
      - Total Initial Investment: $${parseValue(totalInitialInvestment)}
      - Current FMV: $${parseValue(currentFmv)}
      - Current Debt: $${parseValue(currentLoanBalance)}
      - Potential Equity: $${parseValue(potentialEquity)}
      - Loan Terms: ${parseValue(loanTerms)} months
      - Amortization: ${parseValue(amortization)} months
      - Interest Rate: ${parseValue(interestRate)}%
      - Acquisition Date: ${acquisitionDate || 'N/A'}
      - Years Held: ${parseValue(yearsHeld)} years
      - Current Payment: $${parseValue(currentPayment)}
      - Annual Rental Income: $${annualIncome}
      - Annual Operating Expenses: $${annualExp}
      - Current Market Value: $${marketValue}
      - Annual Debt Service: $${debtService}

      Calculated Financial Metrics:
      - Net Operating Income (NOI): $${noi.toFixed(2)}
      - Equity: $${equity.toFixed(2)}
      - Unlevered ROE: ${unleveredRoe.toFixed(2)}%
      - Levered (True Cash-Flow) ROE: ${leveredRoe.toFixed(2)}%
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
    });

    const analysisResults = completion.choices[0].message.content;

    console.log('formData:', formData);

    const db = getDb();
    const [result] = await db
      .insert(propertyRoeAnalysis)
      .values({
        userId: user.id, // Use the TypeScript field name from the schema
        purchasePrice: parseValue(purchasePrice),
        debt: parseValue(debt),
        downPayment: parseValue(downPayment),
        outOfPocketReno: parseValue(outOfPocketReno),
        totalInitialInvestment: parseValue(totalInitialInvestment),
        currentFmv: parseValue(currentFmv),
        currentDebt: parseValue(currentLoanBalance),
        potentialEquity: parseValue(potentialEquity),
        loanTerms: parseValue(loanTerms, 0),
        amortization: parseValue(amortization, 0),
        interestRate: parseValue(interestRate),
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
        yearsHeld: parseValue(yearsHeld, 0),
        currentPayment: parseValue(currentPayment),
        annualRentalIncome: annualIncome,
        annualExpenses: annualExp,
        currentMarketValue: marketValue,
        currentLoanBalance: loanBalance,
        annualDebtService: debtService,
        noi,
        equity,
        unleveredRoe,
        leveredRoe,
        analysisResults,
      })
      .returning();

    console.log('result:', result);

    return new NextResponse(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Error in property-roe-analysis:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
