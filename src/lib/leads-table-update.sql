
-- Update leads table to support storing complete estimate details
ALTER TABLE IF EXISTS leads 
ADD COLUMN IF NOT EXISTS project_name TEXT,
ADD COLUMN IF NOT EXISTS estimate_details JSONB;

-- Add comment explaining the estimate_details field
COMMENT ON COLUMN leads.estimate_details IS 'Stores complete estimate details including rooms and calculations';

-- Create an index on the project_name for faster lookups
CREATE INDEX IF NOT EXISTS leads_project_name_idx ON leads (project_name);
