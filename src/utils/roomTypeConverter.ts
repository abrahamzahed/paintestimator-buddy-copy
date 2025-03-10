
import { RoomDetail } from "@/types";
import { RoomDetails } from "@/types/estimator";

/**
 * Converts RoomDetails from the dynamic estimator to RoomDetail for the legacy estimator
 */
export const convertToRoomDetail = (rooms: RoomDetails[]): RoomDetail[] => {
  return rooms.map(room => ({
    id: room.id,
    roomType: room.roomTypeId,
    roomSize: room.size,
    wallsCount: 4, // Default value
    wallHeight: 8, // Default value
    wallWidth: 10, // Default value
    condition: "good", // Default value
    paintType: room.paintType || "standard",
    includeCeiling: false, // Default value
    includeBaseboards: room.baseboardInstallationLf > 0,
    baseboardsMethod: "brush", // Default value
    includeCrownMolding: false, // Default value
    hasHighCeiling: room.hasHighCeiling,
    includeCloset: false, // Default value
    isEmptyHouse: room.isEmpty,
    needFloorCovering: !room.noFloorCovering,
    doorsCount: room.numberOfDoors,
    windowsCount: room.numberOfWindows
  }));
};
