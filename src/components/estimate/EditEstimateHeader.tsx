
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditEstimateHeaderProps {
  estimateId: string;
}

const EditEstimateHeader = ({ estimateId }: EditEstimateHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center mb-6">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(`/estimate/${estimateId}`)}
        className="mr-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Estimate
      </Button>
      <h2 className="text-2xl font-bold">Edit Estimate</h2>
    </div>
  );
};

export default EditEstimateHeader;
