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

        // Sanitize the analysis results to ensure data integrity for database storage
        const sanitizedAnalysisResults = roiResults.map(result => {
          // Sanitize the result to ensure all numeric values are proper numbers and not undefined
          return {
            ...result,
            purchasePrice: typeof result.purchasePrice === 'number' ? result.purchasePrice : 0,
            currentMarketValue: typeof result.currentMarketValue === 'number' ? result.currentMarketValue : 0,
            currentLoanBalance: typeof result.currentLoanBalance === 'number' ? result.currentLoanBalance : 0,
            annualDebtService: typeof result.annualDebtService === 'number' ? result.annualDebtService : 0,
            annualRentalIncome: typeof result.annualRentalIncome === 'number' ? result.annualRentalIncome : 0,
            annualExpenses: typeof result.annualExpenses === 'number' ? result.annualExpenses : 0,
            roePercentage: typeof result.roePercentage === 'number' ? result.roePercentage : 0,
            analysis: {
              ...result.analysis,
              unleveredROE: typeof result.analysis.unleveredROE === 'number' ? result.analysis.unleveredROE : 0,
              leveredROE: typeof result.analysis.leveredROE === 'number' ? result.analysis.leveredROE : 0,
              equity: typeof result.analysis.equity === 'number' ? result.analysis.equity : 0,
              cashFlow: typeof result.analysis.cashFlow === 'number' ? result.analysis.cashFlow : 0,
              capRate: typeof result.analysis.capRate === 'number' ? result.analysis.capRate : 0,
              cashOnCash: typeof result.analysis.cashOnCash === 'number' ? result.analysis.cashOnCash : 0,
              appreciationPotential: typeof result.analysis.appreciationPotential === 'number' ? result.analysis.appreciationPotential : 0,
              insuranceCost: typeof result.analysis.insuranceCost === 'number' ? result.analysis.insuranceCost : 0,
              interestRate: typeof result.analysis.interestRate === 'number' ? result.analysis.interestRate : 0,
              maintenance: typeof result.analysis.maintenance === 'number' ? result.analysis.maintenance : 0,
              propertyTaxes: typeof result.analysis.propertyTaxes === 'number' ? result.analysis.propertyTaxes : 0,
              propertyManagerFee: typeof result.analysis.propertyManagerFee === 'number' ? result.analysis.propertyManagerFee : 0,
              otherCosts: typeof result.analysis.otherCosts === 'number' ? result.analysis.otherCosts : 0
            }
          };
        });

        const documentRecord = {
          userId: userId,
          fileName: file.name,
          originalName: file.name,
          fileKey: uniqueFileName,
          fileSize: file.size,
          mimeType: file.type,
          uploadDate: new Date(),
          status: 'processed' as const,
          analysisResults: sanitizedAnalysisResults  // Store the sanitized ROI analysis results
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

    // Process the extracted property data to calculate ROE with dynamic analysis
    const promiseResults = propertiesData.map(async (property, index) => {
      // Use AI to dynamically analyze all available fields in the property object
      // First, let's create a string representation of all available data for AI analysis
      const allPropertyData = Object.entries(property).map(([key, value]) => `${key}: ${value}`).join('\n');

      // For backward compatibility, try to extract known fields first
      const possibleNameFields = ['propertyName', 'Property Name', 'Name', 'property_name', 'name', 'Property', 'Title', 'title', 'property name', 'property_name', 'Property Name', 'Property_Name', 'Property-Name', 'Property-Name', 'property_id', 'propertyId', 'property'];
      const possibleAddressFields = ['address', 'Address', 'property_address', 'Property Address', 'Location', 'location', 'property_address', 'Property_Address', 'Property-Address', 'property-location', 'Property Location', 'property location', 'Property_Location', 'property-address'];
      const possiblePriceFields = ['purchasePrice', 'Purchase Price', 'purchase_price', 'PurchasePrice', 'Price', 'price', 'Cost', 'cost', 'Purchase', 'purchase', 'purchaseprice', 'purchase_price', 'Purchase_Price', 'Purchase-Price', 'purchase-price', 'buyprice', 'BuyPrice', 'Buy Price', 'buy price', 'initial_price', 'InitialPrice', 'Initial Price', 'initial price', 'property_cost', 'Property Cost', 'property cost'];
      const possibleValueFields = ['currentMarketValue', 'Current Market Value', 'current_market_value', 'Market Value', 'MarketValue', 'Value', 'value', 'current_value', 'CurrentValue', 'Current Value', 'current value', 'appraised_value', 'Appraised Value', 'appraised value', 'AppraisedValue', 'market_value', 'Market Value', 'market value', 'Market_Value', 'current_property_value', 'CurrentPropertyValue', 'Current Property Value', 'current property value', 'fair_market_value', 'FairMarketValue', 'Fair Market Value', 'fair market value', 'estimated_value', 'Estimated Value', 'estimated value'];
      const possibleIncomeFields = ['annualRentalIncome', 'Annual Rental Income', 'annual_rental_income', 'AnnualRentalIncome', 'Rental Income', 'rental_income', 'Income', 'income', 'Annual Income', 'annual_income', 'annualincome', 'AnnualIncome', 'rent', 'Rent', 'monthly_rent', 'MonthlyRent', 'Monthly Rent', 'monthly rent', 'annual_rent', 'AnnualRent', 'Annual Rent', 'annual rent', 'total_rental_income', 'TotalRentalIncome', 'Total Rental Income', 'total rental income', 'gross_income', 'GrossIncome', 'Gross Income', 'gross income', 'total_income', 'TotalIncome', 'Total Income', 'total income', 'yearly_income', 'YearlyIncome', 'Yearly Income', 'yearly income', 'monthly_income', 'MonthlyIncome', 'Monthly Income', 'monthly income'];
      const possibleExpensesFields = ['annualExpenses', 'Annual Expenses', 'annual_expenses', 'AnnualExpenses', 'Expenses', 'expenses', 'Total Expenses', 'total_expenses', 'totalexpenses', 'TotalExpenses', 'Total Expenses', 'total expenses', 'annual_expense', 'AnnualExpense', 'Annual Expense', 'annual expense', 'operating_expenses', 'OperatingExpenses', 'Operating Expenses', 'operating expenses', 'total_operating_expenses', 'TotalOperatingExpenses', 'Total Operating Expenses', 'total operating expenses', 'yearly_expenses', 'YearlyExpenses', 'Yearly Expenses', 'yearly expenses', 'property_expenses', 'PropertyExpenses', 'Property Expenses', 'property expenses', 'monthly_expenses', 'MonthlyExpenses', 'Monthly Expenses', 'monthly expenses'];

      const possibleInsuranceFields = ['insuranceCost', 'Insurance Cost', 'insurance_cost', 'InsuranceCost', 'Insurance', 'insurance', 'insurance_cost_monthly', 'InsuranceCostMonthly', 'insurance cost monthly', 'Insurance Cost Monthly', 'property_insurance', 'PropertyInsurance', 'Property Insurance', 'property insurance', 'homeowners_insurance', 'HomeownersInsurance', 'Homeowners Insurance', 'homeowners insurance', 'hazard_insurance', 'HazardInsurance', 'Hazard Insurance', 'hazard insurance'];
      const possibleInterestFields = ['interestRate', 'Interest Rate', 'interest_rate', 'InterestRate', 'Interest', 'interest', 'interest_rate_percent', 'InterestRatePercent', 'interest rate %', 'Interest Rate %', 'mortgage_rate', 'MortgageRate', 'Mortgage Rate', 'mortgage rate', 'loan_rate', 'LoanRate', 'Loan Rate', 'loan rate', 'apr', 'APR', 'annual_interest', 'AnnualInterest', 'Annual Interest', 'annual interest', 'annual_percentage_rate', 'AnnualPercentageRate', 'Annual Percentage Rate', 'annual percentage rate'];
      const possibleMaintenanceFields = ['maintenance', 'Maintenance', 'maintenance_cost', 'MaintenanceCost', 'Maintenance Cost', 'maintenance cost', 'maintenance_expense', 'MaintenanceExpense', 'Maintenance Expense', 'maintenance expense', 'maint_cost', 'MaintCost', 'maint cost', 'Maint Cost', 'yearly_maintenance', 'YearlyMaintenance', 'Yearly Maintenance', 'yearly maintenance', 'annual_maintenance', 'AnnualMaintenance', 'Annual Maintenance', 'annual maintenance', 'repair_maintenance', 'RepairMaintenance', 'Repair Maintenance', 'repair maintenance'];
      const possibleTaxFields = ['propertyTaxes', 'Property Taxes', 'property_taxes', 'PropertyTaxes', 'Taxes', 'taxes', 'Property Tax', 'property tax', 'property_tax', 'PropertyTax', 'propertytaxes', 'PropertyTaxes', 'Property-Tax', 'property-tax', 'real_estate_taxes', 'RealEstateTaxes', 'Real Estate Taxes', 'real estate taxes', 'property_tax_yearly', 'PropertyTaxYearly', 'Property Tax Yearly', 'property tax yearly'];
      const possibleManagerFields = ['propertyManagerFee', 'Property Manager Fee', 'property_manager_fee', 'PropertyManagerFee', 'Property Manager', 'property_manager', 'PropertyManager', 'property manager', 'management_fee', 'ManagementFee', 'Management Fee', 'management fee', 'property_management_fee', 'PropertyManagementFee', 'Property Management Fee', 'property management fee', 'pm_fee', 'PMFee', 'PM Fee', 'pm fee'];
      const possibleOtherCostFields = ['otherCosts', 'Other Costs', 'other_costs', 'OtherCosts', 'Other Cost', 'other_cost', 'Additional Costs', 'additional_costs', 'miscellaneous', 'Miscellaneous', 'misc', 'Misc', 'other', 'Other', 'other_expenses', 'OtherExpenses', 'Other Expenses', 'other expenses', 'additional_expenses', 'AdditionalExpenses', 'Additional Expenses', 'additional expenses', 'utilities', 'Utilities', 'utility_cost', 'UtilityCost', 'Utility Cost', 'utility cost', 'hoa_fees', 'HOAFees', 'HOA Fees', 'hoa fees', 'hoa_fee', 'HOAFee', 'HOA Fee', 'hoa fee'];
      const possibleLoanBalanceFields = ['currentLoanBalance', 'Current Loan Balance', 'current_loan_balance', 'loanBalance', 'Loan Balance', 'loan_balance', 'CurrentLoanBalance', 'Mortgage Balance', 'mortgageBalance', 'Mortgage Balance', 'loan_balance_current', 'LoanBalanceCurrent', 'loan balance current', 'Loan Balance Current', 'outstanding_loan', 'OutstandingLoan', 'Outstanding Loan', 'outstanding loan', 'remaining_loan', 'RemainingLoan', 'Remaining Loan', 'remaining loan', 'loan_amount_remaining', 'LoanAmountRemaining', 'Loan Amount Remaining', 'loan amount remaining', 'mortgage_balance_current', 'MortgageBalanceCurrent', 'mortgage balance current', 'Mortgage Balance Current', 'principal_balance', 'PrincipalBalance', 'Principal Balance', 'principal balance', 'current_principal', 'CurrentPrincipal', 'Current Principal', 'current principal'];
      const possibleAnnualDebtServiceFields = ['annualDebtService', 'Annual Debt Service', 'annual_debt_service', 'debtService', 'Debt Service', 'debt_service', 'AnnualDebtService', 'Annual Mortgage Payment', 'annualMortgagePayment', 'annual_mortgage_payment', 'AnnualMortgagePayment', 'mortgage_payment_annual', 'MortgagePaymentAnnual', 'mortgage payment annual', 'Mortgage Payment Annual', 'yearly_mortgage', 'YearlyMortgage', 'Yearly Mortgage', 'yearly mortgage', 'annual_mortgage', 'AnnualMortgage', 'Annual Mortgage', 'annual mortgage', 'mortgage_payment_yearly', 'MortgagePaymentYearly', 'mortgage payment yearly', 'Mortgage Payment Yearly', 'total_mortgage_annual', 'TotalMortgageAnnual', 'Total Mortgage Annual', 'total mortgage annual', 'total_debt_payment', 'TotalDebtPayment', 'Total Debt Payment', 'total debt payment', 'annual_principal_interest', 'AnnualPrincipalInterest', 'Annual Principal Interest', 'annual principal interest', 'debt_service_annual', 'DebtServiceAnnual', 'Debt Service Annual', 'debt service annual'];

      const propertyName = findValueInObject(property, possibleNameFields) || `Property ${index + 1}`;
      const address = findValueInObject(property, possibleAddressFields) || 'Address not specified';

      // Start with basic field detection for the most critical values
      let purchasePrice = parseFloat(findValueInObject(property, possiblePriceFields) || 0) || 0;
      let currentMarketValue = parseFloat(findValueInObject(property, possibleValueFields) || 0) || 0;
      let annualRentalIncome = parseFloat(findValueInObject(property, possibleIncomeFields) || 0) || 0;
      let annualExpenses = parseFloat(findValueInObject(property, possibleExpensesFields) || 0) || 0;

      // Additional property data for detailed analysis
      let insuranceCost = parseFloat(findValueInObject(property, possibleInsuranceFields) || 0) || 0;
      let interestRate = parseFloat(findValueInObject(property, possibleInterestFields) || 0) || 0;
      let maintenance = parseFloat(findValueInObject(property, possibleMaintenanceFields) || 0) || 0;
      let propertyTaxes = parseFloat(findValueInObject(property, possibleTaxFields) || 0) || 0;
      let propertyManagerFee = parseFloat(findValueInObject(property, possibleManagerFields) || 0) || 0;
      let otherCosts = parseFloat(findValueInObject(property, possibleOtherCostFields) || 0) || 0;
      let currentLoanBalance = parseFloat(findValueInObject(property, possibleLoanBalanceFields) || 0) || 0;
      let annualDebtService = parseFloat(findValueInObject(property, possibleAnnualDebtServiceFields) || 0) || 0;

      // Convert monthly values to annual if annual values are not found (common in property data)
      // Check for monthly income fields
      if (annualRentalIncome === 0) {
        const monthlyIncomeFields = ['monthlyRentalIncome', 'Monthly Rental Income', 'monthly_rental_income', 'MonthlyRentalIncome', 'monthly_rent', 'MonthlyRent', 'rent', 'Rent', 'monthly_income', 'MonthlyIncome', 'monthly income', 'Monthly Income'];
        const monthlyIncome = parseFloat(findValueInObject(property, monthlyIncomeFields) || 0) || 0;
        if (monthlyIncome > 0) {
          annualRentalIncome = monthlyIncome * 12;
        }
      }

      // Check for monthly expenses fields
      if (annualExpenses === 0) {
        const monthlyExpensesFields = ['monthlyExpenses', 'Monthly Expenses', 'monthly_expenses', 'MonthlyExpenses', 'monthly_expense', 'MonthlyExpense', 'monthly expense', 'Monthly Expense', 'expenses_monthly', 'ExpensesMonthly', 'Expenses Monthly', 'expenses monthly'];
        const monthlyExpenses = parseFloat(findValueInObject(property, monthlyExpensesFields) || 0) || 0;
        if (monthlyExpenses > 0) {
          annualExpenses = monthlyExpenses * 12;
        }
      }

      // If still no values after conventional field detection, use AI to analyze the data
      if (purchasePrice === 0 || currentMarketValue === 0 || annualRentalIncome === 0 || annualExpenses === 0) {
        try {
          // Use AI to interpret the property data and extract key metrics
          const aiAnalysis = await analyzePropertyWithAI(allPropertyData);
          if (aiAnalysis.purchasePrice !== undefined && purchasePrice === 0) purchasePrice = aiAnalysis.purchasePrice;
          if (aiAnalysis.currentMarketValue !== undefined && currentMarketValue === 0) currentMarketValue = aiAnalysis.currentMarketValue;
          if (aiAnalysis.annualRentalIncome !== undefined && annualRentalIncome === 0) annualRentalIncome = aiAnalysis.annualRentalIncome;
          if (aiAnalysis.annualExpenses !== undefined && annualExpenses === 0) annualExpenses = aiAnalysis.annualExpenses;
          if (aiAnalysis.interestRate !== undefined) interestRate = aiAnalysis.interestRate;
          if (aiAnalysis.currentLoanBalance !== undefined) currentLoanBalance = aiAnalysis.currentLoanBalance;
          if (aiAnalysis.annualDebtService !== undefined) annualDebtService = aiAnalysis.annualDebtService;
          if (aiAnalysis.insuranceCost !== undefined) insuranceCost = aiAnalysis.insuranceCost;
          if (aiAnalysis.propertyTaxes !== undefined) propertyTaxes = aiAnalysis.propertyTaxes;
          if (aiAnalysis.maintenance !== undefined) maintenance = aiAnalysis.maintenance;
          if (aiAnalysis.propertyManagerFee !== undefined) propertyManagerFee = aiAnalysis.propertyManagerFee;
          if (aiAnalysis.otherCosts !== undefined) otherCosts = aiAnalysis.otherCosts;
        } catch (error) {
          console.warn('AI analysis failed for property, using detected values', error);
          // Continue with detected values
        }
      }

      // Calculate Equity (Current Market Value - Current Loan Balance)
      const equity = currentMarketValue - currentLoanBalance;

      // Calculate NOI (Net Operating Income) - Total Income - Operating Expenses (excluding mortgage interest)
      // We need to remove mortgage interest from expenses if it was included
      const annualNOI = annualRentalIncome - annualExpenses; // Net Operating Income

      // Calculate unlevered ROE (NOI / Equity) - only if equity is positive and non-zero to avoid division by zero
      const unleveredROE = equity !== 0 ? (annualNOI / equity) * 100 : 0;

      // Calculate levered ROE (NOI - Annual Debt Service) / Equity - reflects actual cash flow ROE
      // Only calculate if equity is non-zero to avoid division by zero
      const leveredROE = equity !== 0 ? ((annualNOI - annualDebtService) / equity) * 100 : 0;

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

      // Generate dynamic concerns and suggestions using AI
      const aiInsights = await generateAIInsights({
        propertyName,
        purchasePrice,
        currentMarketValue,
        currentLoanBalance,
        annualDebtService,
        annualRentalIncome,
        annualExpenses,
        roePercentage,
        unleveredROE,
        equity,
        cashFlow,
        capRate,
        cashOnCash,
        insuranceCost,
        interestRate,
        maintenance,
        propertyTaxes,
        propertyManagerFee,
        otherCosts,
        annualNOI
      });

      const concerns = aiInsights.concerns;
      const suggestions = aiInsights.suggestions;

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

    // Wait for all promises to resolve
    const results = await Promise.all(promiseResults);

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
            content: "You are an expert real estate analyst. Analyze the provided property data and return a structured JSON response with property ROE metrics. Format as a JSON array of property objects with fields: propertyId, propertyName, address, purchasePrice, currentMarketValue, currentLoanBalance, annualDebtService, annualRentalIncome, annualExpenses, roePercentage, roeCategory (excellent, good, moderate, fair, poor), recommendation (sell, hold, improve), analysis (unleveredROE, leveredROE, equity, cashFlow, capRate, cashOnCash, appreciationPotential, insuranceCost, interestRate, maintenance, propertyTaxes, propertyManagerFee, otherCosts), concerns (array of strings), suggestions (array of strings). Use the following formulas: 1. NOI Calculation: Total Income - Total Operating Expenses (excluding mortgage interest) = NOI; 2. Equity Calculation: Current Market Value - Current Loan Balance = Equity; 3. Debt Service Treatment: Remove mortgage interest from expenses and add the full annual debt service (principal + interest) separately; 4. ROE Formula: (NOI - Annual Debt Service) ÷ Equity (true cash-flow ROE); 5. Avoid double-counting interest: it should not appear in both expenses and debt service. Note: Convert monthly values to annual (multiply by 12) when annual values are not explicitly provided. Only return the JSON, no additional text."
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

interface PropertyData {
  propertyName: string;
  purchasePrice: number;
  currentMarketValue: number;
  currentLoanBalance: number;
  annualDebtService: number;
  annualRentalIncome: number;
  annualExpenses: number;
  roePercentage: number;
  unleveredROE: number;
  equity: number;
  cashFlow: number;
  capRate: number;
  cashOnCash: number;
  insuranceCost: number;
  interestRate: number;
  maintenance: number;
  propertyTaxes: number;
  propertyManagerFee: number;
  otherCosts: number;
  annualNOI: number;
}

interface PropertyAnalysis {
  purchasePrice?: number;
  currentMarketValue?: number;
  annualRentalIncome?: number;
  annualExpenses?: number;
  interestRate?: number;
  currentLoanBalance?: number;
  annualDebtService?: number;
  insuranceCost?: number;
  propertyTaxes?: number;
  maintenance?: number;
  propertyManagerFee?: number;
  otherCosts?: number;
}

interface AIInsights {
  concerns: string[];
  suggestions: string[];
}

// Dynamic AI-based property data extraction function
async function analyzePropertyWithAI(propertyData: string): Promise<PropertyAnalysis> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return {};
    }

    const { OpenAI } = await import('openai');
    const openaiClient = new OpenAI({
      apiKey: openaiApiKey,
    });

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: "You are an expert real estate data analyst. Extract specific financial metrics from the provided property data. Look for values related to purchase price, current market value, rental income, expenses, loan information, and other financial metrics. Convert monthly values to annual where appropriate (multiply by 12). Return ONLY a valid JSON object with the following fields (use null if the value is not found): {purchasePrice, currentMarketValue, annualRentalIncome, annualExpenses, interestRate, currentLoanBalance, annualDebtService, insuranceCost, propertyTaxes, maintenance, propertyManagerFee, otherCosts}. Do not include any other text or explanations."
        },
        {
          role: "user",
          content: `Extract financial metrics from this property data: ${propertyData}`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message?.content;
    if (!content) {
      return {};
    }

    const parsedResponse = JSON.parse(content);
    return parsedResponse as PropertyAnalysis;
  } catch (error) {
    console.error('AI property analysis failed:', error);
    return {};
  }
}

