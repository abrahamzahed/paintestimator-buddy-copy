
/**
 * Utility functions for temporarily storing estimate data in localStorage
 * This allows us to save estimates when users create accounts
 */

import { EstimateResult, RoomDetail } from "@/types";

const STORAGE_KEY = 'paintpro_temp_estimate';

interface StoredEstimate {
  estimateResult: EstimateResult;
  roomDetails: RoomDetail[];
  roomEstimates: Record<string, any>;
  timestamp: number;
}

export const saveTemporaryEstimate = (
  estimateResult: EstimateResult,
  roomDetails: RoomDetail[],
  roomEstimates: Record<string, any>
) => {
  const estimateData: StoredEstimate = {
    estimateResult,
    roomDetails,
    roomEstimates,
    timestamp: Date.now()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estimateData));
};

export const getTemporaryEstimate = (): StoredEstimate | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data) as StoredEstimate;
    
    // Check if the estimate is less than 24 hours old
    const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch (e) {
    console.error("Error parsing saved estimate", e);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearTemporaryEstimate = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const hasSavedEstimate = (): boolean => {
  return getTemporaryEstimate() !== null;
};
