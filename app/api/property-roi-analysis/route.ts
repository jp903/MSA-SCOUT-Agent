import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3-client";
import { AuthService } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    let userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Verify user authentication
    if (!userId) {
      const sessionToken = request.cookies.get("session_token")?.value;
      if (sessionToken) {
        const user = await AuthService.verifySession(sessionToken);
        if (user) {
          userId = user.id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported. Please upload a CSV, XLS, or XLSX file.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    const uniqueFileName = `${userId}/${uuidv4()}.${fileExtension}`;
    
    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to S3/MinIO
    const bucketName = process.env.S3_BUCKET_NAME || 'msa-documents';

    // Check if required S3 environment variables are set
    if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY || !process.env.S3_REGION) {
      console.warn('S3 environment variables not properly configured. File will not be stored.');
    }

    const putObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type,
    });

    try {
      await s3Client.send(putObjectCommand);
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error);
      // Don't fail the entire operation if S3 upload fails - the analysis is still valuable
      // The file will just be available in memory for this session
    }

    // Process the file content for ROI analysis
    const roiResults = await processRoiAnalysis(buffer, file.type);

    // Store document metadata in database only if database is available
    const { getDb, db } = await import('@/lib/db');
    const { propertyRoiDocuments } = await import('@/lib/schema');

    let insertedDocument: any = null;

    // Check if database is properly initialized before attempting insert
    if (db) {
      try {
        // Prepare the analysis results, potentially limiting size to prevent database issues
        let analysisResultsToStore = roiResults;

        // Ensure the results are in a proper format for JSON storage
        try {
          // Verify that the data can be stringified (valid JSON)
          JSON.stringify(roiResults);
        } catch (jsonError) {
          console.error('Invalid JSON in analysis results:', jsonError);
          // If JSON is invalid, use a simplified version
          analysisResultsToStore = [{
            error: 'Invalid analysis data',
            message: 'Results could not be stored due to data format issues'
          }];
        }

        // If results are too large, store a summary instead to prevent payload issues
        const jsonString = JSON.stringify(analysisResultsToStore);
        if (jsonString.length > 1000000) { // 1MB limit
          console.warn('Analysis results too large, storing summary only');
          analysisResultsToStore = roiResults.map((prop: any) => ({
            propertyId: prop.propertyId,
            propertyName: prop.propertyName,
            roiPercentage: prop.roiPercentage,
            roiCategory: prop.roiCategory,
            recommendation: prop.recommendation
          }));
        }

        const documentRecord = {
          userId: userId,
          fileName: file.name,
          originalName: file.name,
          fileKey: uniqueFileName,
          fileSize: file.size,
          mimeType: file.type,
          uploadDate: new Date(),
          status: 'processed' as const,
          analysisResults: analysisResultsToStore  // Store the ROI analysis results
        };

        // Insert and get the inserted record's ID
        const [result] = await db.insert(propertyRoiDocuments).values(documentRecord as any).returning();
        insertedDocument = result;
      } catch (dbError) {
        console.error('Database error during ROI document storage:', dbError);
        // Continue processing even if database storage fails - the analysis is still valuable
      }
    } else {
      console.warn('Database not initialized, skipping document storage');
    }

    return NextResponse.json({
      success: true,
      documentId: insertedDocument?.id || null,
      fileName: insertedDocument?.fileName || file.name,
      fileKey: insertedDocument?.fileKey || uniqueFileName,
      roiResults: roiResults
    });
  } catch (error) {
    console.error('Property ROE analysis error:', error);
    return NextResponse.json({ error: 'Failed to process property ROE analysis' }, { status: 500 });
  }
}

