
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ChatToggleButtonProps {
  showChatPanel: boolean;
  onToggle: () => void;
}

const ChatToggleButton = ({ showChatPanel, onToggle }: ChatToggleButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="absolute -top-10 right-4 glass rounded-t-lg rounded-b-none border-b-0 px-4"
      onClick={onToggle}
    >
      {showChatPanel ? (
        <>
          <ChevronDown className="h-4 w-4 mr-1" /> Minimize
        </>
      ) : (
        <>
          <ChevronUp className="h-4 w-4 mr-1" /> Expand
        </>
      )}
    </Button>
  );
};

export default ChatToggleButton;
