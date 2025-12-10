-- Property ROE Analysis Table
-- Stores form data and results from property ROE analysis
CREATE TABLE property_roe_analysis (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    purchase_price NUMERIC,
    debt NUMERIC,
    down_payment NUMERIC,
    out_of_pocket_reno NUMERIC,
    total_initial_investment NUMERIC,
    current_fmv NUMERIC,
    current_debt NUMERIC,
    potential_equity NUMERIC,
    loan_terms INTEGER,
    amortization INTEGER,
    interest_rate NUMERIC,
    acquisition_date DATE,
    years_held INTEGER,
    current_payment NUMERIC,
    roe_percentage NUMERIC,
    analysis_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_roe_analysis_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_property_roe_analysis_user_id ON property_roe_analysis(user_id);

CREATE OR REPLACE FUNCTION update_property_roe_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_property_roe_analysis_updated_at
BEFORE UPDATE ON property_roe_analysis
FOR EACH ROW
EXECUTE FUNCTION update_property_roe_analysis_updated_at();
