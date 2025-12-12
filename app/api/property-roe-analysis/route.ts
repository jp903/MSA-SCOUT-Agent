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
      currentDebt, // Added missing field
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

    // Helper function to safely parse date values
    const parseDate = (dateString: any) => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        // Format as ISO string (YYYY-MM-DD) which is compatible with PostgreSQL date fields
        return date.toISOString().split('T')[0];
      } catch {
        return null;
      }
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
      Analyze the following property's Return on Equity (ROE) and provide a comprehensive assessment.

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

      Please structure your analysis with the following format:

      ## 🏠 Property Overview
      [Brief description of the property based on provided metrics]

      ## 📊 Financial Performance
      [Analysis of the property's financial performance, including ROE metrics and cash flow]

      ## 📈 ROE Analysis
      - Unlevered ROE: ${unleveredRoe.toFixed(2)}%
      - Levered ROE: ${leveredRoe.toFixed(2)}%
      [Explanation of what these numbers mean]

      ## 🎯 Investment Recommendation: [SELL / HOLD / IMPROVE]
      [Clear recommendation with reasoning]

      ## ⚠️ Key Concerns
      [List main risks and concerns]

      ## 💡 Improvement Suggestions
      [Specific suggestions to improve the investment]

      ## 📊 Risk Assessment
      [Analysis of potential risks]

      ## 📅 Future Outlook
      [Assessment of future appreciation potential and trends]

      Format your response with clear headings, bullet points, and concise paragraphs. Do not list the raw data values in your response; instead, provide an analytical assessment based on the data.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [{ role: "system", content: prompt }],
    });

    // Extract and sanitize the analysis results for safe JSON transmission
    let rawAnalysisResults = completion.choices[0].message.content || '';

    // Sanitize the analysis results to ensure safe JSON transmission
    const analysisResults = typeof rawAnalysisResults === 'string'
      ? rawAnalysisResults
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
          .replace(/\0/g, '') // Remove null bytes
          .substring(0, 8000) // Limit length
      : 'Detailed analysis is temporarily unavailable.';

    console.log('formData:', formData);

    // Prepare the values object to log for debugging
    const valuesToInsert = {
      userId: user.id, // Use the TypeScript field name from the schema
      purchasePrice: parseValue(purchasePrice, 0).toFixed(2),
      debt: parseValue(debt, 0).toFixed(2),
      downPayment: parseValue(downPayment, 0).toFixed(2),
      outOfPocketReno: parseValue(outOfPocketReno, 0).toFixed(2),
      totalInitialInvestment: parseValue(totalInitialInvestment, 0).toFixed(2),
      currentFmv: parseValue(currentFmv, 0).toFixed(2),
      currentDebt: parseValue(currentDebt, 0).toFixed(2),
      potentialEquity: parseValue(potentialEquity, 0).toFixed(2),
      loanTerms: Math.round(parseValue(loanTerms, 0)),
      amortization: Math.round(parseValue(amortization, 0)),
      interestRate: parseValue(interestRate, 0).toFixed(3),
      acquisitionDate: parseDate(acquisitionDate),
      yearsHeld: Math.round(parseValue(yearsHeld, 0)),
      currentPayment: parseValue(currentPayment, 0).toFixed(2),
      annualRentalIncome: parseValue(annualRentalIncome, 0).toFixed(2),
      annualExpenses: parseValue(annualExpenses, 0).toFixed(2),
      currentMarketValue: parseValue(currentMarketValue || currentFmv, 0).toFixed(2),
      currentLoanBalance: parseValue(currentLoanBalance || currentDebt, 0).toFixed(2), // fallback to currentDebt if currentLoanBalance is not provided
      annualDebtService: parseValue(annualDebtService, 0).toFixed(2),
      noi: parseValue(noi, 0).toFixed(2),
      equity: parseValue(equity, 0).toFixed(2),
      unleveredRoe: parseValue(unleveredRoe, 0).toFixed(4),
      leveredRoe: parseValue(leveredRoe, 0).toFixed(4),
      analysisResults,
    };

    // Determine recommendation based on ROE values
    let recommendation = 'hold';
    let roeCategory = 'moderate';

    // Determine ROE category and recommendation
    const leveredRoeValue = Number(leveredRoe.toFixed(2));
    if (leveredRoeValue > 15) {
        roeCategory = 'excellent';
        recommendation = 'hold';
    } else if (leveredRoeValue > 10) {
        roeCategory = 'good';
        recommendation = 'hold';
    } else if (leveredRoeValue > 5) {
        roeCategory = 'moderate';
        recommendation = 'hold';
    } else if (leveredRoeValue > 0) {
        roeCategory = 'fair';
        recommendation = 'evaluate';
    } else {
        roeCategory = 'poor';
        recommendation = 'sell';
    }

    // Instead of saving to database, return the calculated values directly
    const result = {
      id: user.id + '-' + Date.now(), // Generate a unique ID for this analysis
      userId: user.id,
      purchasePrice: Number(parseValue(purchasePrice, 0).toFixed(2)),
      debt: Number(parseValue(debt, 0).toFixed(2)),
      downPayment: Number(parseValue(downPayment, 0).toFixed(2)),
      outOfPocketReno: Number(parseValue(outOfPocketReno, 0).toFixed(2)),
      totalInitialInvestment: Number(parseValue(totalInitialInvestment, 0).toFixed(2)),
      currentFmv: Number(parseValue(currentFmv, 0).toFixed(2)),
      currentDebt: Number(parseValue(currentDebt, 0).toFixed(2)),
      potentialEquity: Number(parseValue(potentialEquity, 0).toFixed(2)),
      loanTerms: Math.round(parseValue(loanTerms, 0)),
      amortization: Math.round(parseValue(amortization, 0)),
      interestRate: Number(parseValue(interestRate, 0).toFixed(3)),
      acquisitionDate: parseDate(acquisitionDate),
      yearsHeld: Math.round(parseValue(yearsHeld, 0)),
      currentPayment: Number(parseValue(currentPayment, 0).toFixed(2)),
      annualRentalIncome: Number(parseValue(annualRentalIncome, 0).toFixed(2)),
      annualExpenses: Number(parseValue(annualExpenses, 0).toFixed(2)),
      currentMarketValue: Number(parseValue(currentMarketValue || currentFmv, 0).toFixed(2)),
      currentLoanBalance: Number(parseValue(currentLoanBalance || currentDebt, 0).toFixed(2)),
      annualDebtService: Number(parseValue(annualDebtService, 0).toFixed(2)),
      noi: Number(parseValue(noi, 0).toFixed(2)),
      equity: Number(parseValue(equity, 0).toFixed(2)),
      unleveredRoe: Number(parseValue(unleveredRoe, 0).toFixed(4)),
      leveredRoe: Number(parseValue(leveredRoe, 0).toFixed(4)),
      analysisResults,
      // Include calculated metrics for frontend display
      calculatedMetrics: {
        unleveredROE: Number(unleveredRoe.toFixed(2)),
        leveredROE: Number(leveredRoe.toFixed(2)),
        netOperatingIncome: Number(noi.toFixed(2)),
        equityValue: Number(equity.toFixed(2)),
        debtService: Number(debtService.toFixed(2)),
        annualIncome: Number(annualIncome.toFixed(2)),
        annualExpenses: Number(annualExp.toFixed(2)),
      },
      // Structured analysis data for frontend
      roeCategory,
      recommendation,
      analysisSummary: {
        category: roeCategory,
        recommendation,
        performance: leveredRoeValue > 0 ? 'positive' : 'negative',
        cashFlow: (annualIncome - annualExp - debtService).toFixed(2),
        capRate: ((annualIncome - annualExp) / marketValue * 100).toFixed(2) + '%',
        cashOnCash: ((annualIncome - annualExp - debtService) / (parseValue(downPayment, 0) + parseValue(outOfPocketReno, 0)) * 100).toFixed(2) + '%',
      },
      // Data for potential graph generation
      graphData: {
        roeComparison: {
          unlevered: Number(unleveredRoe.toFixed(2)),
          levered: Number(leveredRoe.toFixed(2)),
        },
        incomeExpenses: {
          income: Number(annualIncome.toFixed(2)),
          expenses: Number(annualExp.toFixed(2)),
          debtService: Number(debtService.toFixed(2)),
        },
        equityGrowth: {
          initial: Number(parseValue(downPayment, 0).toFixed(2)),
          current: Number(equity.toFixed(2)),
        }
      }
    };

    console.log('Calculated result:', result);

    return new NextResponse(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Error in property-roe-analysis:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
