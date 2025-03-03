
import React from "react";
import { Button } from "@/components/ui/button";
import { Estimate } from "@/types";

interface EstimatesTableProps {
  estimates: Estimate[];
}

const EstimatesTable = ({ estimates }: EstimatesTableProps) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Recent Estimates</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Total</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {estimates.slice(0, 5).map((estimate) => (
              <tr key={estimate.id} className="border-b hover:bg-secondary/50">
                <td className="py-3 px-4">{estimate.id?.substring(0, 8)}</td>
                <td className="py-3 px-4">${estimate.total_cost.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    estimate.status === "pending" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : estimate.status === "approved" 
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {estimate.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {new Date(estimate.created_at!).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <Button variant="ghost" size="sm">
                    View
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

export default EstimatesTable;
