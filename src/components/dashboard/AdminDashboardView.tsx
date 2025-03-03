
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { House, FileText, DollarSign, ChevronRight } from "lucide-react";
import { Project, Estimate, Invoice } from "@/types";

interface AdminDashboardViewProps {
  projects: Project[];
  estimates: Estimate[];
  invoices: Invoice[];
  handleAdminRedirect: () => void;
}

const AdminDashboardView = ({
  projects,
  estimates,
  invoices,
  handleAdminRedirect,
}: AdminDashboardViewProps) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">Recent Projects</h3>
              <p className="text-3xl font-bold mt-2">{projects.length}</p>
            </div>
            <span className="bg-paint/10 p-2 rounded-full text-paint">
              <House className="w-6 h-6" />
            </span>
          </div>
        </div>
        
        <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">Recent Estimates</h3>
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
              <h3 className="font-semibold text-lg">Recent Invoices</h3>
              <p className="text-3xl font-bold mt-2">{invoices.length}</p>
            </div>
            <span className="bg-green-500/10 p-2 rounded-full text-green-500">
              <DollarSign className="w-6 h-6" />
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-6">
          For complete administration access, visit the admin dashboard
        </p>
        <Button asChild className="bg-paint hover:bg-paint-dark">
          <Link to="/admin">
            Go to Admin Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboardView;
