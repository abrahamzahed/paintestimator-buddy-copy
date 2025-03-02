
export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface RoomDetails {
  roomType: string;
  roomSize: 'small' | 'average' | 'large';
  wallsCount: number;
  wallHeight: number;
  wallWidth: number;
  condition: 'good' | 'average' | 'poor';
  paintType: 'standard' | 'premium' | 'luxury';
  includeCeiling: boolean;
  includeBaseboards: boolean;
  baseboardsMethod: 'brush' | 'spray';
  includeCrownMolding: boolean;
  hasHighCeiling: boolean;
  includeCloset: boolean;
  isEmptyHouse: boolean;
  needFloorCovering: boolean;
  doorsCount: number;
  windowsCount: number;
}

export interface EstimateResult {
  totalCost: number;
  laborCost: number;
  materialCost: number;
  timeEstimate: number; // in hours
  paintCans: number;
  roomPrice: number;
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
