'use client';

import { useMemo } from 'react';
import type { 
  RoomType, 
  RoomSize, 
  RoomAddon, 
  PaintType, 
  SpecialCondition 
} from '@/lib/supabase';
import { Trash2 } from 'lucide-react';
import { RoomDetails } from '@/types/estimator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface RoomDetailFormProps {
  roomId: string;
  roomTypes: RoomType[];
  roomSizes: RoomSize[];
  roomAddons: RoomAddon[];
  paintTypes: PaintType[];
  specialConditions: SpecialCondition[];

  roomTypeId: string;
  size: RoomDetails['size'];
  addons: string[];
  hasHighCeiling: boolean;
  paintType: string | null;
  isEmpty: boolean;
  noFloorCovering: boolean;

  doorPaintingMethod: RoomDetails['doorPaintingMethod'];
  numberOfDoors: number;
  windowPaintingMethod: RoomDetails['windowPaintingMethod'];
  numberOfWindows: number;
  fireplaceMethod: RoomDetails['fireplaceMethod'];
  hasStairRailing: boolean;
  twoColors: boolean;
  millworkPrimingNeeded: boolean;
  repairs: RoomDetails['repairs'];
  baseboardInstallationLf: number;
  baseboardType: RoomDetails['baseboardType'];
  walkInClosetCount: number;
  regularClosetCount: number;

  onUpdate: (updates: Partial<RoomDetails>) => void;
  onRemove: () => void;
}

