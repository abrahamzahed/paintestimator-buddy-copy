
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, House, FileText, DollarSign } from "lucide-react";
import { Lead, Estimate, Invoice } from "@/types";
import DashboardMetrics from "./DashboardMetrics";
import LeadsTable from "./LeadsTable";
import EstimatesTable from "./EstimatesTable";

interface CustomerDashboardViewProps {
  leads: Lead[];
  estimates: Estimate[];
  invoices: Invoice[];
}

const CustomerDashboardView = ({
  leads,
  estimates,
  invoices,
}: CustomerDashboardViewProps) => {
  return (
    <div>
      <DashboardMetrics 
        leads={leads} 
        estimates={estimates} 
        invoices={invoices} 
      />

      {leads.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No leads yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by creating your first estimate
          </p>
          <Button asChild className="bg-paint hover:bg-paint-dark">
            <Link to="/estimate">
              <PlusCircle className="mr-2 h-4 w-4" />
              Get Estimate
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <LeadsTable leads={leads} />

          {estimates.length > 0 && <EstimatesTable estimates={estimates} />}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboardView;
