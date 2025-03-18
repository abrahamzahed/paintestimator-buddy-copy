
import { RoomDetail, EstimateResult, RoomDetailsData } from '../types';
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
  // Default values if old properties don't exist
  const wallsCount = details.wallsCount || 4;
  const wallHeight = details.wallHeight || 8;
  const wallWidth = details.wallWidth || 10;
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
export const calculateTimeNeeded = (area: number, condition: string = 'good'): number => {
  // Base time: 1 hour per 100 sq ft
  const baseTime = area / 100;
  // Apply condition multiplier
  const multiplier = CONDITION_MULTIPLIERS[condition as keyof typeof CONDITION_MULTIPLIERS] || 1;
  return baseTime * multiplier;
};

/**
 * Get base room price based on room type and size
 */
const getRoomBasePrice = (details: RoomDetail): number => {
  // Use roomTypeId if available, fall back to roomType for compatibility
  const roomType = details.roomTypeId || details.roomType || 'bedroom';
  const roomSize = details.size || details.roomSize || 'average';
  
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
  discounts?: EstimateResult['discounts'];
} => {
  const area = calculateArea(room);
  const paintCans = calculatePaintNeeded(area);
  const timeEstimate = calculateTimeNeeded(area, room.condition || 'good');
  
  // Get base room price
  const roomPrice = getRoomBasePrice(room);
  
  // Calculate additional costs
  const additionalCostsObj: EstimateResult['additionalCosts'] = {};
  
  // Add ceiling cost if selected
  if (room.includeCeiling || room.addons?.includes('ceiling')) {
    additionalCostsObj.ceiling = roomPrice * additionalCosts.ceiling;
  }
  
  // Add baseboards cost if selected
  if (room.includeBaseboards || room.baseboardType !== 'none') {
    const baseboardMethod = room.baseboardsMethod || room.baseboardType || 'brush';
    const baseboardRate = baseboardMethod === 'brush' ? 
      additionalCosts.baseboardsBrush : 
      additionalCosts.baseboardsSpray;
    additionalCostsObj.baseboards = roomPrice * baseboardRate;
  }
  
  // Add crown molding if selected
  if (room.includeCrownMolding || room.addons?.includes('crownMolding')) {
    additionalCostsObj.crownMolding = roomPrice * additionalCosts.crownMolding;
  }
  
  // Add high ceiling cost if applicable
  if (room.hasHighCeiling) {
    additionalCostsObj.highCeiling = 
      (additionalCosts.highCeiling.minimum + additionalCosts.highCeiling.maximum) / 2;
  }
  
  // Add closet cost if selected
  if (room.includeCloset || room.walkInClosetCount > 0 || room.regularClosetCount > 0) {
    let closetCost = 0;
    
    // Calculate for walk-in closets
    if (room.walkInClosetCount > 0) {
      closetCost += room.walkInClosetCount * 
        ((additionalCosts.walkInCloset.minimum + additionalCosts.walkInCloset.maximum) / 2);
    }
    
    // Calculate for regular closets
    if (room.regularClosetCount > 0) {
      closetCost += room.regularClosetCount * 
        ((additionalCosts.closet.minimum + additionalCosts.closet.maximum) / 2);
    }
    
    // Fallback for older format
    if (!closetCost && room.includeCloset) {
      const closetCostRange = (room.roomType || room.roomTypeId || '').toLowerCase().includes('master') ?
        additionalCosts.walkInCloset :
        additionalCosts.closet;
      
      closetCost = (closetCostRange.minimum + closetCostRange.maximum) / 2;
    }
    
    additionalCostsObj.closet = closetCost;
  }
  
  // Add door costs
  const doorCount = room.numberOfDoors || room.doorsCount || 0;
  if (doorCount > 0) {
    const doorPricing = additionalCosts.doorFrame.brushed; // Default to brushed
    
    let doorLaborCost;
    if (doorCount <= 10) {
      doorLaborCost = doorPricing.laborCost.few;
    } else if (doorCount <= 19) {
      doorLaborCost = doorPricing.laborCost.medium;
    } else if (doorCount <= 29) {
      doorLaborCost = doorPricing.laborCost.many;
    } else {
      doorLaborCost = doorPricing.laborCost.lots;
    }
    
    additionalCostsObj.doors = doorPricing.paintCost + (doorLaborCost * doorCount);
  }
  
  // Add window costs
  const windowCount = room.numberOfWindows || room.windowsCount || 0;
  if (windowCount > 0) {
    const windowPricing = additionalCosts.windowTrim.brushed;
    additionalCostsObj.windows = windowPricing.paintCost + (windowPricing.perWindow * windowCount);
  }
  
  // Calculate material cost
  const materialCost = paintCans * PAINT_COSTS[room.paintType as keyof typeof PAINT_COSTS] || PAINT_COSTS.standard;
  
  // Total additional costs
  const totalAdditionalCosts = Object.values(additionalCostsObj).reduce((sum, cost) => sum + cost, 0);
  
  // Calculate subtotal before room-specific discounts
  const subtotalBeforeRoomDiscounts = roomPrice + totalAdditionalCosts + materialCost;
  
  // Apply room-specific discounts
  const roomDiscounts: Partial<EstimateResult['discounts']> = {};
  let totalRoomDiscounts = 0;
  
  // Empty house discount (15%)
  if (room.isEmpty || room.isEmptyHouse) {
    const emptyRoomDiscount = (roomPrice + totalAdditionalCosts) * discounts.emptyHouse;
    roomDiscounts.emptyHouse = emptyRoomDiscount;
    totalRoomDiscounts += emptyRoomDiscount;
  }
  
  // No floor covering discount (5%)
  if (room.noFloorCovering || (room.needFloorCovering === false)) {
    const noFloorDiscount = (roomPrice + totalAdditionalCosts) * discounts.noFloorCovering;
    roomDiscounts.noFloorCovering = noFloorDiscount;
    totalRoomDiscounts += noFloorDiscount;
  }
  
  // Calculate total after room-specific discounts
  const totalAfterRoomDiscounts = subtotalBeforeRoomDiscounts - totalRoomDiscounts;
  
  // Calculate labor cost (total minus materials)
  const laborCost = totalAfterRoomDiscounts - materialCost;
  
  return {
    roomPrice,
    laborCost,
    materialCost,
    totalCost: totalAfterRoomDiscounts,
    timeEstimate,
    paintCans,
    additionalCosts: additionalCostsObj,
    discounts: Object.keys(roomDiscounts).length > 0 ? roomDiscounts : undefined
  };
};

