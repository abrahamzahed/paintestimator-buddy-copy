
-- Add address column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;

-- Comment explaining the change
COMMENT ON COLUMN public.profiles.address IS 'Physical address for the user';
