
// Pricing constants for interior painting

// Base room prices (walls only)
export const roomBasePrices = {
  bedroom: {
    small: 400,
    average: 400,
    large: 550
  },
  masterBedroom: {
    small: 450,
    average: 550,
    large: 750
  },
  livingRoom: {
    small: 600,
    average: 800,
    large: 1000 // Using the lower end of range
  },
  diningRoom: {
    average: 400,
    large: 500
  },
  entryway: {
    minimum: 400,
    maximum: 1000
  },
  hallway: {
    minimum: 200,
    maximum: 500
  },
  bathroom: {
    small: 400, // Using minimum service charge
    average: 400, // Using minimum service charge
    large: 600
  },
  kitchen: {
    small: 400, // Using minimum service charge
    average: 400, // Using minimum service charge
    large: 600
  }
};

// Additional costs
export const additionalCosts = {
  ceiling: 0.4, // +40%
  baseboardsBrush: 0.25, // +25%
  baseboardsSpray: 0.5, // +50%
  crownMolding: 0.25, // +25%
  highCeiling: {
    minimum: 300,
    maximum: 600
  },
  closet: {
    minimum: 60,
    maximum: 100
  },
  walkInCloset: {
    minimum: 100,
    maximum: 300
  },
  doorFrame: {
    brushed: {
      paintCost: 50,
      laborCost: {
        few: 50, // 1-10 doors
        medium: 40, // 11-19 doors
        many: 35, // 20+ doors
        lots: 30 // 30+ doors
      }
    },
    sprayed: {
      paintCost: 50,
      laborCost: {
        few: 75, // 1-10 doors
        medium: 65, // 11-19 doors
        many: 50, // 20+ doors
        lots: 45 // 30+ doors
      }
    }
  },
  windowTrim: {
    brushed: {
      paintCost: 50,
      perWindow: 20,
      windowSill: 10
    },
    sprayed: {
      paintCost: 50,
      perWindow: 40,
      windowSill: 20
    }
  },
  twoColors: 0.1, // +10% for walls & ceiling different colors
};

// Discounts
export const discounts = {
  emptyHouse: 0.15, // -15%
  noFloorCovering: 0.05, // -5%
  // Volume discounts
  volumeDiscounts: [
    { threshold: 2000, discount: 0.05 },
    { threshold: 3000, discount: 0.10 },
    { threshold: 4000, discount: 0.15 },
    { threshold: 5000, discount: 0.20 },
    { threshold: 7000, discount: 0.25 },
    { threshold: 9000, discount: 0.30 },
    { threshold: 11000, discount: 0.35 },
    // Caps at 37.5%
  ]
};

// Paint quality upcharges
export const paintUpcharges = {
  standard: 0, // base price
  duration: 0.12, // +12%
  emerald: 0.17, // +17%
  cashmeraAndHarmony: 0.05 // +5%
};

// Minimum service charge
export const MINIMUM_SERVICE_CHARGE = 400;

// Calculate total with volume discount
export const calculateVolumeDiscount = (totalCost: number): number => {
  // Find the appropriate discount tier
  let discount = 0;
  for (const tier of discounts.volumeDiscounts) {
    if (totalCost >= tier.threshold) {
      discount = tier.discount;
    } else {
      break;
    }
  }
  
  // Apply the discount
  return totalCost * (1 - discount);
};
