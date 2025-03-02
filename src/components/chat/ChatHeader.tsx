
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  showCloseButton?: boolean;
}

const ChatHeader = ({ onClose, showCloseButton = true }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-paint flex items-center justify-center text-white">
          <span className="text-sm font-medium">PB</span>
        </div>
        <div className="ml-2">
          <h3 className="font-medium">PaintBot</h3>
          <div className="text-xs text-muted-foreground flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Online
          </div>
        </div>
      </div>
      {showCloseButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ChatHeader;
