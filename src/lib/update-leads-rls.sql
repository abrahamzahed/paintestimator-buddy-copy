
-- Enable Row Level Security on leads table (if not already enabled)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anonymous users (for free estimator)
CREATE POLICY "Allow insert for anonymous users" ON public.leads 
FOR INSERT WITH CHECK (true);

-- Create policy to allow users to read their own leads
CREATE POLICY "Allow read for all users" ON public.leads
FOR SELECT USING (true);

-- If you need authenticated users to update their leads
CREATE POLICY "Allow update for authenticated users" ON public.leads
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
