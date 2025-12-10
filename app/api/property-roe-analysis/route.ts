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
    } = formData;

    // Calculate NOI, Equity, Unlevered ROE, and Levered ROE
    const noi = parseFloat(annualRentalIncome) - parseFloat(annualExpenses);
    const equity = parseFloat(currentMarketValue) - parseFloat(currentLoanBalance);
    const unleveredRoe = (noi / equity) * 100;
    const leveredRoe = ((noi - parseFloat(annualDebtService)) / equity) * 100;

    const prompt = `
      Analyze the following property's Return on Equity (ROE).
      Provide a brief analysis based on the calculated ROE values.

      Property Data:
      - Annual Rental Income: $${annualRentalIncome}
      - Annual Operating Expenses: $${annualExpenses}
      - Current Market Value: $${currentMarketValue}
      - Current Loan Balance: $${currentLoanBalance}
      - Annual Debt Service: $${annualDebtService}

      Calculated ROE:
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
        userId: user.id,
        ...formData,
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