export default function RoomDetailForm({
  roomId,
  roomTypes,
  roomSizes,
  roomAddons,
  paintTypes,
  specialConditions,

  roomTypeId,
  size,
  addons,
  hasHighCeiling,
  paintType,
  isEmpty,
  noFloorCovering,

  doorPaintingMethod,
  numberOfDoors,
  windowPaintingMethod,
  numberOfWindows,
  fireplaceMethod,
  hasStairRailing,
  twoColors,
  millworkPrimingNeeded,
  repairs,
  baseboardInstallationLf,
  baseboardType,
  walkInClosetCount,
  regularClosetCount,

  onUpdate,
  onRemove
}: RoomDetailFormProps) {
  const currentRoomType = roomTypes.find(rt => rt.id === roomTypeId);

  const filteredAddons = useMemo(() => {
    return roomAddons
      .filter(addon => 
        addon.room_type_id === roomTypeId || addon.room_type_id == null
      )
      .filter(
        addon =>
          !addon.name.toLowerCase().includes('baseboards')
      );
  }, [roomAddons, roomTypeId]);

  const emptyHouseCondition = specialConditions.find(
    sc => sc.name.toLowerCase() === 'empty house'
  );
  const noFloorCondition = specialConditions.find(
    sc => sc.name.toLowerCase() === 'no floor covering needed'
  );

  const ceilingPaintAddon = roomAddons.find(
    addon => addon.name.toLowerCase() === 'paint ceiling'
  );

  const millworkPrimingDisabled = baseboardType === 'none' && numberOfDoors === 0 && numberOfWindows === 0;

  const handleUpdate = (updates: Partial<RoomDetails>) => {
    const updatedBaseboardType = updates.baseboardType !== undefined ? updates.baseboardType : baseboardType;
    const updatedDoorCount = updates.numberOfDoors !== undefined ? updates.numberOfDoors : numberOfDoors;
    const updatedWindowCount = updates.numberOfWindows !== undefined ? updates.numberOfWindows : numberOfWindows;
    
    if (millworkPrimingNeeded && 
        updatedBaseboardType === 'none' && 
        updatedDoorCount === 0 && 
        updatedWindowCount === 0) {
      onUpdate({
        ...updates,
        millworkPrimingNeeded: false
      });
    } else {
      onUpdate(updates);
    }
  };

  return (
    <div className="p-4 border rounded-md space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium">
          {currentRoomType?.name || 'Room'}
        </h4>
        <button onClick={onRemove} className="text-red-600 hover:text-red-700">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Room Type</label>
        <select
          value={roomTypeId}
          onChange={(e) => handleUpdate({ roomTypeId: e.target.value })}
          className="w-full p-2 border rounded-md"
        >
          {roomTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Size</label>
        <select
          value={size}
          onChange={(e) => handleUpdate({ size: e.target.value as RoomDetails['size'] })}
          className="w-full p-2 border rounded-md"
        >
          <option value="small">Small</option>
          <option value="average">Average</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Paint Selection</label>
        <select
          value={paintType || ''}
          onChange={(e) => handleUpdate({ paintType: e.target.value || null })}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Standard Paint (no upcharge)</option>
          {paintTypes.map(pt => (
            <option key={pt.id} value={pt.id}>
              {pt.name}
              {pt.percentage_upcharge ? ` (+${pt.percentage_upcharge}%)` : ''}
              {pt.fixed_upcharge ? ` (+$${pt.fixed_upcharge.toFixed(2)})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Baseboard Selection</label>
        <select
          value={baseboardType || 'none'}
          onChange={(e) => handleUpdate({ baseboardType: e.target.value as RoomDetails['baseboardType'] })}
          className="w-full p-2 border rounded-md"
        >
          <option value="none">No Baseboards</option>
          <option value="brush">Brushed Baseboards (+25%)</option>
          <option value="spray">Sprayed Baseboards (+50%)</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Room Discounts & Options</label>
        <div className="space-y-2 p-3 border rounded-md bg-gray-50">
          {emptyHouseCondition && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isEmpty}
                onChange={(e) => handleUpdate({ isEmpty: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>
                Empty House ({emptyHouseCondition.discount_percentage}% discount)
              </span>
            </label>
          )}
          
          {noFloorCondition && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={noFloorCovering}
                onChange={(e) => handleUpdate({ noFloorCovering: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>
                No Floor Covering ({noFloorCondition.discount_percentage}% discount)
              </span>
            </label>
          )}

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={twoColors}
              onChange={(e) => handleUpdate({ twoColors: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span>Walls & Ceilings: Two Different Colors (+10%)</span>
          </label>

          <label className={`flex items-center space-x-2 ${millworkPrimingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
              type="checkbox"
              checked={millworkPrimingNeeded}
              onChange={(e) => handleUpdate({ millworkPrimingNeeded: e.target.checked })}
              className="rounded text-blue-600"
              disabled={millworkPrimingDisabled}
            />
            <span>Millwork/Doors Need Priming (+50%)</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Ceiling Options</label>
        <div className="p-3 border rounded-md bg-gray-50 space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasHighCeiling}
              onChange={(e) => handleUpdate({ hasHighCeiling: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span>High Ceiling (+$600)</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={addons.includes(ceilingPaintAddon?.id || '')}
              onChange={(e) => {
                const newAddons = e.target.checked
                  ? [...addons, ceilingPaintAddon?.id || '']
                  : addons.filter(id => id !== ceilingPaintAddon?.id);
                handleUpdate({ addons: newAddons });
              }}
              className="rounded text-blue-600"
            />
            <span>Paint Ceiling (+40%)</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Door Painting</label>
        <div className="p-3 border rounded-md bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="doorCount">Door Count</Label>
              <Input
                id="doorCount"
                type="number"
                min="0"
                value={numberOfDoors}
                onChange={(e) => handleUpdate({ numberOfDoors: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="doorPaintMethod">Paint Method</Label>
              <Select 
                value={doorPaintingMethod === "none" ? "spray" : doorPaintingMethod} 
                onValueChange={(value) => handleUpdate({ doorPaintingMethod: value as RoomDetails['doorPaintingMethod'] })}
              >
                <SelectTrigger id="doorPaintMethod" className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brush">Brush</SelectItem>
                  <SelectItem value="spray">Spray</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Closets</label>
        <div className="p-3 border rounded-md bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="walkInClosetCount">Walk-in Closet Count</Label>
              <Input
                id="walkInClosetCount"
                type="number"
                min="0"
                value={walkInClosetCount}
                onChange={(e) => handleUpdate({ walkInClosetCount: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="regularClosetCount">Regular Closet Count</Label>
              <Input
                id="regularClosetCount"
                type="number"
                min="0"
                value={regularClosetCount}
                onChange={(e) => handleUpdate({ regularClosetCount: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Windows</label>
        <div className="p-3 border rounded-md bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="windowCount">Window Count</Label>
              <Input
                id="windowCount"
                type="number"
                min="0"
                value={numberOfWindows}
                onChange={(e) => handleUpdate({ numberOfWindows: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="windowPaintMethod">Paint Method</Label>
              <Select 
                value={windowPaintingMethod === "none" ? "spray" : windowPaintingMethod} 
                onValueChange={(value) => handleUpdate({ windowPaintingMethod: value as RoomDetails['windowPaintingMethod'] })}
              >
                <SelectTrigger id="windowPaintMethod" className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brush">Brush</SelectItem>
                  <SelectItem value="spray">Spray</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fireplace Mantel</label>
        <select
          value={fireplaceMethod}
          onChange={(e) => handleUpdate({ fireplaceMethod: e.target.value as RoomDetails['fireplaceMethod'] })}
          className="w-full p-2 border rounded-md"
        >
          <option value="none">No Mantel</option>
          <option value="brush">Brushed</option>
          <option value="spray">Sprayed</option>
        </select>
      </div>

      <div className="mt-4 space-y-2">
        <label className="block text-sm font-medium">Stair Railing</label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={hasStairRailing}
            onChange={(e) => handleUpdate({ hasStairRailing: e.target.checked })}
            className="rounded text-blue-600"
          />
          <span>Staircase Railing to Paint</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 mt-4">Repairs</label>
        <select
          value={repairs}
          onChange={(e) => handleUpdate({ repairs: e.target.value as RoomDetails['repairs'] })}
          className="w-full p-2 border rounded-md"
        >
          <option value="none">No Repairs</option>
          <option value="minimal">Minimal Repairs</option>
          <option value="extensive">Extensive Repairs</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 mt-4">Baseboard Installation (LF)</label>
        <input
          type="number"
          value={baseboardInstallationLf}
          onChange={(e) => handleUpdate({ baseboardInstallationLf: parseFloat(e.target.value) || 0 })}
          className="w-full p-2 border rounded-md"
          placeholder="Linear feet of new baseboards"
        />
      </div>

      <div className="text-right">
        <button onClick={onRemove} className="text-red-500 hover:text-red-700 mt-4">
          <Trash2 className="inline-block w-5 h-5 mr-1" /> Remove Room
        </button>
      </div>
    </div>
  );
}
