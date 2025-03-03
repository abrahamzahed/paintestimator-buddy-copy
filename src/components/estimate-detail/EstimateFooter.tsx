
import { Estimate } from "@/types";
import { Button } from "@/components/ui/button";
import { FileText, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EstimateFooterProps {
  estimate: Estimate;
}

const EstimateFooter = ({ estimate }: EstimateFooterProps) => {
  const navigate = useNavigate();
  
  const handleEdit = () => {
    navigate(`/estimate/edit/${estimate.id}`);
  };
  
  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex gap-2">
        {estimate?.status === "pending" && (
          <>
            <Button variant="outline" size="sm">Decline</Button>
            <Button className="bg-green-600 hover:bg-green-700" size="sm">Approve Estimate</Button>
          </>
        )}
        {estimate?.status === "approved" && (
          <p className="text-sm text-green-600">This estimate has been approved</p>
        )}
        {estimate?.status === "declined" && (
          <p className="text-sm text-red-600">This estimate has been declined</p>
        )}
        
        {estimate?.status !== "approved" && (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
      
      <Button variant="outline" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
    </div>
  );
};

export default EstimateFooter;
