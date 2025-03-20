// Define generic types used across the application
export interface Project {
  id: string;
  name: string;
  description?: string;
  status?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Estimate {
  id: string;
  lead_id: string;
  project_id?: string;
  labor_cost: number;
  material_cost: number;
  total_cost: number;
  status?: string;
  details?: any;
  estimated_hours: number;
  estimated_paint_gallons?: number;
  [key: string]: any;
}

export interface Invoice {
  id: string;
  estimate_id: string;
  amount: number;
  status?: string;
  [key: string]: any;
}

export interface RoomDetail {
  id: string;
  roomTypeId: string;
  size: string;
  addons: string[];
  hasHighCeiling: boolean;
  paintType: string | null;
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
  [key: string]: any;
}

export interface Lead {
  id: string;
  user_id?: string;
  project_id?: string;
  project_name?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  service_type: string;
  description?: string;
  status?: string;
  created_at?: string;
  [key: string]: any;
}

export interface LineItem {
  id: string;
  estimate_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at?: string;
}

export interface EstimateResult {
  roomPrice: number;
  laborCost: number;
  materialCost: number;
  totalCost: number;
  timeEstimate: number;
  paintCans: number;
  additionalCosts: Record<string, number>;
  discounts: Record<string, number>;
}
