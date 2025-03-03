
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
  
  const conditionOptions = [
    { value: "good", label: "Good Condition", description: "Walls are clean, smooth, and only need minimal preparation" },
    { value: "average", label: "Average Condition", description: "Some cracks, nail holes, or minor repairs needed" },
    { value: "poor", label: "Poor Condition", description: "Major repairs, patching or drywall work needed" }
  ];
  
  const paintTypeOptions = [
    { value: "standard", label: "Standard ($25/gallon)", description: "Good quality, basic paint suitable for most rooms" },
    { value: "premium", label: "Premium ($45/gallon)", description: "Superior coverage, more durable and washable" },
    { value: "luxury", label: "Luxury ($75/gallon)", description: "Top-tier, eco-friendly, lifetime warranty paint" }
  ];

  const addNewRoom = () => {
    const newRoom: RoomDetail = {
      id: uuidv4(),
      roomType: "bedroom",
      roomSize: "average",
      wallsCount: 4,
      wallHeight: 8,
      wallWidth: 10,
      condition: "good",
      paintType: "standard",
      includeCeiling: false,
      includeBaseboards: false,
      baseboardsMethod: "brush",
      includeCrownMolding: false,
      hasHighCeiling: false,
      includeCloset: false,
      isEmptyHouse: false,
      needFloorCovering: true,
      doorsCount: 0,
      windowsCount: 0
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
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addNewRoom}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Add Room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No rooms added yet. Click "Add Room" to begin.</p>
        </div>
      ) : (
        <div className="space-y-6">
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
                {/* Room Type */}
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <RadioGroup
                    defaultValue={room.roomType}
                    value={room.roomType}
                    onValueChange={(value) => updateRoomDetail(room.id, "roomType", value)}
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

                {/* Room Size */}
                <div className="space-y-2">
                  <Label>Room Size</Label>
                  <RadioGroup
                    value={room.roomSize}
                    onValueChange={(value: "small" | "average" | "large") => 
                      updateRoomDetail(room.id, "roomSize", value)
                    }
                    className="grid grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id={`${room.id}-size-small`} />
                      <Label htmlFor={`${room.id}-size-small`} className="cursor-pointer">
                        Small
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="average" id={`${room.id}-size-average`} />
                      <Label htmlFor={`${room.id}-size-average`} className="cursor-pointer">
                        Average
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id={`${room.id}-size-large`} />
                      <Label htmlFor={`${room.id}-size-large`} className="cursor-pointer">
                        Large
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Room Dimensions */}
                  <div className="space-y-2">
                    <Label>Wall Count</Label>
                    <Input
                      type="number"
                      value={room.wallsCount}
                      onChange={(e) =>
                        updateRoomDetail(room.id, "wallsCount", parseInt(e.target.value) || 1)
                      }
                      min={1}
                      max={20}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Wall Height (feet)</Label>
                    <Input
                      type="number"
                      value={room.wallHeight}
                      onChange={(e) =>
                        updateRoomDetail(room.id, "wallHeight", parseFloat(e.target.value) || 1)
                      }
                      min={1}
                      step={0.1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Wall Width (feet)</Label>
                    <Input
                      type="number"
                      value={room.wallWidth}
                      onChange={(e) =>
                        updateRoomDetail(room.id, "wallWidth", parseFloat(e.target.value) || 1)
                      }
                      min={1}
                      step={0.1}
                    />
                  </div>

                  {/* Wall Condition */}
                  <div className="space-y-2">
                    <Label>Wall Condition</Label>
                    <Select 
                      value={room.condition}
                      onValueChange={(value) => 
                        updateRoomDetail(room.id, "condition", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Paint Quality */}
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
                  
                  {/* Doors Count */}
                  <div className="space-y-2">
                    <Label>Doors to Paint</Label>
                    <Input
                      type="number"
                      value={room.doorsCount}
                      onChange={(e) =>
                        updateRoomDetail(room.id, "doorsCount", parseInt(e.target.value) || 0)
                      }
                      min={0}
                    />
                  </div>
                  
                  {/* Windows Count */}
                  <div className="space-y-2">
                    <Label>Windows to Paint</Label>
                    <Input
                      type="number"
                      value={room.windowsCount}
                      onChange={(e) =>
                        updateRoomDetail(room.id, "windowsCount", parseInt(e.target.value) || 0)
                      }
                      min={0}
                    />
                  </div>
                </div>

                {/* Additional Options Section */}
                <div className="border-t pt-4 mt-4">
                  <h5 className="font-medium mb-3">Additional Options</h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${room.id}-ceiling`} className="cursor-pointer">
                        Include Ceiling (+40%)
                      </Label>
                      <Switch 
                        id={`${room.id}-ceiling`} 
                        checked={room.includeCeiling}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "includeCeiling", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${room.id}-baseboards`} className="cursor-pointer">
                        Include Baseboards
                      </Label>
                      <Switch 
                        id={`${room.id}-baseboards`} 
                        checked={room.includeBaseboards}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "includeBaseboards", checked)}
                      />
                    </div>
                    
                    {room.includeBaseboards && (
                      <div className="ml-6 mt-2">
                        <RadioGroup
                          value={room.baseboardsMethod}
                          onValueChange={(value) => updateRoomDetail(room.id, "baseboardsMethod", value)}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="brush" id={`${room.id}-baseboards-brush`} />
                            <Label htmlFor={`${room.id}-baseboards-brush`} className="cursor-pointer">
                              Brush (+25%)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="spray" id={`${room.id}-baseboards-spray`} />
                            <Label htmlFor={`${room.id}-baseboards-spray`} className="cursor-pointer">
                              Spray (+50%)
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${room.id}-crown-molding`} className="cursor-pointer">
                        Include Crown Molding (+25%)
                      </Label>
                      <Switch 
                        id={`${room.id}-crown-molding`} 
                        checked={room.includeCrownMolding}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "includeCrownMolding", checked)}
                      />
                    </div>
                    
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
                      <Label htmlFor={`${room.id}-closet`} className="cursor-pointer">
                        Include Closet (+$60-300)
                      </Label>
                      <Switch 
                        id={`${room.id}-closet`} 
                        checked={room.includeCloset}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "includeCloset", checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Discounts Section */}
                <div className="border-t pt-4 mt-4">
                  <h5 className="font-medium mb-3">Room-Specific Discounts</h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${room.id}-empty`} className="cursor-pointer">
                        Room is Empty (15% discount)
                      </Label>
                      <Switch 
                        id={`${room.id}-empty`} 
                        checked={room.isEmptyHouse}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "isEmptyHouse", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${room.id}-floor-covering`} className="cursor-pointer">
                        Need Floor Covering? (5% discount if no)
                      </Label>
                      <Switch 
                        id={`${room.id}-floor-covering`} 
                        checked={room.needFloorCovering}
                        onCheckedChange={(checked) => updateRoomDetail(room.id, "needFloorCovering", checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiRoomSelector;
