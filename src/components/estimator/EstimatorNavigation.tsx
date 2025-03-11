
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface EstimatorNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onReset?: () => void;
  showReset?: boolean;
}

const EstimatorNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onReset,
  showReset = true
}: EstimatorNavigationProps) => {
  return (
    <div className="flex justify-between mt-8">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={currentStep === 1}
          className="border-foreground/20 hover:bg-foreground/5"
        >
          Back
        </Button>
        
        {showReset && onReset && (
          <Button
            variant="outline"
            onClick={onReset}
            className="border-foreground/20 hover:bg-foreground/5"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
      
      {currentStep < totalSteps && (
        <Button
          onClick={onNext}
          className="bg-paint hover:bg-paint-dark"
        >
          Next
        </Button>
      )}
    </div>
  );
};

export default EstimatorNavigation;
