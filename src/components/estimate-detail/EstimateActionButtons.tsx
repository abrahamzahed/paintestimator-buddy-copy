
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, Edit } from "lucide-react";

interface EstimateActionButtonsProps {
  onHome: () => void;
  onDashboard: () => void;
  onEdit: () => void;
}

const EstimateActionButtons = ({ 
  onHome, 
  onDashboard, 
  onEdit 
}: EstimateActionButtonsProps) => {
  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          variant="outline"
          onClick={onHome}
          className="flex items-center"
        >
          <Home className="mr-2 h-4 w-4" />
          Return Home
        </Button>
        
        <Button 
          className="bg-paint hover:bg-paint-dark flex items-center"
          onClick={onDashboard}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
        
        <Button 
          variant="outline"
          onClick={onEdit}
          className="flex items-center"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>
    </div>
  );
};

export default EstimateActionButtons;
