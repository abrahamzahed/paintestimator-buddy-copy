
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
import { RoomDetail } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface MultiRoomSelectorProps {
  rooms: RoomDetail[];
  updateRooms: (rooms: RoomDetail[]) => void;
}

const MultiRoomSelector = ({ rooms, updateRooms }: MultiRoomSelectorProps) => {
  const roomTypeOptions = [
    "Bedroom", 
    "Master Bedroom", 
    "Living Room", 
    "Dining Room", 
    "Kitchen", 
    "Bathroom", 
    "Entryway", 
    "Hallway"
  ];
  
  const paintTypeOptions = [
    { value: "standard", label: "Standard ($25/gallon)", description: "Good quality, basic paint suitable for most rooms" },
    { value: "premium", label: "Premium ($45/gallon)", description: "Superior coverage, more durable and washable" },
    { value: "luxury", label: "Luxury ($75/gallon)", description: "Top-tier, eco-friendly, lifetime warranty paint" }
  ];

  const repairOptions = [
    { value: "none", label: "No Repairs" },
    { value: "minimal", label: "Minimal Repairs (+$50)" },
    { value: "extensive", label: "Extensive Repairs (+$200)" }
  ];

  const addNewRoom = () => {
    const newRoom: RoomDetail = {
      id: uuidv4(),
      roomTypeId: roomTypeOptions[0].toLowerCase(),
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
      baseboardInstallationLf: 0,
      baseboardType: "none",
      walkInClosetCount: 0,
      regularClosetCount: 0
    };
    
    updateRooms([...rooms, newRoom]);
  };

  const removeRoom = (roomId: string) => {
    const updatedRooms = rooms.filter(room => room.id !== roomId);
    updateRooms(updatedRooms);
  };

  const updateRoomDetail = (roomId: string, field: keyof RoomDetail, value: any) => {
    const updatedRooms = rooms.map(room => {
      if (room.id === roomId) {
        return { ...room, [field]: value };
      }
      return room;
    });
    
    updateRooms(updatedRooms);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-semibold">Rooms to Paint</Label>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No rooms added yet. Click "Add Room" to begin.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {rooms.map((room, index) => (
            <div key={room.id} className="border rounded-lg p-4 relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRoom(room.id)}
                className="absolute top-2 right-2 h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <h4 className="text-md font-medium mb-4">Room {index + 1}</h4>
              
              <div className="space-y-4">
                {/* Room Type Selection */}
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <RadioGroup
                    defaultValue={room.roomTypeId}
                    value={room.roomTypeId}
                    onValueChange={(value) => updateRoomDetail(room.id, "roomTypeId", value)}
                    className="grid grid-cols-2 gap-2"
                  >
                    {roomTypeOptions.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.toLowerCase()} id={`${room.id}-${type.toLowerCase()}`} />
                        <Label htmlFor={`${room.id}-${type.toLowerCase()}`} className="cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Room Size Selection */}
                <div className="space-y-2">
                  <Label>Room Size</Label>
                  <Select 
                    value={room.size}
                    onValueChange={(value) => 
                      updateRoomDetail(room.id, "size", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Paint Type Selection */}
                  <div className="space-y-2">
                    <Label>Paint Quality</Label>
                    <Select 
                      value={room.paintType}
                      onValueChange={(value) => 
                        updateRoomDetail(room.id, "paintType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select paint type" />
                      </SelectTrigger>
                      <SelectContent>
                        {paintTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Repairs Selection */}
                  <div className="space-y-2">
                    <Label>Wall Repairs Needed</Label>
                    <Select 
                      value={room.repairs}
                      onValueChange={(value) => 
                        updateRoomDetail(room.id, "repairs", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select repair level" />
                      </SelectTrigger>
                      <SelectContent>
                        {repairOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Door Configuration */}
                  <div className="space-y-2">
                    <Label>Doors to Paint</Label>
                    <Input
                      type="number"
                      value={room.numberOfDoors}
                      onChange={(e) =>
                        updateRoomDetail(room.id, "numberOfDoors", parseInt(e.target.value) || 0)
                      }
                      min={0}
                    />
                  </div>
                  
                  {room.numberOfDoors > 0 && (
                    <div className="space-y-2">
                      <Label>Door Painting Method</Label>
                      <Select 
                        value={room.doorPaintingMethod}
                        onValueChange={(value) => 
                          updateRoomDetail(room.id, "doorPaintingMethod", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brush">Brush</SelectItem>
                          <SelectItem value="spray">Spray</SelectItem>
                          <SelectItem value="none">Don't Paint</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Window Configuration */}
                  <div className="space-y-2">
                    <Label>Windows to Paint</Label>
                    <Input
                      type="number"
                      value={room.numberOfWindows}
                      onChange={(e) =>
                        updateRoomDetail(room.id, "numberOfWindows", parseInt(e.target.value) || 0)
                      }
                      min={0}
                    />
                  </div>
                  
                  {room.numberOfWindows > 0 && (
                    <div className="space-y-2">
                      <Label>Window Painting Method</Label>
                      <Select 
                        value={room.windowPaintingMethod}
                        onValueChange={(value) => 
                          updateRoomDetail(room.id, "windowPaintingMethod", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brush">Brush</SelectItem>
                          <SelectItem value="spray">Spray</SelectItem>
                          <SelectItem value="none">Don't Paint</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Baseboard Options */}
                  <div className="space-y-2">
                    <Label>Baseboard Type</Label>
                    <Select 
                      value={room.baseboardType}
                      onValueChange={(value) => 
                        updateRoomDetail(room.id, "baseboardType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Baseboards</SelectItem>
                        <SelectItem value="brush">Brush Painted</SelectItem>
                        <SelectItem value="spray">Spray Painted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {room.baseboardType !== 'none' && (
                    <div className="space-y-2">
                      <Label>Baseboard Installation (linear feet)</Label>
                      <Input
                        type="number"
                        value={room.baseboardInstallationLf}
                        onChange={(e) =>
                          updateRoomDetail(room.id, "baseboardInstallationLf", parseInt(e.target.value) || 0)
                        }
                        min={0}
                      />
                    </div>
                  )}
                  
                  {/* Closet Configuration */}
                  <div className="space-y-2">
                    <Label>Regular Closets</Label>
                    <Input
                      type="number"
                      value={room.regularClosetCount}
                      onChange={(e) =>
                        updateRoomDetail(room.id, "regularClosetCount", parseInt(e.target.value) || 0)
                      }
                      min={0}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Walk-in Closets</Label>
                    <Input
                      type="number"
                      value={room.walkInClosetCount}
                      onChange={(e) =>
                        updateRoomDetail(room.id, "walkInClosetCount", parseInt(e.target.value) || 0)
                      }
                      min={0}
                    />
                  </div>
                </div>

                {/* Fireplace Options */}
                <div className="space-y-2">
                  <Label>Fireplace Mantel</Label>
                  <Select 
                    value={room.fireplaceMethod}
                    onValueChange={(value) => 
                      updateRoomDetail(room.id, "fireplaceMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fireplace option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Fireplace</SelectItem>
                      <SelectItem value="brush">Brush Painted</SelectItem>
                      <SelectItem value="spray">Spray Painted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Options Toggles */}
                <div className="border-t pt-4 mt-4">
                  <h5 className="font-medium mb-3">Additional Options</h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${room.id}-high-ceiling`} className="cursor-pointer">
                        Has High Ceiling (+$300-600)
                      </Label>
                      <Switch 
                        id={`${room.id}-high-ceiling`} 
                        checked={room.hasHighCeiling}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "hasHighCeiling", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${room.id}-stair-railing`} className="cursor-pointer">
                        Includes Stair Railing (+$250)
                      </Label>
                      <Switch 
                        id={`${room.id}-stair-railing`} 
                        checked={room.hasStairRailing}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "hasStairRailing", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${room.id}-two-colors`} className="cursor-pointer">
                        Two Colors (+10%)
                      </Label>
                      <Switch 
                        id={`${room.id}-two-colors`} 
                        checked={room.twoColors}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "twoColors", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${room.id}-millwork-priming`} className="cursor-pointer">
                        Millwork Priming Needed (+50%)
                      </Label>
                      <Switch 
                        id={`${room.id}-millwork-priming`} 
                        checked={room.millworkPrimingNeeded}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "millworkPrimingNeeded", checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Discount Options */}
                <div className="border-t pt-4 mt-4">
                  <h5 className="font-medium mb-3">Room-Specific Discounts</h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${room.id}-empty`} className="cursor-pointer">
                        Room is Empty (15% discount)
                      </Label>
                      <Switch 
                        id={`${room.id}-empty`} 
                        checked={room.isEmpty}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "isEmpty", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${room.id}-floor-covering`} className="cursor-pointer">
                        No Floor Covering Needed (5% discount)
                      </Label>
                      <Switch 
                        id={`${room.id}-floor-covering`} 
                        checked={room.noFloorCovering}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "noFloorCovering", checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-center mt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={addNewRoom}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Room
        </Button>
      </div>
    </div>
  );
};

export default MultiRoomSelector;
