ALTER TABLE "property_roe_analysis"
ADD COLUMN "UserId" uuid,
ADD COLUMN "annual_rental_income" numeric(12, 2),
ADD COLUMN "annual_expenses" numeric(12, 2),
ADD COLUMN "current_market_value" numeric(12, 2),
ADD COLUMN "current_loan_balance" numeric(12, 2),
ADD COLUMN "annual_debt_service" numeric(12, 2),
ADD COLUMN "noi" numeric(12, 2),
ADD COLUMN "equity" numeric(12, 2),
ADD COLUMN "unlevered_roe" numeric(10, 2),
ADD COLUMN "levered_roe" numeric(10, 2);

ALTER TABLE "property_roe_analysis"
ALTER COLUMN "analysis_results" TYPE text;
