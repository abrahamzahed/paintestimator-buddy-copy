
import React, { ReactNode } from "react";

interface EstimatePageLayoutProps {
  children: ReactNode;
}

const EstimatePageLayout = ({ children }: EstimatePageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-paint">Paint Pro</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default EstimatePageLayout;
