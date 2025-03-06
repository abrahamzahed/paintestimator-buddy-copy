
// This file provides TypeScript types for our Supabase database tables
// Since we can't modify the types.ts file directly, we're defining them here

export interface ProfileTable {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: "admin" | "staff" | "customer";
  created_at?: string;
  updated_at?: string;
}

export interface ProjectTable {
  id?: string;
  name: string;
  user_id?: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeadTable {
  id?: string;
  user_id?: string;
  project_id?: string;
  project_name?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  service_type: string;
  description?: string;
  room_count?: number;
  square_footage?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  preferred_contact_method?: string;
  best_time_to_call?: string;
  preferred_timeline?: string;
}

export interface EstimateTable {
  id?: string;
  lead_id: string;
  project_id?: string;
  project_name?: string;
  details: Record<string, any>;
  labor_cost: number;
  material_cost: number;
  total_cost: number;
  estimated_hours: number;
  estimated_paint_gallons?: number;
  notes?: string;
  discount?: number;
  status?: string;
  status_type?: string;
  created_at?: string;
  updated_at?: string;
  room_types?: string[];
  room_sizes?: string[];
  wall_counts?: number[];
  wall_heights?: number[];
  wall_widths?: number[];
  wall_conditions?: string[];
  paint_types?: string[];
  include_ceilings?: boolean[];
  include_baseboards?: boolean[];
  baseboards_methods?: string[];
  include_crown_moldings?: boolean[];
  has_high_ceilings?: boolean[];
  include_closets?: boolean[];
  doors_count_per_room?: number[];
  windows_count_per_room?: number[];
  is_empty_house?: boolean;
  needs_floor_covering?: boolean;
  preferred_contact_method?: string;
  best_time_to_call?: string;
  preferred_timeline?: string;
  availability_windows?: string[];
  paint_quality_descriptions?: string[];
  paint_coverage_calculations?: number[];
}

export interface InvoiceTable {
  id?: string;
  estimate_id: string;
  stripe_payment_id?: string;
  payment_link?: string;
  amount: number;
  status?: string;
  due_date?: string;
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PricingRuleTable {
  id?: string;
  service_type: string;
  room_type?: string;
  base_price: number;
  cost_per_sqft: number;
  labor_cost_per_hour: number;
  material_cost_per_gallon: number;
  created_at?: string;
  updated_at?: string;
}

export interface LineItemTable {
  id?: string;
  estimate_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
}

// Helper type for Supabase queries
export type Tables = {
  profiles: ProfileTable;
  projects: ProjectTable;
  leads: LeadTable;
  estimates: EstimateTable;
  invoices: InvoiceTable;
  pricing_rules: PricingRuleTable;
  line_items: LineItemTable;
};

// Helper functions to type Supabase queries
export function typedFrom<T extends keyof Tables>(
  table: T
): T {
  return table;
}
