
import React, { ReactNode } from "react";
import EstimatePageLayout from "./EstimatePageLayout";

interface LoadingStateProps {
  children?: ReactNode;
  message?: string;
}

const LoadingState = ({ children, message = "Loading estimate details..." }: LoadingStateProps) => {
  return (
    <EstimatePageLayout>
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <p>{message}</p>
        {children}
      </div>
    </EstimatePageLayout>
  );
};

export default LoadingState;
