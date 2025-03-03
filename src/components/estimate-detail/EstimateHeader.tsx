
import { Estimate } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface EstimateHeaderProps {
  estimate: Estimate;
}

const EstimateHeader = ({ estimate }: EstimateHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/project/${estimate?.project_id}`}>
            <ChevronLeft className="h-4 w-4" />
            Back to Project
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Estimate #{estimate?.id?.substring(0, 8)}</h1>
      </div>
      <div className={`px-3 py-1 rounded text-sm ${
        estimate?.status === "pending" 
          ? "bg-yellow-100 text-yellow-800" 
          : estimate?.status === "approved" 
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800"
      }`}>
        {estimate?.status?.toUpperCase()}
      </div>
    </div>
  );
};

export default EstimateHeader;
