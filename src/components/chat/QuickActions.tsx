
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface QuickActionsProps {
  onStartEstimate: () => void;
  onQuickQuestion: (question: string) => void;
}

const QuickActions = ({ onStartEstimate, onQuickQuestion }: QuickActionsProps) => {
  return (
    <div className="p-2 border-t flex space-x-2 overflow-x-auto">
      <Button
        variant="outline"
        size="sm"
        className="whitespace-nowrap border-paint/30 text-paint hover:bg-paint/10"
        onClick={onStartEstimate}
      >
        <Calculator className="h-3 w-3 mr-1" /> Get Estimate
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="whitespace-nowrap"
        onClick={() => onQuickQuestion("What paint types do you offer?")}
      >
        Paint Types
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="whitespace-nowrap"
        onClick={() => onQuickQuestion("How long does painting take?")}
      >
        Timeframe
      </Button>
    </div>
  );
};

export default QuickActions;
