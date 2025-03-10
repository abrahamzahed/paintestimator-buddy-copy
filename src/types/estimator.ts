
// Types for the dynamic estimator

export interface RoomDetails {
  id: string;
  roomTypeId: string;
  size: 'small' | 'average' | 'large';
  addons: string[];
  hasHighCeiling: boolean;
  paintType: string | null;
  isEmpty: boolean;
  noFloorCovering: boolean;

  // New fields
  doorPaintingMethod: 'none' | 'brush' | 'spray';
  numberOfDoors: number;
  windowPaintingMethod: 'none' | 'brush' | 'spray';
  numberOfWindows: number;
  fireplaceMethod: 'none' | 'brush' | 'spray';
  hasStairRailing: boolean;
  twoColors: boolean;
  millworkPrimingNeeded: boolean;
  repairs: 'none' | 'minimal' | 'extensive';
  baseboardInstallationLf: number;
}

export interface RoomCost {
  basePrice: number;
  paintUpcharge: number;
  addonCost: number;
  highCeilingCost: number;
  discountEmptyHouse: number;
  discountNoFloor: number;
  twoColorCost: number;
  millworkPrimingCost: number;
  doorCost: number;
  windowCost: number;
  fireplaceCost: number;
  railingCost: number;
  repairsCost: number;
  baseboardInstallCost: number;
  onlyExtraSurcharge: number; // e.g., +40% if only painting doors

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
}
