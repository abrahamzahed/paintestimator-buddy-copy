
import React from "react";

interface ProjectDetailsSectionProps {
  projectName: string;
  clientName: string;
  clientAddress: string;
  roomCount: number;
}

const ProjectDetailsSection = ({ 
  projectName, 
  clientName, 
  clientAddress, 
  roomCount 
}: ProjectDetailsSectionProps) => {
  return (
    <div className="bg-secondary/30 p-6 rounded-lg">
      <h4 className="font-medium mb-4">Project Details</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Project Name:</span>
          <span className="font-medium">{projectName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Contact:</span>
          <span className="font-medium">{clientName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Address:</span>
          <span className="font-medium">{clientAddress}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rooms:</span>
          <span className="font-medium">{roomCount}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsSection;
