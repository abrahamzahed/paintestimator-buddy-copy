-- First, enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables for room types and pricing
CREATE TABLE IF NOT EXISTS room_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS room_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type_id UUID REFERENCES room_types(id),
  size TEXT NOT NULL CHECK (size IN ('small', 'average', 'large')),
  base_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_type_id, size)
);

CREATE TABLE IF NOT EXISTS room_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type_id UUID REFERENCES room_types(id),
  name TEXT NOT NULL,
  addon_type TEXT NOT NULL CHECK (addon_type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_type_id, name)
);

CREATE TABLE IF NOT EXISTS paint_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  percentage_upcharge DECIMAL(5,2),
  fixed_upcharge DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS volume_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  threshold DECIMAL(10,2) NOT NULL UNIQUE,
  discount_percentage DECIMAL(5,2) NOT NULL,
  has_extra BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS special_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  discount_percentage DECIMAL(5,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price_type TEXT NOT NULL CHECK (price_type IN ('fixed', 'per_unit', 'range')),
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(category, name)
);

-- Insert room types
INSERT INTO room_types (name, description) VALUES
('Bedroom', 'Standard bedroom'),
('Master Bedroom', 'Master bedroom with potential walk-in closet'),
('Living Room', 'Living room or family room'),
('Dining Room', 'Dining room'),
('Entryway', 'Home entrance area'),
('Hallway', 'Hallway or stairway'),
('Bathroom', 'Bathroom of any size'),
('Kitchen', 'Kitchen area')
ON CONFLICT (name) DO NOTHING;

-- Insert room sizes with base prices
WITH room_types_data AS (
  SELECT id, name FROM room_types
)
INSERT INTO room_sizes (room_type_id, size, base_price)
SELECT 
  id,
  'small',
  CASE 
    WHEN name = 'Bedroom' THEN 400
    WHEN name = 'Master Bedroom' THEN 450
    WHEN name = 'Living Room' THEN 700
    WHEN name = 'Dining Room' THEN 400
    WHEN name = 'Entryway' THEN 400
    WHEN name = 'Hallway' THEN 200
    WHEN name = 'Bathroom' THEN 400
    WHEN name = 'Kitchen' THEN 400
  END
FROM room_types_data
UNION ALL
SELECT 
  id,
  'average',
  CASE 
    WHEN name = 'Bedroom' THEN 400
    WHEN name = 'Master Bedroom' THEN 550
    WHEN name = 'Living Room' THEN 1000
    WHEN name = 'Dining Room' THEN 500
    WHEN name = 'Entryway' THEN 800
    WHEN name = 'Hallway' THEN 350
    WHEN name = 'Bathroom' THEN 500
    WHEN name = 'Kitchen' THEN 500
  END
FROM room_types_data
UNION ALL
SELECT 
  id,
  'large',
  CASE 
    WHEN name = 'Bedroom' THEN 550
    WHEN name = 'Master Bedroom' THEN 750
    WHEN name = 'Living Room' THEN 1800
    WHEN name = 'Dining Room' THEN 1200
    WHEN name = 'Entryway' THEN 1200
    WHEN name = 'Hallway' THEN 500
    WHEN name = 'Bathroom' THEN 600
    WHEN name = 'Kitchen' THEN 600
  END
FROM room_types_data
ON CONFLICT (room_type_id, size) DO UPDATE SET base_price = EXCLUDED.base_price;

-- Insert standard addons
WITH room_types_data AS (
  SELECT id, name FROM room_types
)
INSERT INTO room_addons (room_type_id, name, addon_type, value, description)
SELECT id, 'Add ceiling', 'percentage', 40, 'Add ceiling painting'
FROM room_types_data
UNION ALL
SELECT id, 'Add baseboards (Brush)', 'percentage', 25, 'Add baseboard painting with brush'
FROM room_types_data
UNION ALL
SELECT id, 'Add baseboards (Spray)', 'percentage', 50, 'Add baseboard painting with spray'
FROM room_types_data
UNION ALL
SELECT id, 'High ceiling', 'fixed', 600, 'Additional cost for high ceilings'
FROM room_types_data WHERE name IN ('Living Room', 'Dining Room', 'Entryway', 'Kitchen')
UNION ALL
SELECT id, 'Add closet', 'fixed', 100, 'Add closet painting'
FROM room_types_data WHERE name IN ('Bedroom', 'Hallway')
UNION ALL
SELECT id, 'Add walk-in closet', 'fixed', 300, 'Add walk-in closet painting'
FROM room_types_data WHERE name = 'Master Bedroom'
ON CONFLICT (room_type_id, name) DO NOTHING;

