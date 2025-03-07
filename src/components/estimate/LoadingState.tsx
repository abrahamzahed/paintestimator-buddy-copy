
import React from "react";

const LoadingState = () => {
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
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p>Loading estimate details...</p>
        </div>
      </main>
    </div>
  );
};

export default LoadingState;
