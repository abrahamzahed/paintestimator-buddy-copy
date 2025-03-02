
export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface RoomDetails {
  roomType: string;
  wallsCount: number;
  wallHeight: number;
  wallWidth: number;
  condition: 'good' | 'average' | 'poor';
  paintType: 'standard' | 'premium' | 'luxury';
}

export interface EstimateResult {
  totalCost: number;
  laborCost: number;
  materialCost: number;
  timeEstimate: number; // in hours
  paintCans: number;
}
