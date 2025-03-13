
-- Add address column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS address text;

-- Comment explaining the change
COMMENT ON COLUMN public.leads.address IS 'Physical address for the painting project location';
