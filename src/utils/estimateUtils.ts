
import { RoomDetails, EstimatorSummary } from "@/types/estimator";

export const getEstimateResult = (estimate: any) => {
  return {
    roomPrice: estimate.total_cost * 0.85,
    laborCost: estimate.labor_cost || 0,
    materialCost: estimate.material_cost || 0,
    totalCost: estimate.total_cost || 0,
    timeEstimate: estimate.estimated_hours || 0,
    paintCans: estimate.estimated_paint_gallons || 0,
    additionalCosts: {},
    discounts: { volumeDiscount: estimate.discount || 0 }
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const calculateTotalEstimate = (roomDetails: RoomDetails[]): EstimatorSummary => {
  // Placeholder implementation
  return {
    subtotal: 0,
    volumeDiscount: 0,
    finalTotal: 0,
    roomCosts: []
  };
};

// Add missing function
export const calculateSingleRoomEstimate = (roomDetail: any) => {
  // Mock implementation of single room calculation
  return {
    roomPrice: 250,
    laborCost: 150,
    materialCost: 100,
    totalCost: 250,
    timeEstimate: 4,
    paintCans: 2,
    additionalCosts: {},
    discounts: {}
  };
};
