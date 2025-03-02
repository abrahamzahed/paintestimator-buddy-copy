
import { RoomDetails, EstimateResult } from '../types';
import { 
  roomBasePrices, 
  additionalCosts, 
  discounts, 
  paintUpcharges, 
  MINIMUM_SERVICE_CHARGE,
  calculateVolumeDiscount
} from './pricingData';

// Constants for calculation
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
 * Get base room price based on room type and size
 */
const getRoomBasePrice = (details: RoomDetails): number => {
  const { roomType, roomSize } = details;
  
  // Convert to key compatible with our pricing object
  let type = roomType.toLowerCase().replace(/\s+/g, '');
  if (type === 'bedroom' && roomType.toLowerCase().includes('master')) {
    type = 'masterBedroom';
  } else if (type === 'livingroom' || type === 'familyroom') {
    type = 'livingRoom';
  } else if (type === 'diningroom') {
    type = 'diningRoom';
  }
  
  // Get room prices object
  const priceObj = roomBasePrices[type as keyof typeof roomBasePrices];
  
  if (!priceObj) {
    return MINIMUM_SERVICE_CHARGE; // Default to minimum if room type not found
  }
  
  // For rooms with only min/max pricing
  if ('minimum' in priceObj) {
    return roomSize === 'small' ? 
      priceObj.minimum : 
      roomSize === 'average' ? 
        (priceObj.minimum + priceObj.maximum) / 2 : 
        priceObj.maximum;
  }
  
  // For rooms with specific sizing
  return priceObj[roomSize as keyof typeof priceObj] || MINIMUM_SERVICE_CHARGE;
};

/**
 * Calculate complete estimate based on room details
 */
export const calculateEstimate = (details: RoomDetails): EstimateResult => {
  const area = calculateArea(details);
  const paintCans = calculatePaintNeeded(area);
  const timeEstimate = calculateTimeNeeded(area, details.condition);
  
  // Get base room price
  const roomPrice = getRoomBasePrice(details);
  
  // Calculate additional costs
  const additionalCostsObj: EstimateResult['additionalCosts'] = {};
  
  // Add ceiling cost if selected
  if (details.includeCeiling) {
    additionalCostsObj.ceiling = roomPrice * additionalCosts.ceiling;
  }
  
  // Add baseboards cost if selected
  if (details.includeBaseboards) {
    const baseboardRate = details.baseboardsMethod === 'brush' ? 
      additionalCosts.baseboardsBrush : 
      additionalCosts.baseboardsSpray;
    additionalCostsObj.baseboards = roomPrice * baseboardRate;
  }
  
  // Add crown molding if selected
  if (details.includeCrownMolding) {
    additionalCostsObj.crownMolding = roomPrice * additionalCosts.crownMolding;
  }
  
  // Add high ceiling cost if applicable
  if (details.hasHighCeiling) {
    additionalCostsObj.highCeiling = 
      (additionalCosts.highCeiling.minimum + additionalCosts.highCeiling.maximum) / 2;
  }
  
  // Add closet cost if selected
  if (details.includeCloset) {
    const closetCostRange = details.roomType.toLowerCase().includes('master') ?
      additionalCosts.walkInCloset :
      additionalCosts.closet;
    
    additionalCostsObj.closet = 
      (closetCostRange.minimum + closetCostRange.maximum) / 2;
  }
  
  // Add door costs
  if (details.doorsCount > 0) {
    const doorPricing = additionalCosts.doorFrame.brushed; // Default to brushed
    
    let doorLaborCost;
    if (details.doorsCount <= 10) {
      doorLaborCost = doorPricing.laborCost.few;
    } else if (details.doorsCount <= 19) {
      doorLaborCost = doorPricing.laborCost.medium;
    } else if (details.doorsCount <= 29) {
      doorLaborCost = doorPricing.laborCost.many;
    } else {
      doorLaborCost = doorPricing.laborCost.lots;
    }
    
    additionalCostsObj.doors = doorPricing.paintCost + (doorLaborCost * details.doorsCount);
  }
  
  // Add window costs
  if (details.windowsCount > 0) {
    const windowPricing = additionalCosts.windowTrim.brushed;
    additionalCostsObj.windows = windowPricing.paintCost + (windowPricing.perWindow * details.windowsCount);
  }
  
  // Calculate material cost
  const materialCost = paintCans * PAINT_COSTS[details.paintType];
  
  // Total additional costs
  const totalAdditionalCosts = Object.values(additionalCostsObj).reduce((sum, cost) => sum + cost, 0);
  
  // Calculate discounts
  const discountObj: EstimateResult['discounts'] = {};
  
  if (details.isEmptyHouse) {
    discountObj.emptyHouse = (roomPrice + totalAdditionalCosts) * discounts.emptyHouse;
  }
  
  if (!details.needFloorCovering) {
    discountObj.noFloorCovering = (roomPrice + totalAdditionalCosts) * discounts.noFloorCovering;
  }
  
  // Calculate total discounts
  const totalDiscounts = Object.values(discountObj).reduce((sum, discount) => sum + discount, 0);
  
  // Calculate total before volume discount
  let totalBeforeVolumeDiscount = roomPrice + totalAdditionalCosts - totalDiscounts + materialCost;
  
  // Apply volume discount if eligible
  const totalAfterVolumeDiscount = calculateVolumeDiscount(totalBeforeVolumeDiscount);
  
  if (totalAfterVolumeDiscount < totalBeforeVolumeDiscount) {
    discountObj.volumeDiscount = totalBeforeVolumeDiscount - totalAfterVolumeDiscount;
  }
  
  // Calculate total cost
  const totalCost = Math.max(MINIMUM_SERVICE_CHARGE, totalAfterVolumeDiscount);
  
  // Calculate labor cost (total minus materials)
  const laborCost = totalCost - materialCost;
  
  return {
    totalCost,
    laborCost,
    materialCost,
    timeEstimate,
    paintCans,
    roomPrice,
    additionalCosts: additionalCostsObj,
    discounts: discountObj
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
