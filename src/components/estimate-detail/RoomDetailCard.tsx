
import { RoomDetail } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface RoomDetailCardProps {
  room: RoomDetail;
}

const RoomDetailCard = ({ room }: RoomDetailCardProps) => {
  // Get room type name for display
  const getRoomTypeName = (roomTypeId: string) => {
    return roomTypeId.charAt(0).toUpperCase() + roomTypeId.slice(1);
  };

  return (
    <Card className="border">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base">
          {getRoomTypeName(room.roomType || room.roomTypeId)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-muted-foreground">Size:</div>
            <div>{(room.roomSize || room.size).charAt(0).toUpperCase() + (room.roomSize || room.size).slice(1)}</div>
            
            <div className="text-muted-foreground">Paint Type:</div>
            <div>{room.paintType?.charAt(0).toUpperCase() + room.paintType?.slice(1) || 'Standard'}</div>
          </div>
          
          <div className="mt-2 pt-2 border-t">
            <div className="font-medium mb-1">Options:</div>
            <ul className="space-y-1">
              <li className="flex items-center">
                {room.hasHighCeiling ? 
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                  <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                <span>High Ceiling</span>
              </li>
              {room.twoColors !== undefined && (
                <li className="flex items-center">
                  {room.twoColors ? 
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                    <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                  <span>Two Colors</span>
                </li>
              )}
              {(room.baseboardType || room.includeBaseboards) && (
                <li className="flex items-center">
                  {(room.baseboardType && room.baseboardType !== 'none') || room.includeBaseboards ? 
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                    <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                  <span>Baseboards {(room.baseboardType && room.baseboardType !== 'none') && `(${room.baseboardType})`}
                          {room.includeBaseboards && !room.baseboardType && `(${room.baseboardsMethod || 'brush'})`}</span>
                </li>
              )}
              {(room.millworkPrimingNeeded !== undefined) && (
                <li className="flex items-center">
                  {room.millworkPrimingNeeded ? 
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                    <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                  <span>Millwork Priming</span>
                </li>
              )}
              {(room.hasStairRailing !== undefined) && (
                <li className="flex items-center">
                  {room.hasStairRailing ? 
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                    <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                  <span>Stair Railing</span>
                </li>
              )}
              {(room.repairs !== undefined) && (
                <li className="flex items-center">
                  {room.repairs && room.repairs !== 'none' ? 
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                    <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                  <span>Repairs {room.repairs && room.repairs !== 'none' && `(${room.repairs})`}</span>
                </li>
              )}
              
              {/* Closet information */}
              {((room.walkInClosetCount || room.regularClosetCount || room.includeCloset)) && (
                <li className="flex items-center">
                  {(room.walkInClosetCount > 0 || room.regularClosetCount > 0 || room.includeCloset) ? 
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                    <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                  <span>
                    Closets: 
                    {room.walkInClosetCount > 0 && ` ${room.walkInClosetCount} walk-in`}
                    {room.walkInClosetCount > 0 && room.regularClosetCount > 0 && ', '}
                    {room.regularClosetCount > 0 && ` ${room.regularClosetCount} regular`}
                    {!room.walkInClosetCount && !room.regularClosetCount && room.includeCloset && ' Included'}
                  </span>
                </li>
              )}
            </ul>
          </div>
          
          {/* Doors and Windows */}
          {((room.doorPaintingMethod && room.doorPaintingMethod !== 'none') || 
            (room.windowPaintingMethod && room.windowPaintingMethod !== 'none') ||
            room.doorsCount > 0 || room.windowsCount > 0) && (
            <div className="mt-2 pt-2 border-t">
              <div className="font-medium mb-1">Additional Features:</div>
              <ul className="space-y-1">
                {((room.doorPaintingMethod && room.doorPaintingMethod !== 'none') || room.doorsCount > 0) && (
                  <li className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />
                    <span>
                      Doors: {room.numberOfDoors || room.doorsCount} 
                      {room.doorPaintingMethod && room.doorPaintingMethod !== 'none' && ` (${room.doorPaintingMethod} painting)`}
                    </span>
                  </li>
                )}
                
                {((room.windowPaintingMethod && room.windowPaintingMethod !== 'none') || room.windowsCount > 0) && (
                  <li className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />
                    <span>
                      Windows: {room.numberOfWindows || room.windowsCount}
                      {room.windowPaintingMethod && room.windowPaintingMethod !== 'none' && ` (${room.windowPaintingMethod} painting)`}
                    </span>
                  </li>
                )}
                
                {(room.fireplaceMethod && room.fireplaceMethod !== 'none') && (
                  <li className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />
                    <span>Fireplace ({room.fireplaceMethod} painting)</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomDetailCard;
