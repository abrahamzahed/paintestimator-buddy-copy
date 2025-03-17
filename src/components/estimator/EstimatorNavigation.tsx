
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface EstimatorNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onReset?: () => void;
  showReset?: boolean;
  isLastStep?: boolean;
  showSubmit?: boolean;
  onSubmit?: () => void;
  submitButtonText?: string;
  disableNext?: boolean;
}

const EstimatorNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onReset,
  showReset = true,
  isLastStep = false,
  showSubmit = false,
  onSubmit,
  submitButtonText = "Submit",
  disableNext = false
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
      
      <div>
        {(currentStep < totalSteps && !isLastStep) && (
          <Button
            onClick={onNext}
            className="bg-paint hover:bg-paint-dark"
            disabled={disableNext}
          >
            Next
          </Button>
        )}
        
        {isLastStep && showSubmit && onSubmit && (
          <Button
            onClick={onSubmit}
            className="bg-paint hover:bg-paint-dark"
          >
            {submitButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EstimatorNavigation;
