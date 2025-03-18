
import React from "react";

interface ClientInfoSectionProps {
  clientInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
}

const ClientInfoSection = ({ clientInfo }: ClientInfoSectionProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">CLIENT</h3>
      <div className="text-sm">
        <p className="font-semibold">{clientInfo.name}</p>
        <p>{clientInfo.address}</p>
        <p>{clientInfo.city}, {clientInfo.state} {clientInfo.zip}</p>
      </div>
    </div>
  );
};

export default ClientInfoSection;
