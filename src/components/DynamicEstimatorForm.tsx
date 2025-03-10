
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { EstimatorSummary, RoomDetails } from "@/types/estimator";
import { v4 as uuidv4 } from "uuid";

// Define the props interface for DynamicEstimatorForm
interface DynamicEstimatorFormProps {
  onEstimateComplete: (estimate: EstimatorSummary, rooms: RoomDetails[]) => void;
  initialUserData?: {
    name: string;
    email: string;
    phone?: string;
  };
}

// Create a placeholder implementation of the dynamic estimator form
const DynamicEstimatorForm = ({ onEstimateComplete, initialUserData }: DynamicEstimatorFormProps) => {
  const [rooms, setRooms] = useState<RoomDetails[]>([
    {
      id: uuidv4(),
      roomTypeId: "bedroom",
      size: "average",
      addons: [],
      hasHighCeiling: false,
      paintType: "standard",
      isEmpty: false,
      noFloorCovering: false,
      doorPaintingMethod: "none",
      numberOfDoors: 0,
      windowPaintingMethod: "none",
      numberOfWindows: 0,
      fireplaceMethod: "none",
      hasStairRailing: false,
      twoColors: false,
      millworkPrimingNeeded: false,
      repairs: "none",
      baseboardInstallationLf: 0
    }
  ]);

  const calculateEstimate = () => {
    // Basic calculation for demonstration
    const roomCosts = rooms.map(room => {
      const basePrice = room.size === "small" ? 200 : room.size === "average" ? 350 : 500;
      const paintUpcharge = room.paintType === "premium" ? 100 : 0;
      const addonCost = room.addons.length * 50;
      const highCeilingCost = room.hasHighCeiling ? 150 : 0;
      const discountEmptyHouse = room.isEmpty ? -50 : 0;
      const discountNoFloor = room.noFloorCovering ? -30 : 0;
      const twoColorCost = room.twoColors ? 100 : 0;
      const millworkPrimingCost = room.millworkPrimingNeeded ? 120 : 0;
      
      // Calculate costs for doors, windows, etc.
      const doorCost = room.doorPaintingMethod === "none" ? 0 : 
                      room.doorPaintingMethod === "brush" ? room.numberOfDoors * 40 : 
                      room.numberOfDoors * 60;
                      
      const windowCost = room.windowPaintingMethod === "none" ? 0 : 
                         room.windowPaintingMethod === "brush" ? room.numberOfWindows * 30 : 
                         room.numberOfWindows * 45;
                         
      const fireplaceCost = room.fireplaceMethod === "none" ? 0 : 
                           room.fireplaceMethod === "brush" ? 150 : 
                           250;
                           
      const railingCost = room.hasStairRailing ? 200 : 0;
      
      const repairsCost = room.repairs === "none" ? 0 : 
                         room.repairs === "minimal" ? 100 : 
                         300;
                         
      const baseboardInstallCost = room.baseboardInstallationLf * 7;
      
      // Extra surcharge if only painting specialty items
      const onlyExtraSurcharge = (room.doorPaintingMethod !== "none" || 
                                 room.windowPaintingMethod !== "none" || 
                                 room.fireplaceMethod !== "none" || 
                                 room.hasStairRailing) && 
                                 basePrice === 0 ? 
                                 (doorCost + windowCost + fireplaceCost + railingCost) * 0.4 : 0;
      
      const totalBeforeVolume = basePrice + paintUpcharge + addonCost + highCeilingCost + 
                               discountEmptyHouse + discountNoFloor + twoColorCost + 
                               millworkPrimingCost + doorCost + windowCost + fireplaceCost + 
                               railingCost + repairsCost + baseboardInstallCost + onlyExtraSurcharge;
      
      return {
        basePrice,
        paintUpcharge,
        addonCost,
        highCeilingCost,
        discountEmptyHouse,
        discountNoFloor,
        twoColorCost,
        millworkPrimingCost,
        doorCost,
        windowCost,
        fireplaceCost,
        railingCost,
        repairsCost,
        baseboardInstallCost,
        onlyExtraSurcharge,
        totalBeforeVolume
      };
    });
    
    const subtotal = roomCosts.reduce((sum, roomCost) => sum + roomCost.totalBeforeVolume, 0);
    
    // Apply volume discount based on number of rooms
    let volumeDiscount = 0;
    if (rooms.length >= 3 && rooms.length < 5) {
      volumeDiscount = subtotal * 0.05; // 5% discount
    } else if (rooms.length >= 5) {
      volumeDiscount = subtotal * 0.1; // 10% discount
    }
    
    const finalTotal = subtotal - volumeDiscount;
    
    const summary: EstimatorSummary = {
      roomCosts,
      subtotal,
      volumeDiscount,
      finalTotal
    };
    
    onEstimateComplete(summary, rooms);
  };

  const addRoom = () => {
    setRooms([...rooms, {
      id: uuidv4(),
      roomTypeId: "bedroom",
      size: "average",
      addons: [],
      hasHighCeiling: false,
      paintType: "standard",
      isEmpty: false,
      noFloorCovering: false,
      doorPaintingMethod: "none",
      numberOfDoors: 0,
      windowPaintingMethod: "none",
      numberOfWindows: 0,
      fireplaceMethod: "none",
      hasStairRailing: false,
      twoColors: false,
      millworkPrimingNeeded: false,
      repairs: "none",
      baseboardInstallationLf: 0
    }]);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-secondary/30 rounded-lg">
        <h3 className="font-medium mb-4">Room Configuration</h3>
        
        {/* Simplified UI for demonstration purposes */}
        {rooms.map((room, index) => (
          <div key={room.id} className="mb-4 p-3 border rounded-md">
            <h4 className="font-medium mb-2">Room {index + 1}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Room Type</label>
                <select 
                  className="w-full p-2 border rounded mt-1"
                  value={room.roomTypeId}
                  onChange={(e) => {
                    const newRooms = [...rooms];
                    newRooms[index].roomTypeId = e.target.value;
                    setRooms(newRooms);
                  }}
                >
                  <option value="bedroom">Bedroom</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="living">Living Room</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="dining">Dining Room</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Room Size</label>
                <select 
                  className="w-full p-2 border rounded mt-1"
                  value={room.size}
                  onChange={(e) => {
                    const newRooms = [...rooms];
                    newRooms[index].size = e.target.value as "small" | "average" | "large";
                    setRooms(newRooms);
                  }}
                >
                  <option value="small">Small</option>
                  <option value="average">Average</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Paint Type</label>
                <select 
                  className="w-full p-2 border rounded mt-1"
                  value={room.paintType || "standard"}
                  onChange={(e) => {
                    const newRooms = [...rooms];
                    newRooms[index].paintType = e.target.value;
                    setRooms(newRooms);
                  }}
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="flex items-center space-x-2 mt-2">
                  <input 
                    type="checkbox" 
                    checked={room.hasHighCeiling}
                    onChange={(e) => {
                      const newRooms = [...rooms];
                      newRooms[index].hasHighCeiling = e.target.checked;
                      setRooms(newRooms);
                    }}
                  />
                  <span className="text-sm">High Ceiling</span>
                </label>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex space-x-3 mt-4">
          <Button 
            onClick={addRoom}
            variant="outline"
          >
            Add Room
          </Button>
          
          <Button 
            onClick={calculateEstimate}
            className="bg-paint hover:bg-paint-dark"
          >
            Calculate Estimate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DynamicEstimatorForm;
