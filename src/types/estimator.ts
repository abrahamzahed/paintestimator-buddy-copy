
// Specific types for the estimator features
export interface RoomDetails {
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
}

export interface RoomCost {
  basePrice: number;
  paintUpcharge: number;
  addonCost: number;
  baseboardCost: number;
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
  closetCost: number;
  onlyExtraSurcharge: number;
  totalBeforeVolume: number;
}

export interface EstimatorSummary {
  roomCosts: RoomCost[];
  subtotal: number;
  volumeDiscount: number;
  finalTotal: number;
}

export interface EstimatorFormState {
  rooms: RoomDetails[];
}
