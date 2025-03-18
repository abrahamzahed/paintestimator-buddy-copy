
import { Json } from "@/integrations/supabase/types";

export interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

export interface EstimateResult {
  roomPrice: number;
  laborCost: number;
  materialCost: number;
  totalCost: number;
  timeEstimate: number;
  paintCans: number;
  additionalCosts: {
    ceiling?: number;
    baseboards?: number;
    crownMolding?: number;
    highCeiling?: number;
    closet?: number;
    doors?: number;
    windows?: number;
  };
  discounts: {
    emptyHouse?: number;
    noFloorCovering?: number;
    volumeDiscount?: number;
  };
}

export interface RoomDetail {
  id: string;
  roomTypeId: string;
  size: string;
  addons: string[];
  hasHighCeiling: boolean;
  paintType: string;
  isEmpty: boolean;
  noFloorCovering: boolean;
  doorPaintingMethod: string;
  numberOfDoors: number;
  windowPaintingMethod: string;
  numberOfWindows: number;
  fireplaceMethod: string;
  hasStairRailing: boolean;
  twoColors: boolean;
  millworkPrimingNeeded: boolean;
  repairs: string;
  baseboardInstallationLf: number;
  baseboardType: string;
  walkInClosetCount: number;
  regularClosetCount: number;
}

export interface RoomDetailsData {
  rooms: RoomDetail[];
  isEmptyHouse: boolean;
  needFloorCovering: boolean;
}

export interface Project {
  id?: string;
  name: string;
  user_id?: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lead {
  id?: string;
  user_id?: string;
  project_id?: string;
  project_name?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  details?: string;
  service_type?: string;
  description?: string;
  room_count?: number;
  square_footage?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  preferredContactMethod?: string;
  bestTimeToCall?: string;
  preferredTimeline?: string;
}

export interface PricingRule {
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

export interface LineItem {
  id?: string;
  estimate_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
}

export interface Estimate {
  id?: string;
  lead_id: string;
  project_id?: string;
  project_name?: string;
  details: Record<string, any> | Json;
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
  preferred_contact_method?: string;
  best_time_to_call?: string;
  preferred_timeline?: string;
  availability_windows?: string[];
}

export interface Invoice {
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

export interface Profile {
  id: string;
  role: "admin" | "staff" | "customer";
  name: string | null;
  email?: string | null;
  phone: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}
