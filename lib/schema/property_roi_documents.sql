-- Property ROI Analysis Documents Table
-- Stores uploaded files for property ROI analysis

CREATE TABLE property_roi_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id), -- Reference to user who uploaded the file
  file_name VARCHAR(255) NOT NULL, -- Original file name
  original_name VARCHAR(255) NOT NULL, -- Original file name for display
  file_key VARCHAR(500) NOT NULL, -- S3/MinIO key where the file is stored
  file_size BIGINT NOT NULL, -- File size in bytes
  mime_type VARCHAR(100) NOT NULL, -- MIME type of the file
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- When the file was uploaded
  status VARCHAR(50) DEFAULT 'processed', -- Status: 'processed', 'processing', 'failed'
  analysis_results JSONB, -- Store the ROI analysis results as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_roi_documents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX idx_property_roi_documents_user_id ON property_roi_documents(user_id);
CREATE INDEX idx_property_roi_documents_upload_date ON property_roi_documents(upload_date);
CREATE INDEX idx_property_roi_documents_status ON property_roi_documents(status);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function before each update
CREATE TRIGGER update_property_roi_documents_updated_at 
    BEFORE UPDATE ON property_roi_documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();