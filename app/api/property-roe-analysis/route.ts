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

    const prompt = `
      Calculate the Return on Equity (ROE) based on the following property data.
      Provide the final ROE as a percentage and a brief analysis.

      Purchase Price: ${formData.purchasePrice}
      Debt: ${formData.debt}
      Down Payment: ${formData.downPayment}
      Out of Pocket Reno: ${formData.outOfPocketReno}
      Total Initial Investment: ${formData.totalInitialInvestment}
      Current FMV: ${formData.currentFmv}
      Current Debt: ${formData.currentDebt}
      Potential Equity: ${formData.potentialEquity}
      Loan Terms: ${formData.loanTerms}
      Amortization (months): ${formData.amortization}
      Interest: ${formData.interest}
      Acquisition Date: ${formData.acquisitionDate}
      Number of Years Held: ${formData.yearsHeld}
      Current Payment: ${formData.currentPayment}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
    });

    const analysisResults = completion.choices[0].message.content;

    // Extract ROE percentage from the analysis results
    const roePercentageMatch = analysisResults.match(/ROE: ([\d.]+)%/);
    const roePercentage = roePercentageMatch ? parseFloat(roePercentageMatch[1]) : null;

    const db = getDb();
    const [result] = await db
      .insert(propertyRoeAnalysis)
      .values({
        userId: user.id,
        ...formData,
        roePercentage,
        analysisResults,
      })
      .returning();

    return new NextResponse(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Error in property-roe-analysis:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
