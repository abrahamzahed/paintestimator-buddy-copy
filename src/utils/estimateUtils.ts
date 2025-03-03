
import { RoomDetails, RoomDetail, EstimateResult } from '../types';
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
 * Calculate the total area to be painted for a single room
 */
export const calculateArea = (details: RoomDetail): number => {
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
export const calculateTimeNeeded = (area: number, condition: RoomDetail['condition']): number => {
  // Base time: 1 hour per 100 sq ft
  const baseTime = area / 100;
  // Apply condition multiplier
  return baseTime * CONDITION_MULTIPLIERS[condition];
};

/**
 * Get base room price based on room type and size
 */
const getRoomBasePrice = (details: RoomDetail): number => {
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
 * Calculate single room estimate
 */
export const calculateSingleRoomEstimate = (room: RoomDetail): {
  roomPrice: number;
  laborCost: number;
  materialCost: number;
  totalCost: number;
  timeEstimate: number;
  paintCans: number;
  additionalCosts: EstimateResult['additionalCosts'];
} => {
  const area = calculateArea(room);
  const paintCans = calculatePaintNeeded(area);
  const timeEstimate = calculateTimeNeeded(area, room.condition);
  
  // Get base room price
  const roomPrice = getRoomBasePrice(room);
  
  // Calculate additional costs
  const additionalCostsObj: EstimateResult['additionalCosts'] = {};
  
  // Add ceiling cost if selected
  if (room.includeCeiling) {
    additionalCostsObj.ceiling = roomPrice * additionalCosts.ceiling;
  }
  
  // Add baseboards cost if selected
  if (room.includeBaseboards) {
    const baseboardRate = room.baseboardsMethod === 'brush' ? 
      additionalCosts.baseboardsBrush : 
      additionalCosts.baseboardsSpray;
    additionalCostsObj.baseboards = roomPrice * baseboardRate;
  }
  
  // Add crown molding if selected
  if (room.includeCrownMolding) {
    additionalCostsObj.crownMolding = roomPrice * additionalCosts.crownMolding;
  }
  
  // Add high ceiling cost if applicable
  if (room.hasHighCeiling) {
    additionalCostsObj.highCeiling = 
      (additionalCosts.highCeiling.minimum + additionalCosts.highCeiling.maximum) / 2;
  }
  
  // Add closet cost if selected
  if (room.includeCloset) {
    const closetCostRange = room.roomType.toLowerCase().includes('master') ?
      additionalCosts.walkInCloset :
      additionalCosts.closet;
    
    additionalCostsObj.closet = 
      (closetCostRange.minimum + closetCostRange.maximum) / 2;
  }
  
  // Add door costs
  if (room.doorsCount > 0) {
    const doorPricing = additionalCosts.doorFrame.brushed; // Default to brushed
    
    let doorLaborCost;
    if (room.doorsCount <= 10) {
      doorLaborCost = doorPricing.laborCost.few;
    } else if (room.doorsCount <= 19) {
      doorLaborCost = doorPricing.laborCost.medium;
    } else if (room.doorsCount <= 29) {
      doorLaborCost = doorPricing.laborCost.many;
    } else {
      doorLaborCost = doorPricing.laborCost.lots;
    }
    
    additionalCostsObj.doors = doorPricing.paintCost + (doorLaborCost * room.doorsCount);
  }
  
  // Add window costs
  if (room.windowsCount > 0) {
    const windowPricing = additionalCosts.windowTrim.brushed;
    additionalCostsObj.windows = windowPricing.paintCost + (windowPricing.perWindow * room.windowsCount);
  }
  
  // Calculate material cost
  const materialCost = paintCans * PAINT_COSTS[room.paintType];
  
  // Total additional costs
  const totalAdditionalCosts = Object.values(additionalCostsObj).reduce((sum, cost) => sum + cost, 0);
  
  // Calculate total before discounts
  const totalBeforeDiscount = roomPrice + totalAdditionalCosts + materialCost;
  
  // Calculate labor cost (total minus materials)
  const laborCost = totalBeforeDiscount - materialCost;
  
  return {
    roomPrice,
    laborCost,
    materialCost,
    totalCost: totalBeforeDiscount,
    timeEstimate,
    paintCans,
    additionalCosts: additionalCostsObj
  };
};

/**
 * Calculate complete estimate based on multiple rooms
 */
export const calculateMultiRoomEstimate = (details: RoomDetails): EstimateResult => {
  // Calculate estimates for each room
  const roomEstimates = details.rooms.map(room => calculateSingleRoomEstimate(room));
  
  // Aggregate all room estimates
  const totalRoomPrice = roomEstimates.reduce((sum, estimate) => sum + estimate.roomPrice, 0);
  const totalLaborCost = roomEstimates.reduce((sum, estimate) => sum + estimate.laborCost, 0);
  const totalMaterialCost = roomEstimates.reduce((sum, estimate) => sum + estimate.materialCost, 0);
  const totalTotalCost = roomEstimates.reduce((sum, estimate) => sum + estimate.totalCost, 0);
  const totalTimeEstimate = roomEstimates.reduce((sum, estimate) => sum + estimate.timeEstimate, 0);
  const totalPaintCans = roomEstimates.reduce((sum, estimate) => sum + estimate.paintCans, 0);
  
  // Calculate additional costs aggregated
  const additionalCostsObj: EstimateResult['additionalCosts'] = {};
  for (const estimate of roomEstimates) {
    for (const [key, value] of Object.entries(estimate.additionalCosts)) {
      additionalCostsObj[key as keyof EstimateResult['additionalCosts']] = 
        (additionalCostsObj[key as keyof EstimateResult['additionalCosts']] || 0) + value;
    }
  }
  
  // Calculate discounts
  const discountObj: EstimateResult['discounts'] = {};
  
  if (details.isEmptyHouse) {
    discountObj.emptyHouse = (totalRoomPrice + Object.values(additionalCostsObj).reduce((sum, cost) => sum + cost, 0)) * discounts.emptyHouse;
  }
  
  if (!details.needFloorCovering) {
    discountObj.noFloorCovering = (totalRoomPrice + Object.values(additionalCostsObj).reduce((sum, cost) => sum + cost, 0)) * discounts.noFloorCovering;
  }
  
  // Calculate total discounts
  const totalDiscounts = Object.values(discountObj).reduce((sum, discount) => sum + discount, 0);
  
  // Calculate total before volume discount
  let totalBeforeVolumeDiscount = totalRoomPrice + 
    Object.values(additionalCostsObj).reduce((sum, cost) => sum + cost, 0) - 
    totalDiscounts + 
    totalMaterialCost;
  
  // Apply volume discount if eligible
  const totalAfterVolumeDiscount = calculateVolumeDiscount(totalBeforeVolumeDiscount);
  
  if (totalAfterVolumeDiscount < totalBeforeVolumeDiscount) {
    discountObj.volumeDiscount = totalBeforeVolumeDiscount - totalAfterVolumeDiscount;
  }
  
  // Calculate total cost
  const totalCost = Math.max(MINIMUM_SERVICE_CHARGE, totalAfterVolumeDiscount);
  
  // Adjust labor cost to account for discounts
  const adjustedLaborCost = totalCost - totalMaterialCost;
  
  return {
    roomPrice: totalRoomPrice,
    laborCost: adjustedLaborCost,
    materialCost: totalMaterialCost,
    totalCost,
    timeEstimate: totalTimeEstimate,
    paintCans: totalPaintCans,
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
