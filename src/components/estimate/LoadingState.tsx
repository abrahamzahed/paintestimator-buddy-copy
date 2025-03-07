
import React, { ReactNode } from "react";
import EstimatePageLayout from "./EstimatePageLayout";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  children?: ReactNode;
  message?: string;
}

const LoadingState = ({ children, message = "Loading estimate details..." }: LoadingStateProps) => {
  return (
    <EstimatePageLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-paint mb-4" />
        <p className="text-muted-foreground">{message}</p>
        {children}
      </div>
    </EstimatePageLayout>
  );
};

export default LoadingState;
