
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, House, FileText, DollarSign } from "lucide-react";
import { Lead, Estimate, Invoice } from "@/types";

interface DashboardMetricsProps {
  leads: Lead[];
  estimates: Estimate[];
  invoices: Invoice[];
}

const DashboardMetrics = ({
  leads,
  estimates,
  invoices,
}: DashboardMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">Total Leads</h3>
            <p className="text-3xl font-bold mt-2">{leads.length}</p>
          </div>
          <span className="bg-paint/10 p-2 rounded-full text-paint">
            <House className="w-6 h-6" />
          </span>
        </div>
      </div>
      
      <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">Estimates</h3>
            <p className="text-3xl font-bold mt-2">{estimates.length}</p>
          </div>
          <span className="bg-blue-500/10 p-2 rounded-full text-blue-500">
            <FileText className="w-6 h-6" />
          </span>
        </div>
      </div>
      
      <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">Invoices</h3>
            <p className="text-3xl font-bold mt-2">{invoices.length}</p>
          </div>
          <span className="bg-green-500/10 p-2 rounded-full text-green-500">
            <DollarSign className="w-6 h-6" />
          </span>
        </div>
      </div>
      
      <div className="bg-paint/10 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col h-full justify-between">
          <h3 className="font-semibold text-lg text-paint">Get Estimate</h3>
          <Button asChild className="mt-4 bg-paint hover:bg-paint-dark">
            <Link to="/dashboard/estimate">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Estimate
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;