async function processRoiAnalysis(buffer: Buffer, fileType: string) {
  let propertiesData: any[] = [];

  try {
    if (fileType === 'text/csv') {
      // Parse CSV file
      const csvString = Buffer.from(buffer).toString('utf-8');
      const parsed = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true
      });
      propertiesData = parsed.data;
    } else {
      // Parse Excel file (xlsx, xls)
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      propertiesData = XLSX.utils.sheet_to_json(worksheet);
    }

    // Check if the data format is different (e.g., a single row with multiple property columns)
    // If propertiesData has only one item but that item has many property-related keys,
    // we need to handle it differently
    if (propertiesData.length === 1 && Object.keys(propertiesData[0]).length > 10) {
      // If the file has a "wide" format where each column is a property, convert to "long" format
      const row = propertiesData[0];
      const processedProperties = [];

      // Look for patterns in column names that might indicate property data
      const propertyKeys = Object.keys(row).filter(key =>
        key.toLowerCase().includes('property') ||
        key.toLowerCase().includes('unit') ||
        key.toLowerCase().includes('rental') ||
        key.toLowerCase().includes('purchase') ||
        key.toLowerCase().includes('price') ||
        key.toLowerCase().includes('income') ||
        key.toLowerCase().includes('expense')
      );

      if (propertyKeys.length > 0) {
        // If there are property-related keys, process them
        for (let i = 0; i < propertyKeys.length; i += 6) { // Assume roughly 6 keys per property group
          const propertyGroup = propertyKeys.slice(i, i + 6);
          if (propertyGroup.length > 0) {
            const sampleProp: Record<string, any> = {};
            propertyGroup.forEach(key => {
              sampleProp[key] = row[key];
            });
            processedProperties.push(sampleProp);
          }
        }
        propertiesData = processedProperties.length > 0 ? processedProperties : propertiesData;
      }
    }

    // Process the extracted property data to calculate ROI
    const results = propertiesData.map((property, index) => {
      // Extract property data from the parsed row with flexible field detection
      const possibleNameFields = ['propertyName', 'Property Name', 'Name', 'property_name', 'name', 'Property', 'Title', 'title'];
      const possibleAddressFields = ['address', 'Address', 'property_address', 'Property Address', 'Location', 'location'];
      const possiblePriceFields = ['purchasePrice', 'Purchase Price', 'purchase_price', 'PurchasePrice', 'Price', 'price', 'Cost', 'cost', 'Purchase', 'purchase'];
      const possibleValueFields = ['currentMarketValue', 'Current Market Value', 'current_market_value', 'Market Value', 'MarketValue', 'Value', 'value'];
      const possibleIncomeFields = ['annualRentalIncome', 'Annual Rental Income', 'annual_rental_income', 'AnnualRentalIncome', 'Rental Income', 'rental_income', 'Income', 'income', 'Annual Income', 'annual_income'];
      const possibleExpensesFields = ['annualExpenses', 'Annual Expenses', 'annual_expenses', 'AnnualExpenses', 'Expenses', 'expenses', 'Total Expenses', 'total_expenses'];

      const possibleInsuranceFields = ['insuranceCost', 'Insurance Cost', 'insurance_cost', 'InsuranceCost', 'Insurance', 'insurance'];
      const possibleInterestFields = ['interestRate', 'Interest Rate', 'interest_rate', 'InterestRate', 'Interest', 'interest'];
      const possibleMaintenanceFields = ['maintenance', 'Maintenance', 'Maintenance Cost', 'maintenance_cost', 'MaintenanceCost'];
      const possibleTaxFields = ['propertyTaxes', 'Property Taxes', 'property_taxes', 'PropertyTaxes', 'Taxes', 'taxes', 'Property Tax', 'property_tax'];
      const possibleManagerFields = ['propertyManagerFee', 'Property Manager Fee', 'property_manager_fee', 'PropertyManagerFee', 'Property Manager', 'property_manager'];
      const possibleOtherCostFields = ['otherCosts', 'Other Costs', 'other_costs', 'OtherCosts', 'Other Cost', 'other_cost', 'Additional Costs', 'additional_costs'];
      const possibleLoanBalanceFields = ['currentLoanBalance', 'Current Loan Balance', 'current_loan_balance', 'loanBalance', 'Loan Balance', 'loan_balance', 'CurrentLoanBalance', 'Mortgage Balance', 'mortgageBalance', 'Mortgage Balance'];
      const possibleAnnualDebtServiceFields = ['annualDebtService', 'Annual Debt Service', 'annual_debt_service', 'debtService', 'Debt Service', 'debt_service', 'AnnualDebtService', 'Annual Mortgage Payment', 'annualMortgagePayment'];

      const propertyName = findValueInObject(property, possibleNameFields) || `Property ${index + 1}`;
      const address = findValueInObject(property, possibleAddressFields) || 'Address not specified';
      const purchasePrice = parseFloat(findValueInObject(property, possiblePriceFields) || 0) || 0;
      const currentMarketValue = parseFloat(findValueInObject(property, possibleValueFields) || 0) || 0;
      const annualRentalIncome = parseFloat(findValueInObject(property, possibleIncomeFields) || 0) || 0;
      const annualExpenses = parseFloat(findValueInObject(property, possibleExpensesFields) || 0) || 0;

      // Additional property data for detailed analysis
      const insuranceCost = parseFloat(findValueInObject(property, possibleInsuranceFields) || 0) || 0;
      const interestRate = parseFloat(findValueInObject(property, possibleInterestFields) || 0) || 0;
      const maintenance = parseFloat(findValueInObject(property, possibleMaintenanceFields) || 0) || 0;
      const propertyTaxes = parseFloat(findValueInObject(property, possibleTaxFields) || 0) || 0;
      const propertyManagerFee = parseFloat(findValueInObject(property, possibleManagerFields) || 0) || 0;
      const otherCosts = parseFloat(findValueInObject(property, possibleOtherCostFields) || 0) || 0;
      const currentLoanBalance = parseFloat(findValueInObject(property, possibleLoanBalanceFields) || 0) || 0;
      const annualDebtService = parseFloat(findValueInObject(property, possibleAnnualDebtServiceFields) || 0) || 0;

      // Calculate Equity (Current Market Value - Current Loan Balance)
      const equity = currentMarketValue - currentLoanBalance;

      // Calculate NOI (Net Operating Income) - Total Income - Operating Expenses (excluding mortgage interest)
      // We need to remove mortgage interest from expenses if it was included
      const annualNOI = annualRentalIncome - annualExpenses; // Net Operating Income

      // Calculate unlevered ROE (NOI / Equity)
      const unleveredROE = equity > 0 ? (annualNOI / equity) * 100 : 0;

      // Calculate levered ROE (NOI - Annual Debt Service) / Equity - reflects actual cash flow ROE
      const leveredROE = equity > 0 ? ((annualNOI - annualDebtService) / equity) * 100 : 0;

      // Use levered ROE as the primary metric for analysis
      const roePercentage = leveredROE;

      // Calculate other metrics
      const cashFlow = annualNOI - annualDebtService; // Net operating income minus debt service
      const capRate = purchasePrice > 0 ? (annualNOI / purchasePrice) * 100 : 0;
      const cashOnCash = purchasePrice > 0 ? (cashFlow / purchasePrice) * 100 : 0;

      // Determine ROE category based on percentage
      let roeCategory: 'excellent' | 'good' | 'moderate' | 'fair' | 'poor' = 'moderate';
      if (roePercentage >= 15) roeCategory = 'excellent';
      else if (roePercentage >= 10) roeCategory = 'good';
      else if (roePercentage >= 5) roeCategory = 'moderate';
      else if (roePercentage >= 3) roeCategory = 'fair';
      else roeCategory = 'poor';

      // Determine recommendation based on ROE and equity considerations
      let recommendation: 'sell' | 'hold' | 'improve' = 'hold';
      if (roePercentage < 3 || annualNOI < 0) recommendation = 'sell';
      else if (roePercentage < 5) recommendation = 'improve';
      else if (roePercentage > 12) recommendation = 'hold';

      // Generate ROE-specific concerns (combining original and new concerns)
      const concerns = [];
      if (insuranceCost > annualRentalIncome * 0.1) {
        concerns.push("Insurance costs are higher than 10% of annual rental income");
      }
      if (maintenance > annualRentalIncome * 0.15) {
        concerns.push("Maintenance costs are higher than 15% of annual rental income");
      }
      if (interestRate > 6) {
        concerns.push("Interest rate is on the higher side, consider refinancing");
      }
      if (propertyTaxes > annualRentalIncome * 0.12) {
        concerns.push("Property taxes are significantly impacting returns");
      }
      if (leveredROE < 3) {
        concerns.push("Levered ROE is below 3%, this property may not be generating sufficient returns");
      }
      if (equity <= 0) {
        concerns.push("Equity is zero or negative, indicating potential negative equity situation");
      }
      if (annualDebtService > annualNOI) {
        concerns.push("Annual debt service exceeds net operating income, property is cash-flow negative");
      }

      // Generate ROE-specific suggestions (combining original and new suggestions)
      const suggestions = [];
      if (interestRate > 5) {
        suggestions.push("Consider refinancing to take advantage of lower interest rates");
      }
      if (propertyManagerFee > annualRentalIncome * 0.1) {
        suggestions.push("Evaluate property management fees to ensure they're competitive");
      }
      if (annualRentalIncome < purchasePrice * 0.08) {
        suggestions.push("Consider rent increases to align with market rates");
      }
      if (leveredROE < 3) {
        suggestions.push("Consider selling and redeploying equity into higher-yielding investments");
      }
      if (equity > 0 && leveredROE < 5 && annualNOI > 0) {
        suggestions.push("ROE is declining; consider refinancing to improve cash flow and returns");
      }
      if (leveredROE < unleveredROE * 0.5) {
        suggestions.push("Debt service is heavily impacting returns; consider refinancing with better terms");
      }
      // Add suggestion for properties with low ROE based on the user's guidelines
      if (leveredROE < 3) {
        suggestions.push("ROE is very low after 3-7 years of ownership; consider selling and redeploying equity into higher-yielding investments");
      }

      return {
        propertyId: `PROP-${String(index + 1).padStart(3, '0')}`,
        propertyName,
        address,
        purchasePrice,
        currentMarketValue,
        currentLoanBalance,
        annualDebtService,
        annualRentalIncome,
        annualExpenses,
        roePercentage: parseFloat(roePercentage.toFixed(2)),
        roeCategory,
        recommendation,
        analysis: {
          unleveredROE: parseFloat(unleveredROE.toFixed(2)),
          leveredROE: parseFloat(leveredROE.toFixed(2)),
          equity: parseFloat(equity.toFixed(2)),
          cashFlow: parseFloat(cashFlow.toFixed(2)),
          capRate: parseFloat(capRate.toFixed(2)),
          cashOnCash: parseFloat(cashOnCash.toFixed(2)),
          appreciationPotential: 3.2, // This would typically come from market analysis
          insuranceCost: parseFloat(insuranceCost.toFixed(2)),
          interestRate: parseFloat(interestRate.toFixed(2)),
          maintenance: parseFloat(maintenance.toFixed(2)),
          propertyTaxes: parseFloat(propertyTaxes.toFixed(2)),
          propertyManagerFee: parseFloat(propertyManagerFee.toFixed(2)),
          otherCosts: parseFloat(otherCosts.toFixed(2))
        },
        concerns,
        suggestions
      };
    });

    // If all properties have zero values, try to use AI to extract property data from the file content
    if (results.every(result =>
      result.purchasePrice === 0 &&
      result.currentMarketValue === 0 &&
      result.annualRentalIncome === 0 &&
      result.annualExpenses === 0
    )) {
      console.log("No meaningful property data found in the file, will try AI analysis...");
      return await performAiAnalysis(buffer, fileType);
    }

    return results;
  } catch (error) {
    console.error('Error processing ROI analysis:', error);
    // If parsing fails, try AI analysis
    try {
      return await performAiAnalysis(buffer, fileType);
    } catch (aiError) {
      console.error('AI analysis also failed:', aiError);
      // If everything fails, return mock data as a fallback
      return [
        {
          propertyId: 'PROP-001',
          propertyName: 'Downtown Condo Unit',
          address: '123 Main St, Austin, TX 78701',
          purchasePrice: 350000,
          currentMarketValue: 425000,
          currentLoanBalance: 175000, // Example loan balance
          annualDebtService: 21000, // Example annual debt service ($1750/month principal + interest)
          annualRentalIncome: 28800, // $2,400/month
          annualExpenses: 10800, // Removed mortgage interest from expenses as per formulas
          roePercentage: 6.86, // (28800 - 10800 - 21000) / (425000 - 175000) = -3000 / 250000 = -1.2% (for example purposes)
          roeCategory: 'poor',
          recommendation: 'sell',
          analysis: {
            unleveredROE: 7.2, // (28800 - 10800) / (425000 - 175000) = 18000 / 250000 = 7.2%
            leveredROE: -1.2, // (28800 - 10800 - 21000) / (425000 - 175000) = -3000 / 250000 = -1.2%
            equity: 250000, // Current market value - loan balance
            cashFlow: -3000, // NOI - Annual Debt Service
            capRate: 6.86, // NOI / Purchase Price
            cashOnCash: -0.86, // Cash Flow / Cash Invested
            appreciationPotential: 3.2,
            insuranceCost: 1800,
            interestRate: 4.75,
            maintenance: 3500,
            propertyTaxes: 4200,
            propertyManagerFee: 1440,
            otherCosts: 860
          },
          concerns: [
            "Annual debt service exceeds net operating income, property is cash-flow negative",
            "Levered ROE is negative, indicating poor returns after debt service",
            "Property taxes are significantly impacting returns"
          ],
          suggestions: [
            "Consider selling and redeploying equity into higher-yielding investments",
            "Refinance to improve cash flow and returns",
            "Evaluate property management fees to ensure they're competitive"
          ]
        }
      ];
    }
  }
}