-- Insert paint types
INSERT INTO paint_types (name, percentage_upcharge, fixed_upcharge, description) VALUES
('Duration', 12, 25, 'Duration paint upcharge'),
('Emerald', 17, 35, 'Emerald paint upcharge'),
('Cashmere', 5, NULL, 'Cashmere paint upcharge'),
('Harmony', 5, NULL, 'Harmony paint upcharge')
ON CONFLICT (name) DO NOTHING;

-- Insert volume discounts
INSERT INTO volume_discounts (threshold, discount_percentage, has_extra) VALUES
(2000, 5, false),
(3000, 10, false),
(4000, 15, false),
(5000, 20, false),
(6500, 20, true),
(7000, 25, false),
(8500, 25, true),
(9000, 30, false),
(10500, 30, true),
(11000, 35, false),
(12500, 35, true)
ON CONFLICT (threshold) DO NOTHING;

-- Insert special conditions
INSERT INTO special_conditions (name, discount_percentage, description) VALUES
('Empty house', 15, 'House is empty during painting'),
('No floor covering needed', 5, 'No need to cover floors')
ON CONFLICT (name) DO NOTHING;

-- Insert extras
INSERT INTO extras (category, name, price_type, min_price, max_price, unit_price, conditions) VALUES
('Doors', 'Brushed doors (1-10)', 'per_unit', NULL, NULL, 50, 'Base paint cost: $50'),
('Doors', 'Brushed doors (11-19)', 'per_unit', NULL, NULL, 40, 'Base paint cost: $50'),
('Doors', 'Brushed doors (20+)', 'per_unit', NULL, NULL, 35, 'Base paint cost: $50'),
('Doors', 'Brushed doors (30+)', 'per_unit', NULL, NULL, 30, 'Base paint cost: $50'),
('Doors', 'Sprayed doors (1-10)', 'per_unit', NULL, NULL, 75, 'Base paint cost: $50'),
('Doors', 'Sprayed doors (11-19)', 'per_unit', NULL, NULL, 65, 'Base paint cost: $50'),
('Doors', 'Sprayed doors (20+)', 'per_unit', NULL, NULL, 50, 'Base paint cost: $50'),
('Doors', 'Sprayed doors (30+)', 'per_unit', NULL, NULL, 45, 'Base paint cost: $50'),
('Windows', 'Brushed window trim', 'per_unit', NULL, NULL, 20, 'Base paint cost: $50'),
('Windows', 'Brushed window sill', 'per_unit', NULL, NULL, 10, NULL),
('Windows', 'Sprayed window trim', 'per_unit', NULL, NULL, 40, 'Base paint cost: $50'),
('Windows', 'Sprayed window sill', 'per_unit', NULL, NULL, 20, NULL),
('Fireplace', 'Brushed mantel', 'range', 70, 150, NULL, NULL),
('Fireplace', 'Sprayed mantel', 'range', 150, 300, NULL, NULL),
('Installation', 'Baseboard installation (MDF)', 'per_unit', NULL, NULL, 2, 'Per linear foot'),
('Installation', 'Baseboard installation (Other)', 'per_unit', NULL, NULL, 3, 'Per linear foot'),
('Ceiling', 'Popcorn removal and paint', 'per_unit', NULL, NULL, 4, 'Per square foot')
ON CONFLICT (category, name) DO NOTHING; 

-- Enable Row Level Security
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE paint_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE volume_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;

-- Create policies for read-only access
CREATE POLICY "Allow read access for all users" ON room_types FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON room_sizes FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON room_addons FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON paint_types FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON volume_discounts FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON special_conditions FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON extras FOR SELECT USING (true);

-- Add RLS policy for leads table to allow inserting by anonymous users
-- This is needed for the free estimator functionality
CREATE POLICY "Allow insert for anonymous users" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read for all users" ON public.leads FOR SELECT USING (true);

-- Create function to handle new user registration and auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone_number, address, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'address',
    'customer'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create or update RLS policy to allow users to access their own profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Service role can access all profiles" ON public.profiles;
CREATE POLICY "Service role can access all profiles" ON public.profiles
  USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
