
// This file is read-only, but we need to modify the props interface

interface DynamicEstimatorFormProps {
  onEstimateComplete: (estimate: EstimatorSummary, rooms: RoomDetails[]) => void;
  initialUserData?: {
    name: string;
    email: string;
    phone?: string;
  };
}
