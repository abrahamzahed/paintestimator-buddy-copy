
import { Estimate } from "@/types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle } from "lucide-react";

interface EstimatesListProps {
  estimates: Estimate[];
  projectId?: string;
  projectStatus: string;
}

const EstimatesList = ({ estimates, projectId, projectStatus }: EstimatesListProps) => {
  if (estimates.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {estimates.map((estimate) => (
          <Card key={estimate.id} className="hover:bg-secondary/20 transition-colors overflow-hidden border border-gray-100 shadow-sm">
            <div className={`h-2 w-full ${
              estimate.status === "pending" 
                ? "bg-yellow-400" 
                : estimate.status === "approved" 
                ? "bg-green-400"
                : "bg-gray-400"
            }`}></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Estimate #{estimate.id?.substring(0, 8)}</CardTitle>
              <CardDescription>
                {new Date(estimate.created_at!).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-semibold">${estimate.total_cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={`px-2 py-1 rounded text-xs inline-block ${
                      estimate.status === "pending" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : estimate.status === "approved" 
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {estimate.status}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to={`/estimate/${estimate.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="text-center py-12 bg-secondary/30 rounded-lg">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
      <p className="text-lg font-medium mb-2">No estimates yet</p>
      <p className="text-muted-foreground mb-6">
        Create your first estimate for this project
      </p>
      {projectStatus === "active" && projectId && (
        <Button asChild className="bg-paint hover:bg-paint-dark">
          <Link to="/dashboard/estimate">
            <PlusCircle className="mr-2 h-4 w-4" />
            Get Estimate
          </Link>
        </Button>
      )}
    </div>
  );
};

export default EstimatesList;