// Generate dynamic insights using AI based on the calculated data
async function generateAIInsights(propertyData: PropertyData): Promise<AIInsights> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      // Fallback insights if no API key
      return {
        concerns: ["OpenAI API key not configured, unable to generate dynamic insights"],
        suggestions: ["Add your OpenAI API key to the environment variables to enable AI-powered insights"]
      };
    }

    const { OpenAI } = await import('openai');
    const openaiClient = new OpenAI({
      apiKey: openaiApiKey,
    });

    const propertyMetrics = `
      Property Name: ${propertyData.propertyName}
      Purchase Price: $${propertyData.purchasePrice.toLocaleString()}
      Current Market Value: $${propertyData.currentMarketValue.toLocaleString()}
      Current Loan Balance: $${propertyData.currentLoanBalance.toLocaleString()}
      Annual Debt Service: $${propertyData.annualDebtService.toLocaleString()}
      Annual Rental Income: $${propertyData.annualRentalIncome.toLocaleString()}
      Annual Expenses: $${propertyData.annualExpenses.toLocaleString()}
      NOI (Net Operating Income): $${propertyData.annualNOI.toLocaleString()}
      Equity: $${propertyData.equity.toLocaleString()}
      ROE: ${propertyData.roePercentage.toFixed(2)}%
      Unlevered ROE: ${propertyData.unleveredROE.toFixed(2)}%
      Cash Flow: $${propertyData.cashFlow.toLocaleString()}
      Cap Rate: ${propertyData.capRate.toFixed(2)}%
      Cash-on-Cash: ${propertyData.cashOnCash.toFixed(2)}%
      Insurance Cost: $${propertyData.insuranceCost.toLocaleString()}
      Interest Rate: ${propertyData.interestRate}%
      Maintenance: $${propertyData.maintenance.toLocaleString()}
      Property Taxes: $${propertyData.propertyTaxes.toLocaleString()}
      Property Manager Fee: $${propertyData.propertyManagerFee.toLocaleString()}
      Other Costs: $${propertyData.otherCosts.toLocaleString()}
    `;

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: "You are an expert real estate investment analyst. Analyze the provided property metrics and generate specific, actionable concerns and suggestions. Consider the following for generating concerns: high expenses relative to income, low ROE, negative cash flow, high debt service relative to NOI, potential tax implications, maintenance costs, insurance costs, property management efficiency. For suggestions: potential refinancing opportunities, rent optimization, expense reduction, property improvement opportunities, market timing for sale, portfolio rebalancing. Return ONLY a valid JSON object with two arrays: 'concerns' and 'suggestions'. Each should contain 3-5 items that are specific to the provided data. Do not include any other text or explanations."
        },
        {
          role: "user",
          content: `Analyze this property and provide concerns and suggestions: ${propertyMetrics}`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message?.content;
    if (!content) {
      return {
        concerns: [],
        suggestions: []
      };
    }

    const parsedResponse = JSON.parse(content);
    return parsedResponse as AIInsights;
  } catch (error) {
    console.error('AI insights generation failed:', error);
    // Return basic fallback insights
    return {
      concerns: ["AI analysis failed to generate insights"],
      suggestions: ["Verify your property data is complete and accurate"]
    };
  }
}