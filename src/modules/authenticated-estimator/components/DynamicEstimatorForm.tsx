'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import RoomDetailForm from '@/components/estimator/RoomDetailForm';
import { useToast } from '@/common/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import type { 
  RoomType, 
  RoomSize, 
  RoomAddon, 
  PaintType, 
  VolumeDiscount, 
  SpecialCondition,
  Extra 
} from '@/lib/supabase';

import { RoomDetails, RoomCost, EstimatorFormState, EstimatorSummary } from '@/types/estimator';

interface DynamicEstimatorFormProps {
  onEstimateComplete?: (
    estimate: EstimatorSummary, 
    rooms: RoomDetails[]
  ) => void;
}

export default function DynamicEstimatorForm({ onEstimateComplete }: DynamicEstimatorFormProps) {
  const { toast } = useToast();
  
  const [formState, setFormState] = useState<EstimatorFormState>({
    rooms: []
  });

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomSizes, setRoomSizes] = useState<RoomSize[]>([]);
  const [roomAddons, setRoomAddons] = useState<RoomAddon[]>([]);
  const [paintTypes, setPaintTypes] = useState<PaintType[]>([]);
  const [volumeDiscounts, setVolumeDiscounts] = useState<VolumeDiscount[]>([]);
  const [specialConditions, setSpecialConditions] = useState<SpecialCondition[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableSetupRequired, setTableSetupRequired] = useState(false);

  // fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const [
          rtRes,
          rsRes,
          raRes,
          ptRes,
          vdRes,
          scRes,
          exRes
        ] = await Promise.all([
          supabase.from('room_types').select('*'),
          supabase.from('room_sizes').select('*'),
          supabase.from('room_addons').select('*'),
          supabase.from('paint_types').select('*'),
          supabase.from('volume_discounts').select('*').order('threshold', { ascending: true }),
          supabase.from('special_conditions').select('*'),
          supabase.from('extras').select('*')
        ]);
        
        // Check for specific error about tables not existing
        if (rtRes.error && rtRes.error.message.includes('does not exist')) {
          setTableSetupRequired(true);
          throw new Error('Database tables not set up. Please run the database setup script in your Supabase instance.');
        }
        
        if (rtRes.error) throw rtRes.error;
        if (rsRes.error) throw rsRes.error;
        if (raRes.error) throw raRes.error;
        if (ptRes.error) throw ptRes.error;
        if (vdRes.error) throw vdRes.error;
        if (scRes.error) throw scRes.error;
        if (exRes.error) throw exRes.error;

        setRoomTypes(rtRes.data);
        setRoomSizes(rsRes.data);
        setRoomAddons(raRes.data);
        setPaintTypes(ptRes.data);
        setVolumeDiscounts(vdRes.data);
        setSpecialConditions(scRes.data);
        setExtras(exRes.data);

      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message ?? 'Error fetching data');
        
        // Only show toast for errors other than missing tables
        if (!tableSetupRequired) {
          toast({
            title: "Error loading pricing data",
            description: err.message ?? 'Error fetching data',
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  /** 
   * This is the big function that calculates cost for a single room,
   * adding logic for all extras. Some are stored in the DB (like "High ceiling"),
   * others we handle inline.
   */
  const calculateRoomCost = (room: RoomDetails): RoomCost => {
    // 1) Base price by room type & size
    const sizeRow = roomSizes.find(rs => 
      rs.room_type_id === room.roomTypeId && rs.size === room.size
    );
    const basePrice = sizeRow?.base_price ?? 0;

    // 2) Paint upcharge (from paint_types)
    let paintUpcharge = 0;
    if (room.paintType) {
      const pt = paintTypes.find(p => p.id === room.paintType);
      if (pt) {
        if (pt.percentage_upcharge) {
          paintUpcharge += basePrice * (pt.percentage_upcharge / 100);
        }
        if (pt.fixed_upcharge) {
          paintUpcharge += pt.fixed_upcharge;
        }
      }
    }

    // 3) Add-ons from "room.addons" (the checkboxes you haven't singled out)
    let addonCost = 0;
    room.addons.forEach((addonId) => {
      const addonObj = roomAddons.find(a => a.id === addonId);
      if (addonObj) {
        if (addonObj.addon_type === 'percentage') {
          addonCost += basePrice * (addonObj.value / 100);
        } else {
          addonCost += addonObj.value;
        }
      }
    });

    // 4) Baseboard type costs
    let baseboardCost = 0;
    if (room.baseboardType === 'brush') {
      baseboardCost = basePrice * 0.25; // 25% of base price
    } else if (room.baseboardType === 'spray') {
      baseboardCost = basePrice * 0.5; // 50% of base price
    }

    // 5) High Ceiling from DB
    let highCeilingCost = 0;
    if (room.hasHighCeiling) {
      const ceilingAddon = roomAddons.find(a =>
        a.name.toLowerCase() === 'high ceiling'
      );
      if (ceilingAddon) {
        if (ceilingAddon.addon_type === 'percentage') {
          highCeilingCost = basePrice * (ceilingAddon.value / 100);
        } else {
          highCeilingCost = ceilingAddon.value;
        }
      } else {
        // fallback if not found in DB
        highCeilingCost = 600; 
      }
    }

    // 6) Doors:
    // Example: "Brushed: $50 paint + $50 (1–10), $40 (11–19), etc."
    let doorCost = 0;
    if (room.doorPaintingMethod !== 'none' && room.numberOfDoors > 0) {
      // Find base door paint cost in "extras" or do an inline approach:
      const paintFee = 50; // base "paint" cost
      let perDoor = 0;
      if (room.doorPaintingMethod === 'brush') {
        // example: $50 if 1–10, $40 if 11–19, $35 if 20+
        if (room.numberOfDoors <= 10) perDoor = 50;
        else if (room.numberOfDoors <= 19) perDoor = 40;
        else perDoor = 35;
      } else {
        // "spray"
        // $75 if 1–10, $65 if 11–19, $50 if 20+
        if (room.numberOfDoors <= 10) perDoor = 75;
        else if (room.numberOfDoors <= 19) perDoor = 65;
        else perDoor = 50;
      }
      doorCost = paintFee + perDoor * room.numberOfDoors;
    }

    // Add closet cost calculation (new section)
    let closetCost = 0;
    if (room.walkInClosetCount > 0 || room.regularClosetCount > 0) {
      // Find closet add-ons in the room_addons table
      const walkInClosetAddon = roomAddons.find(a => 
        a.name.toLowerCase().includes('walk-in closet') || 
        a.name.toLowerCase().includes('walk in closet'));
      
      const regularClosetAddon = roomAddons.find(a => 
        a.name.toLowerCase().includes('regular closet') || 
        a.name.toLowerCase() === 'closet');
      
      // Calculate walk-in closet cost
      if (walkInClosetAddon) {
        if (walkInClosetAddon.addon_type === 'percentage') {
          closetCost += room.walkInClosetCount * (basePrice * (walkInClosetAddon.value / 100));
        } else {
          closetCost += room.walkInClosetCount * walkInClosetAddon.value;
        }
      } else if (room.walkInClosetCount > 0) {
        // Fallback if addon not found in database
        closetCost += room.walkInClosetCount * 300;
      }
      
      // Calculate regular closet cost
      if (regularClosetAddon) {
        if (regularClosetAddon.addon_type === 'percentage') {
          closetCost += room.regularClosetCount * (basePrice * (regularClosetAddon.value / 100));
        } else {
          closetCost += room.regularClosetCount * regularClosetAddon.value;
        }
      } else if (room.regularClosetCount > 0) {
        // Fallback if addon not found in database
        closetCost += room.regularClosetCount * 100;
      }
    }

    // 7) Windows:
    // "Brushed: $50 paint + $20 per window" / "Sprayed: $50 paint + $40"
    let windowCost = 0;
    if (room.windowPaintingMethod !== 'none' && room.numberOfWindows > 0) {
      const paintFee = 50;
      let perWindow = 0;
      if (room.windowPaintingMethod === 'brush') {
        perWindow = 20; 
      } else {
        // spray
        perWindow = 40;
      }
      windowCost = paintFee + perWindow * room.numberOfWindows;
    }

    // 7) Fireplace Mantel
    // "Brushed: $70–$150, Sprayed: $150–$300" 
    let fireplaceCost = 0;
    if (room.fireplaceMethod === 'brush') {
      fireplaceCost = 100; // Midpoint of range
    } else if (room.fireplaceMethod === 'spray') {
      fireplaceCost = 200; // Midpoint of range
    }

    // 8) Stair Railing (by length or complexity)
    let railingCost = 0;
    if (room.hasStairRailing) {
      railingCost = 250; 
    }

    // 9) Two Colors (+10%)
    let twoColorCost = 0;
    if (room.twoColors) {
      // 10% of (basePrice + paintUpcharge + addonCost + highCeilingCost)
      const partialSubtotal = basePrice + paintUpcharge + addonCost + highCeilingCost;
      twoColorCost = partialSubtotal * 0.1;
    }

    // 10) Millwork Priming (+50%)
    let millworkPrimingCost = 0;
    if (room.millworkPrimingNeeded) {
      millworkPrimingCost = basePrice * 0.5;
    }

    // 11) Repairs
    let repairsCost = 0;
    if (room.repairs === 'minimal') {
      repairsCost = 50;
    } else if (room.repairs === 'extensive') {
      repairsCost = 200;
    }

    // 12) Baseboard installation
    // $2 per lf (MDF), $3+ if other materials
    let baseboardInstallCost = 0;
    if (room.baseboardInstallationLf > 0) {
      baseboardInstallCost = room.baseboardInstallationLf * 2.0; 
    }

    // Combine everything BEFORE discounts:
    let roomSubtotal = (
      basePrice +
      paintUpcharge +
      addonCost +
      baseboardCost +
      highCeilingCost +
      doorCost +
      windowCost +
      fireplaceCost +
      railingCost +
      closetCost +    // Add closet cost here
      twoColorCost +
      millworkPrimingCost +
      repairsCost +
      baseboardInstallCost
    );

    // 13) "Only painting X" surcharges (e.g., +40% if only painting doors)
    let onlyExtraSurcharge = 0;
    if (basePrice < 1 && (doorCost > 0 || windowCost > 0)) {
      // add +40% of the cost of that extra
      const costOfExtras = doorCost + windowCost + fireplaceCost + railingCost;
      onlyExtraSurcharge = costOfExtras * 0.4;
    }
    roomSubtotal += onlyExtraSurcharge;

    // 14) "Empty House" discount
    let discountEmptyHouse = 0;
    if (room.isEmpty) {
      const emptyHouseCond = specialConditions.find(sc => sc.name.toLowerCase() === 'empty house');
      if (emptyHouseCond) {
        discountEmptyHouse = roomSubtotal * (emptyHouseCond.discount_percentage / 100);
      }
    }

    // 15) "No Floor Covering" discount
    let discountNoFloor = 0;
    if (room.noFloorCovering) {
      const noFloorCond = specialConditions.find(sc => sc.name.toLowerCase() === 'no floor covering needed');
      if (noFloorCond) {
        const postEmpty = roomSubtotal - discountEmptyHouse;
        discountNoFloor = postEmpty * (noFloorCond.discount_percentage / 100);
      }
    }

    const totalBeforeVolume = roomSubtotal - discountEmptyHouse - discountNoFloor;

    return {
      basePrice,
      paintUpcharge,
      addonCost,
      baseboardCost,
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
      closetCost,     // Add closet cost here
      onlyExtraSurcharge,
      totalBeforeVolume
    };
  };

  /** Summation and final discounts */
  const { roomCosts, subtotal, volumeDiscount, finalTotal } = useMemo(() => {
    const roomCosts = formState.rooms.map(calculateRoomCost);

    let subtotal = roomCosts.reduce((sum, rc) => sum + rc.totalBeforeVolume, 0);

    // find volume discount
    let volumeDiscount = 0;
    let hasExtra = false;
    const applicable = volumeDiscounts
      .filter(vd => vd.threshold <= subtotal)
      .sort((a, b) => b.threshold - a.threshold)[0];
    if (applicable) {
      volumeDiscount = subtotal * (applicable.discount_percentage / 100);
      if (applicable.has_extra) {
        hasExtra = true;
      }
    }

    // subtract the volume discount
    let afterVolume = subtotal - volumeDiscount;
    if (hasExtra) {
      // e.g., minus an additional $100
      afterVolume = afterVolume - 100;
    }

    // apply discount cap of 37.5% if needed
    let totalDiscountSoFar = subtotal - afterVolume;
    let discountPercentageSoFar = (totalDiscountSoFar / subtotal) * 100;

    if (discountPercentageSoFar > 37.5) {
      // cap it
      const maxDiscount = subtotal * 0.375;
      afterVolume = subtotal - maxDiscount;
    }

    // ensure min $400
    const finalTotal = Math.max(afterVolume, 400);

    return {
      roomCosts,
      subtotal,
      volumeDiscount,
      finalTotal
    };
  }, [
    formState.rooms,
    roomSizes,
    roomAddons,
    paintTypes,
    volumeDiscounts,
    specialConditions
  ]);

  /** Add new default room with all fields */
  const addRoom = () => {
    if (!roomTypes.length) return;
    const newRoom: RoomDetails = {
      id: crypto.randomUUID(),
      roomTypeId: roomTypes[0].id,
      size: 'average',
      addons: [],
      hasHighCeiling: false,
      paintType: null,
      isEmpty: false,
      noFloorCovering: false,

      // new fields
      doorPaintingMethod: 'none',
      numberOfDoors: 0,
      windowPaintingMethod: 'none',
      numberOfWindows: 0,
      fireplaceMethod: 'none',
      hasStairRailing: false,
      twoColors: false,
      millworkPrimingNeeded: false,
      repairs: 'none',
      baseboardInstallationLf: 0,
      baseboardType: 'none',
      walkInClosetCount: 0,
      regularClosetCount: 0
    };
    setFormState(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
  };

  const removeRoom = (roomId: string) => {
    setFormState(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r.id !== roomId)
    }));
  };

  const updateRoom = (roomId: string, updates: Partial<RoomDetails>) => {
    setFormState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => (r.id === roomId ? { ...r, ...updates } : r))
    }));
  };

  const handleSubmitEstimate = () => {
    if (onEstimateComplete) {
      onEstimateComplete(
        { roomCosts, subtotal, volumeDiscount, finalTotal },
        formState.rooms
      );
    }
  };

  // Render the setup required message
  if (tableSetupRequired) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Setup Required</AlertTitle>
          <AlertDescription>
            <p className="mb-4">To use the dynamic estimator, database tables need to be created in Supabase.</p>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>Go to your Supabase project dashboard</li>
              <li>Open the SQL Editor</li>
              <li>Run the database setup script from src/lib/database-setup.sql</li>
              <li>Refresh this page after executing the script</li>
            </ol>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-paint hover:bg-paint-dark"
            >
              Refresh Page
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Loading pricing data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Paint Cost Calculator</h2>

      <button
        onClick={addRoom}
        className="mb-6 bg-paint text-white px-4 py-2 rounded hover:bg-paint-dark transition"
      >
        Add Room
      </button>

      <div className="space-y-6">
        {formState.rooms.map((room) => (
          <RoomDetailForm
            key={room.id}
            roomId={room.id}
            roomTypes={roomTypes}
            roomSizes={roomSizes}
            roomAddons={roomAddons}
            paintTypes={paintTypes}
            specialConditions={specialConditions}

            roomTypeId={room.roomTypeId}
            size={room.size}
            addons={room.addons}
            hasHighCeiling={room.hasHighCeiling}
            paintType={room.paintType}
            isEmpty={room.isEmpty}
            noFloorCovering={room.noFloorCovering}
            doorPaintingMethod={room.doorPaintingMethod}
            numberOfDoors={room.numberOfDoors}
            windowPaintingMethod={room.windowPaintingMethod}
            numberOfWindows={room.numberOfWindows}
            fireplaceMethod={room.fireplaceMethod}
            hasStairRailing={room.hasStairRailing}
            twoColors={room.twoColors}
            millworkPrimingNeeded={room.millworkPrimingNeeded}
            repairs={room.repairs}
            baseboardInstallationLf={room.baseboardInstallationLf}
            baseboardType={room.baseboardType}
            walkInClosetCount={room.walkInClosetCount}
            regularClosetCount={room.regularClosetCount}
            
            onUpdate={(updates) => updateRoom(room.id, updates)}
            onRemove={() => removeRoom(room.id)}
          />
        ))}
      </div>

      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between text-lg font-semibold mb-2">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {volumeDiscount > 0 && (
          <div className="flex justify-between text-green-600 mb-2">
            <span>Volume Discount:</span>
            <span>-${volumeDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-bold mt-4">
          <span>Total Estimate:</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8">
        <Button 
          onClick={handleSubmitEstimate}
          className="w-full bg-paint hover:bg-paint-dark"
          disabled={formState.rooms.length === 0}
        >
          Complete Estimate
        </Button>
      </div>
    </div>
  );
}
