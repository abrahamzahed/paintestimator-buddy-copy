
import React from "react";

const EstimateFooterInfo = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-sm font-medium mb-1">PAYMENT TERMS</h3>
        <p className="text-sm">Payment is due within 30 days of service completion. Please make checks payable to Premium Paint Contractors.</p>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-1">NOTES</h3>
        <p className="text-sm">This estimate is valid for 30 days from the date issued. Thank you for choosing Premium Paint Contractors!</p>
      </div>
    </div>
  );
};

export default EstimateFooterInfo;
