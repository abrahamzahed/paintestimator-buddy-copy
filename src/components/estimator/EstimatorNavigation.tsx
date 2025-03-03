
import { Button } from "@/components/ui/button";

interface EstimatorNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
}

const EstimatorNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev
}: EstimatorNavigationProps) => {
  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={currentStep === 1}
        className="border-foreground/20 hover:bg-foreground/5"
      >
        Back
      </Button>
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