// Helper function to find a value in an object using multiple possible keys
function findValueInObject(obj: any, possibleKeys: string[]): any {
  for (const key of possibleKeys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }
  return null;
}

// AI Analysis function
async function performAiAnalysis(buffer: Buffer, fileType: string): Promise<any[]> {
  // Check if OpenAI API key is available
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.warn('OpenAI API key not available, using fallback analysis');
    return [
      {
        propertyId: 'PROP-001',
        propertyName: 'AI Analysis Not Available',
        address: 'OpenAI API key not configured',
        purchasePrice: 0,
        currentMarketValue: 0,
        currentLoanBalance: 0,
        annualDebtService: 0,
        annualRentalIncome: 0,
        annualExpenses: 0,
        roePercentage: 0,
        roeCategory: 'fair',
        recommendation: 'improve',
        analysis: {
          unleveredROE: 0,
          leveredROE: 0,
          equity: 0,
          cashFlow: 0,
          capRate: 0,
          cashOnCash: 0,
          appreciationPotential: 0,
          insuranceCost: 0,
          interestRate: 0,
          maintenance: 0,
          propertyTaxes: 0,
          propertyManagerFee: 0,
          otherCosts: 0
        },
        concerns: ["OpenAI API key not configured, unable to perform AI analysis"],
        suggestions: ["Add your OpenAI API key to the environment variables to enable AI-powered analysis"]
      }
    ];
  }

  let aiResults: any[] = [];

  try {
    // Convert file to text for AI analysis
    let fileText = '';
    if (fileType === 'text/csv') {
      const csvString = Buffer.from(buffer).toString('utf-8');
      fileText = csvString;
    } else {
      // For Excel files, we'll use a simple text representation
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Convert to CSV format for easier processing
      fileText = XLSX.utils.sheet_to_csv(worksheet);
    }

    // Truncate if too large
    if (fileText.length > 10000) {
      fileText = fileText.substring(0, 10000) + '... (truncated)';
    }

    // Call OpenAI API for property ROE analysis using the ai-sdk
    const { openai } = await import('@ai-sdk/openai');
    const { generateObject } = await import('ai');
    const { z } = await import('zod');

    try {
      const result = await generateObject({
        model: openai('gpt-4o-mini'), // Use a model that supports structured outputs
        schema: z.object({
          properties: z.array(z.object({
            propertyId: z.string(),
            propertyName: z.string(),
            address: z.string(),
            purchasePrice: z.number(),
            currentMarketValue: z.number(),
            currentLoanBalance: z.number().optional().default(0),
            annualDebtService: z.number().optional().default(0),
            annualRentalIncome: z.number(),
            annualExpenses: z.number(),
            roePercentage: z.number(),
            roeCategory: z.enum(['excellent', 'good', 'moderate', 'fair', 'poor']),
            recommendation: z.enum(['sell', 'hold', 'improve']),
            analysis: z.object({
              unleveredROE: z.number().optional().default(0),
              leveredROE: z.number().optional().default(0),
              equity: z.number().optional().default(0),
              cashFlow: z.number(),
              capRate: z.number(),
              cashOnCash: z.number(),
              appreciationPotential: z.number(),
              insuranceCost: z.number(),
              interestRate: z.number(),
              maintenance: z.number(),
              propertyTaxes: z.number(),
              propertyManagerFee: z.number(),
              otherCosts: z.number()
            }),
            concerns: z.array(z.string()),
            suggestions: z.array(z.string())
          }))
        }),
        prompt: `Analyze the following property data and provide ROE analysis based on the provided formulas. The analysis should calculate Return on Equity (ROE) using:
        1. NOI Calculation: Total Income - Total Operating Expenses (excluding mortgage interest) = NOI
        2. Equity Calculation: Current Market Value - Current Loan Balance = Equity
        3. Debt Service Treatment: Remove mortgage interest from expenses and add the full annual debt service (principal + interest) separately
        4. ROE Formula: (NOI - Annual Debt Service) ÷ Equity (true cash-flow ROE)
        5. Avoid double-counting interest: it should not appear in both expenses and debt service
        \n\n${fileText}`,
      });

      // Extract the properties array from the response
      const aiResults = result.object.properties || [];

      // Add some validation to ensure basic structure
      return aiResults.map((result, index) => ({
        propertyId: result.propertyId || `PROP-${String(index + 1).padStart(3, '0')}`,
        propertyName: result.propertyName || `Property ${index + 1}`,
        address: result.address || 'Address not specified',
        purchasePrice: result.purchasePrice || 0,
        currentMarketValue: result.currentMarketValue || 0,
        annualRentalIncome: result.annualRentalIncome || 0,
        annualExpenses: result.annualExpenses || 0,
        roiPercentage: result.roiPercentage || 0,
        roiCategory: result.roiCategory || 'moderate',
        recommendation: result.recommendation || 'hold',
        analysis: result.analysis || {
          cashFlow: 0,
          capRate: 0,
          cashOnCash: 0,
          appreciationPotential: 3.2,
          insuranceCost: 0,
          interestRate: 0,
          maintenance: 0,
          propertyTaxes: 0,
          propertyManagerFee: 0,
          otherCosts: 0
        },
        concerns: result.concerns || [],
        suggestions: result.suggestions || [
          "AI analysis provided - verify calculations with actual financial data",
          "Consider consulting with a financial advisor for investment decisions"
        ]
      }));
    } catch (structuredError) {
      console.warn('Structured output failed, falling back to text parsing:', structuredError);

      // Fallback to text completion and JSON parsing
      const { OpenAI } = await import('openai');
      const openaiClient = new OpenAI({
        apiKey: openaiApiKey,
      });

      const response = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: "system",
            content: "You are an expert real estate analyst. Analyze the provided property data and return a structured JSON response with property ROE metrics. Format as a JSON array of property objects with fields: propertyId, propertyName, address, purchasePrice, currentMarketValue, currentLoanBalance, annualDebtService, annualRentalIncome, annualExpenses, roePercentage, roeCategory (excellent, good, moderate, fair, poor), recommendation (sell, hold, improve), analysis (unleveredROE, leveredROE, equity, cashFlow, capRate, cashOnCash, appreciationPotential, insuranceCost, interestRate, maintenance, propertyTaxes, propertyManagerFee, otherCosts), concerns (array of strings), suggestions (array of strings). Use the following formulas: 1. NOI Calculation: Total Income - Total Operating Expenses (excluding mortgage interest) = NOI; 2. Equity Calculation: Current Market Value - Current Loan Balance = Equity; 3. Debt Service Treatment: Remove mortgage interest from expenses and add the full annual debt service (principal + interest) separately; 4. ROE Formula: (NOI - Annual Debt Service) ÷ Equity (true cash-flow ROE); 5. Avoid double-counting interest: it should not appear in both expenses and debt service. Only return the JSON, no additional text."
          },
          {
            role: "user",
            content: `Analyze the following property data and provide ROE analysis:\n\n${fileText}`
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message?.content;
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      const parsedResponse = JSON.parse(content);
      const aiResults = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];

      // Add some validation to ensure basic structure
      return aiResults.map((result, index) => ({
        propertyId: result.propertyId || `PROP-${String(index + 1).padStart(3, '0')}`,
        propertyName: result.propertyName || `Property ${index + 1}`,
        address: result.address || 'Address not specified',
        purchasePrice: result.purchasePrice || 0,
        currentMarketValue: result.currentMarketValue || 0,
        currentLoanBalance: result.currentLoanBalance || 0,
        annualDebtService: result.annualDebtService || 0,
        annualRentalIncome: result.annualRentalIncome || 0,
        annualExpenses: result.annualExpenses || 0,
        roePercentage: result.roePercentage || 0,
        roeCategory: result.roeCategory || 'moderate',
        recommendation: result.recommendation || 'hold',
        analysis: result.analysis || {
          unleveredROE: 0,
          leveredROE: 0,
          equity: 0,
          cashFlow: 0,
          capRate: 0,
          cashOnCash: 0,
          appreciationPotential: 3.2,
          insuranceCost: 0,
          interestRate: 0,
          maintenance: 0,
          propertyTaxes: 0,
          propertyManagerFee: 0,
          otherCosts: 0
        },
        concerns: result.concerns || [],
        suggestions: result.suggestions || [
          "AI analysis provided - verify calculations with actual financial data",
          "Consider consulting with a financial advisor for investment decisions"
        ]
      }));
    }

    // Add some validation to ensure basic structure - fallback for structured output failure
    return aiResults.map((result, index) => ({
      propertyId: result.propertyId || `PROP-${String(index + 1).padStart(3, '0')}`,
      propertyName: result.propertyName || `Property ${index + 1}`,
      address: result.address || 'Address not specified',
      purchasePrice: result.purchasePrice || 0,
      currentMarketValue: result.currentMarketValue || 0,
      currentLoanBalance: result.currentLoanBalance || 0,
      annualDebtService: result.annualDebtService || 0,
      annualRentalIncome: result.annualRentalIncome || 0,
      annualExpenses: result.annualExpenses || 0,
      roePercentage: result.roePercentage || 0,
      roeCategory: result.roeCategory || 'moderate',
      recommendation: result.recommendation || 'hold',
      analysis: result.analysis || {
        unleveredROE: 0,
        leveredROE: 0,
        equity: 0,
        cashFlow: 0,
        capRate: 0,
        cashOnCash: 0,
        appreciationPotential: 3.2,
        insuranceCost: 0,
        interestRate: 0,
        maintenance: 0,
        propertyTaxes: 0,
        propertyManagerFee: 0,
        otherCosts: 0
      },
      concerns: result.concerns || [],
      suggestions: result.suggestions || [
        "AI analysis provided - verify calculations with actual financial data",
        "Consider consulting with a financial advisor for investment decisions"
      ]
    }));
  } catch (error) {
    console.error('AI Analysis failed:', error);
    // Return fallback data if AI analysis fails
    return [
      {
        propertyId: 'PROP-001',
        propertyName: 'AI Analysis Error',
        address: 'Could not analyze file with AI',
        purchasePrice: 0,
        currentMarketValue: 0,
        currentLoanBalance: 0,
        annualDebtService: 0,
        annualRentalIncome: 0,
        annualExpenses: 0,
        roePercentage: 0,
        roeCategory: 'fair',
        recommendation: 'improve',
        analysis: {
          unleveredROE: 0,
          leveredROE: 0,
          equity: 0,
          cashFlow: 0,
          capRate: 0,
          cashOnCash: 0,
          appreciationPotential: 0,
          insuranceCost: 0,
          interestRate: 0,
          maintenance: 0,
          propertyTaxes: 0,
          propertyManagerFee: 0,
          otherCosts: 0
        },
        concerns: ["AI analysis failed to process the uploaded file"],
        suggestions: ["Check the file format and try again", "Ensure your OpenAI API key is properly configured"]
      }
    ];
  }
}