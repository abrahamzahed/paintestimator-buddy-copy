
import { useState } from "react";
import { Message, EstimateResult } from "../types";
import { v4 as uuidv4 } from "uuid";
import { formatCurrency } from "../utils/estimateUtils";

// Import new components
import ChatHeader from "./chat/ChatHeader";
import MessageList from "./chat/MessageList";
import ChatInput from "./chat/ChatInput";
import QuickActions from "./chat/QuickActions";
import ChatToggleButton from "./chat/ChatToggleButton";
import EstimateSection from "./chat/EstimateSection";

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
  const [showEstimateCalculator, setShowEstimateCalculator] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(true);
  const [currentEstimate, setCurrentEstimate] = useState<EstimateResult | null>(
    null
  );
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (newMessage: string) => {
    if (newMessage.trim() === "") return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
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
    
    const estimateMessage: Message = {
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
        <ChatToggleButton 
          showChatPanel={showChatPanel} 
          onToggle={() => setShowChatPanel(!showChatPanel)} 
        />
        
        {/* Main chat panel */}
        <div 
          className={`chat-panel glass shadow-lg w-[380px] md:w-[450px] transition-all duration-300 ${
            showChatPanel ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <ChatHeader onClose={onClose} />

          <MessageList messages={messages} isTyping={isTyping} />

          {/* Estimate calculator */}
          {showEstimateCalculator && (
            <EstimateSection 
              onEstimateComplete={handleEstimateComplete}
              onClose={() => setShowEstimateCalculator(false)}
            />
          )}

          {/* Quick actions */}
          {!showEstimateCalculator && (
            <QuickActions 
              onStartEstimate={handleStartEstimate}
              onQuickQuestion={handleSendMessage}
            />
          )}

          {/* Chat input */}
          {!showEstimateCalculator && (
            <ChatInput onSendMessage={handleSendMessage} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
