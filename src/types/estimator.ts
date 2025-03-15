
export type RoomSize = 'small' | 'average' | 'large';
export type DoorPaintingMethod = 'none' | 'brush' | 'spray';
export type WindowPaintingMethod = 'none' | 'brush' | 'spray';
export type FireplaceMethod = 'none' | 'brush' | 'spray';
export type RepairType = 'none' | 'minimal' | 'extensive';
export type BaseboardType = 'none' | 'brush' | 'spray';

export interface RoomDetails {
  id: string;
  roomTypeId: string;
  size: RoomSize;
  addons: string[];
  hasHighCeiling: boolean;
  paintType: string | null;
  isEmpty: boolean;
  noFloorCovering: boolean;
  
  // Added fields
  doorPaintingMethod: DoorPaintingMethod;
  numberOfDoors: number;
  windowPaintingMethod: WindowPaintingMethod;
  numberOfWindows: number;
  fireplaceMethod: FireplaceMethod;
  hasStairRailing: boolean;
  twoColors: boolean;
  millworkPrimingNeeded: boolean;
  repairs: RepairType;
  baseboardInstallationLf: number;
  baseboardType: BaseboardType;
  
  // New closet fields
  walkInClosetCount: number;
  regularClosetCount: number;
  
  // Backward compatibility fields for HomeEstimator.tsx
  roomType?: string;
  roomSize?: string;
  wallsCount?: number;
  wallHeight?: number;
  wallWidth?: number;
  condition?: string;
  includeCeiling?: boolean;
  includeBaseboards?: boolean;
  baseboardsMethod?: string;
  includeCrownMolding?: boolean;
  includeCloset?: boolean;
  isEmptyHouse?: boolean;
  needFloorCovering?: boolean;
  doorsCount?: number;
  windowsCount?: number;
}

export interface RoomCost {
  basePrice: number;
  paintUpcharge: number;
  addonCost: number;
  baseboardCost: number;
  highCeilingCost: number;
  doorCost: number;
  windowCost: number;
  fireplaceCost: number;
  railingCost: number;
  discountEmptyHouse: number;
  discountNoFloor: number;
  twoColorCost: number;
  millworkPrimingCost: number;
  repairsCost: number;
  baseboardInstallCost: number;
  closetCost: number; // New closet cost field
  onlyExtraSurcharge: number;
  totalBeforeVolume: number;
}

export interface EstimatorFormState {
  rooms: RoomDetails[];
}

export interface EstimatorSummary {
  roomCosts: RoomCost[];
  subtotal: number;
  volumeDiscount: number;
  finalTotal: number;
  paintCans?: number; // Add this field for backward compatibility
}
