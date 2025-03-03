
import { Estimate } from "@/types";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface EstimateFooterProps {
  estimate: Estimate;
}

const EstimateFooter = ({ estimate }: EstimateFooterProps) => {
  return (
    <div className="w-full flex justify-between items-center">
      {estimate?.status === "pending" && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Decline</Button>
          <Button className="bg-green-600 hover:bg-green-700" size="sm">Approve Estimate</Button>
        </div>
      )}
      {estimate?.status === "approved" && (
        <p className="text-sm text-green-600">This estimate has been approved</p>
      )}
      {estimate?.status === "declined" && (
        <p className="text-sm text-red-600">This estimate has been declined</p>
      )}
      <Button variant="outline" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
    </div>
  );
};

export default EstimateFooter;
