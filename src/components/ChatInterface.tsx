
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, EstimateResult, RoomDetails } from "../types";
import { formatCurrency } from "../utils/estimateUtils";
import EstimateCalculator from "./EstimateCalculator";
import { v4 as uuidv4 } from "uuid";

// Import from lucide-react
import { X, Send, Calculator, ChevronUp, ChevronDown } from "lucide-react";

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface = ({ isOpen, onClose }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content:
        "👋 Hi there! I'm PaintBot, your personal painting assistant. I can help you estimate the cost of painting a room. Would you like to get started with a free estimate?",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [showEstimateCalculator, setShowEstimateCalculator] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(true);
  const [currentEstimate, setCurrentEstimate] = useState<EstimateResult | null>(
    null
  );
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      let botResponse: Message;

      // Simple keyword-based responses
      const lowerCaseMessage = newMessage.toLowerCase();
      
      if (
        lowerCaseMessage.includes("estimate") ||
        lowerCaseMessage.includes("quote") ||
        lowerCaseMessage.includes("cost") ||
        lowerCaseMessage.includes("price") ||
        lowerCaseMessage.includes("how much")
      ) {
        botResponse = {
          id: uuidv4(),
          role: "bot",
          content:
            "I'd be happy to help with an estimate! Let's use our calculator to get you an accurate quote based on your specific needs.",
          timestamp: new Date(),
        };
        setShowEstimateCalculator(true);
      } else if (
        lowerCaseMessage.includes("hello") ||
        lowerCaseMessage.includes("hi") ||
        lowerCaseMessage.includes("hey")
      ) {
        botResponse = {
          id: uuidv4(),
          role: "bot",
          content:
            "Hello there! I'm here to help you with your painting needs. Would you like to get a free estimate?",
          timestamp: new Date(),
        };
      } else if (
        lowerCaseMessage.includes("yes") ||
        lowerCaseMessage.includes("sure") ||
        lowerCaseMessage.includes("ok")
      ) {
        botResponse = {
          id: uuidv4(),
          role: "bot",
          content:
            "Great! Let's use our estimate calculator to get you an accurate quote.",
          timestamp: new Date(),
        };
        setShowEstimateCalculator(true);
      } else if (
        lowerCaseMessage.includes("paint type") ||
        lowerCaseMessage.includes("quality") ||
        lowerCaseMessage.includes("what kind")
      ) {
        botResponse = {
          id: uuidv4(),
          role: "bot",
          content:
            "We offer three types of paint: Standard ($25/gallon), Premium ($45/gallon), and Luxury ($75/gallon). Premium and Luxury paints offer better coverage, durability, and often require fewer coats.",
          timestamp: new Date(),
        };
      } else if (
        lowerCaseMessage.includes("time") ||
        lowerCaseMessage.includes("how long") ||
        lowerCaseMessage.includes("duration")
      ) {
        botResponse = {
          id: uuidv4(),
          role: "bot",
          content:
            "The time required depends on the size of the room and condition of the walls. For an average bedroom, we typically complete the job in 1-2 days. For a more accurate timeframe, I'd be happy to provide an estimate.",
          timestamp: new Date(),
        };
      } else {
        botResponse = {
          id: uuidv4(),
          role: "bot",
          content:
            "Thanks for your message! Would you like to get a free estimate for your painting project? I can help you calculate the costs based on your specific needs.",
          timestamp: new Date(),
        };
      }

      setIsTyping(false);
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1500);
  };

  const handleStartEstimate = () => {
    setShowEstimateCalculator(true);
    setMessages([
      ...messages,
      {
        id: uuidv4(),
        role: "user",
        content: "I'd like to get an estimate",
        timestamp: new Date(),
      },
      {
        id: uuidv4(),
        role: "bot",
        content:
          "Great! Please fill out the details in our estimate calculator below.",
        timestamp: new Date(),
      },
    ]);
  };

  const handleEstimateComplete = (estimate: EstimateResult) => {
    setCurrentEstimate(estimate);
    setShowEstimateCalculator(false);
    
    const estimateMessage = {
      id: uuidv4(),
      role: "bot",
      content: `
        Based on the information you provided, here's your estimate:
        
        - Total Cost: ${formatCurrency(estimate.totalCost)}
        - Labor: ${formatCurrency(estimate.laborCost)}
        - Materials: ${formatCurrency(estimate.materialCost)}
        - Estimated Time: ${estimate.timeEstimate.toFixed(1)} hours
        - Paint Required: ${estimate.paintCans} gallons
        
        Would you like to schedule a consultation or get more information?
      `,
      timestamp: new Date(),
    };
    
    setMessages((prevMessages) => [...prevMessages, estimateMessage]);
  };

  return (
    <div
      className={`fixed bottom-0 right-0 z-50 transition-all duration-500 ease-in-out transform ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="chat-wrapper relative">
        {/* Minimize/Maximize button */}
        <Button
          variant="outline"
          size="sm"
          className="absolute -top-10 right-4 glass rounded-t-lg rounded-b-none border-b-0 px-4"
          onClick={() => setShowChatPanel(!showChatPanel)}
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
        
        {/* Main chat panel */}
        <div 
          className={`chat-panel glass shadow-lg w-[380px] md:w-[450px] transition-all duration-300 ${
            showChatPanel ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          {/* Chat header */}
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat messages */}
          <div className="h-[350px] md:h-[400px] overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 animate-fade-in ${
                    message.role === "user"
                      ? "bg-paint text-white rounded-tr-none"
                      : "bg-secondary text-foreground rounded-tl-none"
                  }`}
                >
                  <div className="whitespace-pre-line">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-white/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-2 animate-pulse">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Estimate calculator */}
          {showEstimateCalculator && (
            <div className="p-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Estimate Calculator</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEstimateCalculator(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <EstimateCalculator onEstimateComplete={handleEstimateComplete} />
            </div>
          )}

          {/* Quick actions */}
          {!showEstimateCalculator && (
            <div className="p-2 border-t flex space-x-2 overflow-x-auto">
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap border-paint/30 text-paint hover:bg-paint/10"
                onClick={handleStartEstimate}
              >
                <Calculator className="h-3 w-3 mr-1" /> Get Estimate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={() => {
                  setNewMessage("What paint types do you offer?");
                  handleSendMessage();
                }}
              >
                Paint Types
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={() => {
                  setNewMessage("How long does painting take?");
                  handleSendMessage();
                }}
              >
                Timeframe
              </Button>
            </div>
          )}

          {/* Chat input */}
          {!showEstimateCalculator && (
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim()}
                  className="bg-paint hover:bg-paint-dark"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
