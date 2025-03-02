
import { RoomDetails, EstimateResult } from '../types';

// Constants for calculation
const LABOR_RATE_PER_SQFT = 2.5;
const PAINT_COVERAGE_SQFT_PER_GALLON = 400;
const PAINT_COSTS = {
  standard: 25,
  premium: 45,
  luxury: 75
};

// Condition multipliers (more prep work for poor conditions)
const CONDITION_MULTIPLIERS = {
  good: 1,
  average: 1.2,
  poor: 1.5
};

/**
 * Calculate the total area to be painted
 */
export const calculateArea = (details: RoomDetails): number => {
  const { wallsCount, wallHeight, wallWidth } = details;
  return wallsCount * wallHeight * wallWidth;
};

/**
 * Calculate paint needed in gallons
 */
export const calculatePaintNeeded = (area: number): number => {
  // Most walls need two coats of paint
  const areaWithCoats = area * 2;
  return Math.ceil(areaWithCoats / PAINT_COVERAGE_SQFT_PER_GALLON);
};

/**
 * Calculate the time needed for the job in hours
 */
export const calculateTimeNeeded = (area: number, condition: RoomDetails['condition']): number => {
  // Base time: 1 hour per 100 sq ft
  const baseTime = area / 100;
  // Apply condition multiplier
  return baseTime * CONDITION_MULTIPLIERS[condition];
};

/**
 * Calculate complete estimate based on room details
 */
export const calculateEstimate = (details: RoomDetails): EstimateResult => {
  const area = calculateArea(details);
  const paintCans = calculatePaintNeeded(area);
  const timeEstimate = calculateTimeNeeded(area, details.condition);
  
  // Calculate costs
  const materialCost = paintCans * PAINT_COSTS[details.paintType];
  const laborCost = area * LABOR_RATE_PER_SQFT * CONDITION_MULTIPLIERS[details.condition];
  const totalCost = materialCost + laborCost;
  
  return {
    totalCost,
    laborCost,
    materialCost,
    timeEstimate,
    paintCans
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};
