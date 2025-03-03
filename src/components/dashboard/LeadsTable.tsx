
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Lead } from "@/types";

interface LeadsTableProps {
  leads: Lead[];
}

const LeadsTable = ({ leads }: LeadsTableProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Recent Leads</h3>
        <Button variant="outline" asChild>
          <Link to="/estimate">New Lead</Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-4 text-left">Service</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.slice(0, 5).map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-secondary/50">
                <td className="py-3 px-4">{lead.service_type}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    lead.status === "new" 
                      ? "bg-blue-100 text-blue-800" 
                      : lead.status === "contacted" 
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {new Date(lead.created_at!).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTable;
