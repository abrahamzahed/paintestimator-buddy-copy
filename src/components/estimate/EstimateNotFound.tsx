
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import EstimatePageLayout from "./EstimatePageLayout";

const EstimateNotFound = () => {
  return (
    <EstimatePageLayout>
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">Estimate not found</h3>
        <p className="text-muted-foreground mb-6">
          The estimate you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </EstimatePageLayout>
  );
};

export default EstimateNotFound;
