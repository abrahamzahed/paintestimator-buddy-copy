
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RoomDetails, EstimatorSummary } from "@/types/estimator";
import { v4 as uuidv4 } from "uuid";
import { PlusCircle, Trash, Edit, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CurrentEstimatePanel from "./estimator/CurrentEstimatePanel";

interface DynamicEstimatorFormProps {
  onEstimateComplete: (estimate: EstimatorSummary, rooms: RoomDetails[]) => void;
  isSubmitting?: boolean;
}

const DynamicEstimatorForm = ({ onEstimateComplete, isSubmitting = false }: DynamicEstimatorFormProps) => {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<RoomDetails[]>([]);
  const [showEstimate, setShowEstimate] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<EstimatorSummary | null>(null);
  const [editingRoom, setEditingRoom] = useState<RoomDetails | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Default new room template
  const defaultRoom: RoomDetails = {
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
  };
  
  const [newRoom, setNewRoom] = useState<RoomDetails>({ ...defaultRoom });

  // Sample room pricing and cost data
  const roomTypes = [
    { id: "bedroom", name: "Bedroom", basePrice: 350 },
    { id: "livingroom", name: "Living Room", basePrice: 500 },
    { id: "bathroom", name: "Bathroom", basePrice: 200 },
    { id: "kitchen", name: "Kitchen", basePrice: 500 },
    { id: "diningroom", name: "Dining Room", basePrice: 350 },
    { id: "office", name: "Office", basePrice: 350 },
    { id: "hallway", name: "Hallway", basePrice: 200 }
  ];
  
  const roomSizes = [
    { id: "small", name: "Small", multiplier: 0.8 },
    { id: "average", name: "Average", multiplier: 1 },
    { id: "large", name: "Large", multiplier: 1.3 }
  ];
  
  const paintTypes = [
    { id: "standard", name: "Standard", upcharge: 0 },
    { id: "premium", name: "Premium", upcharge: 150 }
  ];

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setNewRoom({ ...newRoom, [name]: checkbox.checked });
    } else if (type === "number") {
      setNewRoom({ ...newRoom, [name]: parseInt(value) || 0 });
    } else {
      setNewRoom({ ...newRoom, [name]: value });
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewRoom({ ...newRoom, [name]: checked });
  };

  // Add or update room
  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIndex !== null && editingRoom) {
      // Update existing room
      const updatedRooms = [...rooms];
      updatedRooms[editingIndex] = { ...newRoom, id: editingRoom.id };
      setRooms(updatedRooms);
      setEditingRoom(null);
      setEditingIndex(null);
    } else {
      // Add new room
      setRooms([...rooms, { ...newRoom, id: uuidv4() }]);
    }
    
    // Reset form
    setNewRoom({ ...defaultRoom, id: uuidv4() });
    
    toast({
      title: editingIndex !== null ? "Room updated" : "Room added",
      description: `The room has been ${editingIndex !== null ? "updated" : "added"} successfully.`
    });
  };

  // Edit room
  const handleEditRoom = (index: number) => {
    const roomToEdit = rooms[index];
    setEditingRoom(roomToEdit);
    setEditingIndex(index);
    setNewRoom(roomToEdit);
  };

  // Delete room
  const handleDeleteRoom = (index: number) => {
    const updatedRooms = [...rooms];
    updatedRooms.splice(index, 1);
    setRooms(updatedRooms);
    
    toast({
      title: "Room removed",
      description: "The room has been removed from your estimate."
    });
  };

  // Calculate estimate
  const calculateEstimate = () => {
    if (rooms.length === 0) {
      toast({
        title: "No rooms added",
        description: "Please add at least one room to calculate an estimate.",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate costs for each room
    const roomCosts = rooms.map(room => {
      const roomType = roomTypes.find(type => type.id === room.roomTypeId) || roomTypes[0];
      const sizeMultiplier = roomSizes.find(size => size.id === room.size)?.multiplier || 1;
      const paintUpcharge = paintTypes.find(paint => paint.id === room.paintType)?.upcharge || 0;
      
      const basePrice = roomType.basePrice;
      const doorCost = room.doorPaintingMethod !== "none" ? room.numberOfDoors * 35 : 0;
      const windowCost = room.windowPaintingMethod !== "none" ? room.numberOfWindows * 30 : 0;
      const fireplaceCost = room.fireplaceMethod !== "none" ? 150 : 0;
      const railingCost = room.hasStairRailing ? 150 : 0;
      const twoColorCost = room.twoColors ? 75 : 0;
      const millworkPrimingCost = room.millworkPrimingNeeded ? 125 : 0;
      
      let repairsCost = 0;
      if (room.repairs === "minimal") repairsCost = 50;
      if (room.repairs === "extensive") repairsCost = 150;
      
      const baseboardInstallCost = room.baseboardInstallationLf * 5;
      
      const highCeilingCost = room.hasHighCeiling ? basePrice * 0.2 : 0;
      const discountEmptyHouse = room.isEmpty ? -basePrice * 0.05 : 0;
      const discountNoFloor = room.noFloorCovering ? -basePrice * 0.05 : 0;
      
      // Check if only extras are being painted
      let onlyExtraSurcharge = 0;
      if (basePrice === 0 && (doorCost > 0 || windowCost > 0 || fireplaceCost > 0 || railingCost > 0)) {
        onlyExtraSurcharge = 75; // Minimum charge for only painting extras
      }
      
      const totalBeforeVolume = 
        basePrice * sizeMultiplier + 
        paintUpcharge + 
        highCeilingCost + 
        doorCost + 
        windowCost + 
        fireplaceCost + 
        railingCost + 
        twoColorCost + 
        millworkPrimingCost + 
        repairsCost + 
        baseboardInstallCost + 
        discountEmptyHouse + 
        discountNoFloor + 
        onlyExtraSurcharge;
      
      return {
        basePrice,
        paintUpcharge,
        addonCost: 0, // For future use
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
    
    // Calculate subtotal
    const subtotal = roomCosts.reduce((sum, room) => sum + room.totalBeforeVolume, 0);
    
    // Apply volume discount
    let volumeDiscount = 0;
    if (rooms.length >= 3 && rooms.length < 5) {
      volumeDiscount = subtotal * 0.05;
    } else if (rooms.length >= 5) {
      volumeDiscount = subtotal * 0.1;
    }
    
    const finalTotal = subtotal - volumeDiscount;
    
    const estimateSummary: EstimatorSummary = {
      roomCosts,
      subtotal,
      volumeDiscount,
      finalTotal
    };
    
    setCurrentEstimate(estimateSummary);
    setShowEstimate(true);
    
    toast({
      title: "Estimate calculated",
      description: `Total estimate: $${finalTotal.toFixed(2)}`
    });
  };

  // Submit the estimate
  const handleSubmitEstimate = () => {
    if (!currentEstimate) {
      toast({
        title: "No estimate available",
        description: "Please calculate an estimate first.",
        variant: "destructive"
      });
      return;
    }
    
    onEstimateComplete(currentEstimate, rooms);
  };

  // Get room type name
  const getRoomTypeName = (typeId: string) => {
    return roomTypes.find(type => type.id === typeId)?.name || "Room";
  };

  // Render the form
  return (
    <div className="space-y-6">
      {/* Room Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Room Details</h3>
        <form onSubmit={handleRoomSubmit} className="space-y-4 p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomTypeId">Room Type</Label>
              <select
                id="roomTypeId"
                name="roomTypeId"
                value={newRoom.roomTypeId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                {roomTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size">Room Size</Label>
              <select
                id="size"
                name="size"
                value={newRoom.size}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                {roomSizes.map(size => (
                  <option key={size.id} value={size.id}>{size.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paintType">Paint Quality</Label>
              <select
                id="paintType"
                name="paintType"
                value={newRoom.paintType || "standard"}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                {paintTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="repairs">Wall Repairs Needed</Label>
              <select
                id="repairs"
                name="repairs"
                value={newRoom.repairs}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="none">None</option>
                <option value="minimal">Minimal</option>
                <option value="extensive">Extensive</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfDoors">Number of Doors</Label>
              <Input
                id="numberOfDoors"
                name="numberOfDoors"
                type="number"
                min="0"
                value={newRoom.numberOfDoors}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doorPaintingMethod">Door Painting Method</Label>
              <select
                id="doorPaintingMethod"
                name="doorPaintingMethod"
                value={newRoom.doorPaintingMethod}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={newRoom.numberOfDoors === 0}
              >
                <option value="none">Not Painting</option>
                <option value="brush">Brush</option>
                <option value="spray">Spray</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfWindows">Number of Windows</Label>
              <Input
                id="numberOfWindows"
                name="numberOfWindows"
                type="number"
                min="0"
                value={newRoom.numberOfWindows}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="windowPaintingMethod">Window Painting Method</Label>
              <select
                id="windowPaintingMethod"
                name="windowPaintingMethod"
                value={newRoom.windowPaintingMethod}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={newRoom.numberOfWindows === 0}
              >
                <option value="none">Not Painting</option>
                <option value="brush">Brush</option>
                <option value="spray">Spray</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fireplaceMethod">Fireplace Painting</Label>
              <select
                id="fireplaceMethod"
                name="fireplaceMethod"
                value={newRoom.fireplaceMethod}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="none">Not Painting</option>
                <option value="brush">Brush</option>
                <option value="spray">Spray</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baseboardInstallationLf">Baseboard Installation (Linear Feet)</Label>
              <Input
                id="baseboardInstallationLf"
                name="baseboardInstallationLf"
                type="number"
                min="0"
                value={newRoom.baseboardInstallationLf}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="hasHighCeiling"
                name="hasHighCeiling"
                type="checkbox"
                checked={newRoom.hasHighCeiling}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <Label htmlFor="hasHighCeiling">Has High Ceiling (9ft+)</Label>
            </div>
            
            <div className="flex items-center">
              <input
                id="twoColors"
                name="twoColors"
                type="checkbox"
                checked={newRoom.twoColors}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <Label htmlFor="twoColors">Two Colors (Accent Wall)</Label>
            </div>
            
            <div className="flex items-center">
              <input
                id="hasStairRailing"
                name="hasStairRailing"
                type="checkbox"
                checked={newRoom.hasStairRailing}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <Label htmlFor="hasStairRailing">Has Stair Railing</Label>
            </div>
            
            <div className="flex items-center">
              <input
                id="millworkPrimingNeeded"
                name="millworkPrimingNeeded"
                type="checkbox"
                checked={newRoom.millworkPrimingNeeded}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <Label htmlFor="millworkPrimingNeeded">Millwork Priming Needed</Label>
            </div>
            
            <div className="flex items-center">
              <input
                id="isEmpty"
                name="isEmpty"
                type="checkbox"
                checked={newRoom.isEmpty}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <Label htmlFor="isEmpty">Room is Empty (5% Discount)</Label>
            </div>
            
            <div className="flex items-center">
              <input
                id="noFloorCovering"
                name="noFloorCovering"
                type="checkbox"
                checked={newRoom.noFloorCovering}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <Label htmlFor="noFloorCovering">No Floor Covering Needed (5% Discount)</Label>
            </div>
          </div>
          
          <Button 
            type="submit"
            className="w-full"
          >
            {editingIndex !== null ? (
              <>
                <Edit className="mr-1 h-4 w-4" />
                Update Room
              </>
            ) : (
              <>
                <PlusCircle className="mr-1 h-4 w-4" />
                Add Room
              </>
            )}
          </Button>
        </form>
      </div>
      
      {/* Room list */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Added Rooms ({rooms.length})</h3>
        {rooms.length === 0 ? (
          <div className="text-center p-4 border rounded-lg bg-secondary/20">
            <p className="text-muted-foreground">No rooms added yet. Add a room using the form above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map((room, index) => (
              <div key={room.id} className="border rounded-lg p-3 flex justify-between items-center">
                <div>
                  <h4 className="font-medium">
                    {getRoomTypeName(room.roomTypeId)} ({room.size})
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    {room.hasHighCeiling && "High Ceiling • "}
                    {room.paintType === "premium" && "Premium Paint • "}
                    {room.numberOfDoors > 0 && room.doorPaintingMethod !== "none" && `${room.numberOfDoors} Doors • `}
                    {room.numberOfWindows > 0 && room.windowPaintingMethod !== "none" && `${room.numberOfWindows} Windows • `}
                    {room.twoColors && "Two Colors • "}
                    {room.fireplaceMethod !== "none" && "Fireplace • "}
                    {room.hasStairRailing && "Stair Railing • "}
                    {room.repairs !== "none" && `${room.repairs} Repairs • `}
                    {room.baseboardInstallationLf > 0 && `${room.baseboardInstallationLf}ft Baseboards`}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditRoom(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteRoom(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Calculate/submit estimate */}
      <div className="space-y-4">
        {!showEstimate ? (
          <Button 
            onClick={calculateEstimate}
            className="w-full bg-paint hover:bg-paint-dark"
            disabled={rooms.length === 0}
          >
            <Calculator className="mr-1 h-4 w-4" />
            Calculate Estimate
          </Button>
        ) : (
          <>
            {/* Display estimate */}
            {currentEstimate && (
              <div className="space-y-4">
                <CurrentEstimatePanel currentEstimate={currentEstimate} />
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEstimate(false);
                      setCurrentEstimate(null);
                    }}
                  >
                    Recalculate
                  </Button>
                  
                  <Button 
                    className="bg-paint hover:bg-paint-dark"
                    onClick={handleSubmitEstimate}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Estimate"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DynamicEstimatorForm;
