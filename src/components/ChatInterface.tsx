
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/context/use-session";
import { useToast } from "@/hooks/use-toast";

const ChatInterface = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Placeholder component
  return (
    <div className="glass rounded-lg shadow-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Chat Assistant</h3>
        <button className="text-muted-foreground hover:text-foreground">
          <span className="sr-only">Toggle chat</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <div className="bg-secondary/40 p-3 rounded-lg max-w-[80%]">
          <p className="text-sm">Hi there! How can I help with your painting project today?</p>
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full rounded-full border border-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-paint"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-paint hover:text-paint-dark">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
            <span className="sr-only">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
