
import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero onChatOpen={handleOpenChat} />
      
      {/* Chat button (visible when chat is closed) */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={handleOpenChat}
            className="glass bg-paint hover:bg-paint-dark text-white rounded-full h-16 w-16 shadow-lg shadow-paint/20 hover:shadow-xl hover:shadow-paint/30 transition-all"
          >
            <span className="sr-only">Open chat</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
              <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
            </svg>
          </Button>
        </div>
      )}
      
      {/* Chat interface */}
      <ChatInterface isOpen={isChatOpen} onClose={handleCloseChat} />
    </div>
  );
};

export default Index;