/**
 * Calculate complete estimate based on multiple rooms
 */
export const calculateMultiRoomEstimate = (details: RoomDetailsData): EstimateResult => {
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
      if (value !== undefined) {
        additionalCostsObj[key as keyof EstimateResult['additionalCosts']] = 
          (additionalCostsObj[key as keyof EstimateResult['additionalCosts']] || 0) + Number(value);
      }
    }
  }
  
  // Aggregate room-specific discounts
  const discountObj: EstimateResult['discounts'] = {};
  
  // Add up all discounts from each room
  for (const estimate of roomEstimates) {
    if (estimate.discounts) {
      for (const [key, value] of Object.entries(estimate.discounts)) {
        if (value !== undefined) {
          discountObj[key as keyof EstimateResult['discounts']] = 
            (discountObj[key as keyof EstimateResult['discounts']] || 0) + Number(value);
        }
      }
    }
  }
  
  // Add global discounts
  if (details.isEmptyHouse) {
    const additionalCostsSum = Object.values(additionalCostsObj).reduce((sum, cost) => sum + (Number(cost) || 0), 0);
    discountObj.emptyHouse = (discountObj.emptyHouse || 0) + 
      (totalRoomPrice + additionalCostsSum) * discounts.emptyHouse;
  }
  
  if (!details.needFloorCovering) {
    const additionalCostsSum = Object.values(additionalCostsObj).reduce((sum, cost) => sum + (Number(cost) || 0), 0);
    discountObj.noFloorCovering = (discountObj.noFloorCovering || 0) + 
      (totalRoomPrice + additionalCostsSum) * discounts.noFloorCovering;
  }
  
  // Calculate total discounts
  const totalDiscounts = Object.values(discountObj).reduce((sum, discount) => sum + (Number(discount) || 0), 0);
  
  // Calculate total before volume discount
  const additionalCostsSum = Object.values(additionalCostsObj).reduce((sum, cost) => sum + (Number(cost) || 0), 0);
  let totalBeforeVolumeDiscount = totalRoomPrice + additionalCostsSum - totalDiscounts + totalMaterialCost;
  
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
