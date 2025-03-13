
import { supabase } from '@/integrations/supabase/client';

// Define TypeScript types for our database tables
export interface RoomType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Modified to accept any string for size (from database) but validate to our allowed values
export interface RoomSize {
  id: string;
  room_type_id: string;
  size: string; // Changed from 'small' | 'average' | 'large' to string
  base_price: number;
  created_at: string;
}

// Modified to accept any string for addon_type but validate to our allowed values
export interface RoomAddon {
  id: string;
  room_type_id: string | null;
  name: string;
  addon_type: string; // Changed from 'percentage' | 'fixed' to string
  value: number;
  description: string | null;
  created_at: string;
}

export interface PaintType {
  id: string;
  name: string;
  percentage_upcharge: number | null;
  fixed_upcharge: number | null;
  description: string | null;
  created_at: string;
}

export interface VolumeDiscount {
  id: string;
  threshold: number;
  discount_percentage: number;
  has_extra: boolean;
  created_at: string;
}

export interface SpecialCondition {
  id: string;
  name: string;
  discount_percentage: number;
  description: string | null;
  created_at: string;
}

// Modified to accept any string for price_type but validate to our allowed values
export interface Extra {
  id: string;
  category: string;
  name: string;
  price_type: string; // Changed from 'fixed' | 'per_unit' | 'range' to string
  min_price: number | null;
  max_price: number | null;
  unit_price: number | null;
  conditions: string | null;
  created_at: string;
}

// Helper function to fetch all pricing data
export async function fetchPricingData() {
  try {
    const [
      roomTypesRes,
      roomSizesRes,
      roomAddonsRes,
      paintTypesRes,
      volumeDiscountsRes,
      specialConditionsRes,
      extrasRes
    ] = await Promise.all([
      supabase.from('room_types').select('*'),
      supabase.from('room_sizes').select('*'),
      supabase.from('room_addons').select('*'),
      supabase.from('paint_types').select('*'),
      supabase.from('volume_discounts').select('*').order('threshold', { ascending: true }),
      supabase.from('special_conditions').select('*'),
      supabase.from('extras').select('*')
    ]);

    // Check for errors
    if (roomTypesRes.error) throw roomTypesRes.error;
    if (roomSizesRes.error) throw roomSizesRes.error;
    if (roomAddonsRes.error) throw roomAddonsRes.error;
    if (paintTypesRes.error) throw paintTypesRes.error;
    if (volumeDiscountsRes.error) throw volumeDiscountsRes.error;
    if (specialConditionsRes.error) throw specialConditionsRes.error;
    if (extrasRes.error) throw extrasRes.error;

    return {
      roomTypes: roomTypesRes.data as RoomType[],
      roomSizes: roomSizesRes.data as RoomSize[],
      roomAddons: roomAddonsRes.data as RoomAddon[],
      paintTypes: paintTypesRes.data as PaintType[],
      volumeDiscounts: volumeDiscountsRes.data as VolumeDiscount[],
      specialConditions: specialConditionsRes.data as SpecialCondition[],
      extras: extrasRes.data as Extra[]
    };
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    throw error;
  }
}
