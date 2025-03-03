
import { RoomDetail } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface RoomDetailCardProps {
  room: RoomDetail;
}

const RoomDetailCard = ({ room }: RoomDetailCardProps) => {
  return (
    <Card key={room.id} className="border">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base">
          {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-muted-foreground">Dimensions:</div>
            <div>{room.wallsCount} walls, {room.wallHeight}′ × {room.wallWidth}′</div>
            
            <div className="text-muted-foreground">Paint Type:</div>
            <div>{room.paintType.charAt(0).toUpperCase() + room.paintType.slice(1)}</div>
            
            <div className="text-muted-foreground">Wall Condition:</div>
            <div>{room.condition.charAt(0).toUpperCase() + room.condition.slice(1)}</div>
          </div>
          
          <div className="mt-2 pt-2 border-t">
            <div className="font-medium mb-1">Additional Options:</div>
            <ul className="space-y-1">
              <li className="flex items-center">
                {room.includeCeiling ? 
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                  <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                <span>Ceiling</span>
              </li>
              <li className="flex items-center">
                {room.includeBaseboards ? 
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                  <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                <span>Baseboards {room.includeBaseboards && `(${room.baseboardsMethod})`}</span>
              </li>
              <li className="flex items-center">
                {room.includeCrownMolding ? 
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                  <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                <span>Crown Molding</span>
              </li>
              <li className="flex items-center">
                {room.hasHighCeiling ? 
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                  <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                <span>High Ceiling</span>
              </li>
              <li className="flex items-center">
                {room.includeCloset ? 
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                  <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                <span>Closet</span>
              </li>
            </ul>
          </div>
          
          {(room.doorsCount > 0 || room.windowsCount > 0) && (
            <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-2">
              {room.doorsCount > 0 && (
                <>
                  <div className="text-muted-foreground">Doors:</div>
                  <div>{room.doorsCount}</div>
                </>
              )}
              {room.windowsCount > 0 && (
                <>
                  <div className="text-muted-foreground">Windows:</div>
                  <div>{room.windowsCount}</div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomDetailCard;
