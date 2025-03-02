
interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

const ProgressIndicator = ({ totalSteps, currentStep }: ProgressIndicatorProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              currentStep >= i + 1
                ? "bg-paint text-white"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="relative h-2 bg-secondary rounded-full mb-8">
        <div
          className="absolute top-0 left-0 h-full bg-paint rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
