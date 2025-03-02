
import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChatInterface from "@/components/ChatInterface";
import EstimateCalculator from "@/components/EstimateCalculator";
import { EstimateResult } from "@/types";

const Index = () => {
  const [showEstimateCalculator, setShowEstimateCalculator] = useState(false);
  const chatSectionRef = useRef<HTMLDivElement>(null);
  
  const handleOpenChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleEstimateComplete = (estimate: EstimateResult) => {
    setShowEstimateCalculator(false);
  };
  
  const handleStartEstimate = () => {
    setShowEstimateCalculator(true);
  };

  // Check if user has scrolled to the chat section
  useEffect(() => {
    const handleScroll = () => {
      if (chatSectionRef.current) {
        const chatSectionPosition = chatSectionRef.current.getBoundingClientRect().top;
        if (chatSectionPosition < window.innerHeight * 0.75) {
          // User has scrolled to the chat section
          setShowEstimateCalculator(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero onChatOpen={handleOpenChat} />
      
      <div 
        ref={chatSectionRef} 
        className="py-16 bg-background"
        id="chat-section"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Talk to Our Painting Expert</h2>
            
            <div className="grid gap-8 md:grid-cols-2">
              {showEstimateCalculator ? (
                <div className="md:col-span-2 animate-fade-in">
                  <h3 className="text-xl font-semibold mb-4">Get Your Free Estimate</h3>
                  <EstimateCalculator onEstimateComplete={handleEstimateComplete} />
                </div>
              ) : (
                <>
                  <div className="glass rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Have Questions?</h3>
                    <p className="mb-4 text-muted-foreground">
                      Our painting expert can answer any questions about your project, from color selection to material recommendations.
                    </p>
                    <ChatInterface 
                      isEmbedded={true} 
                      onRequestEstimate={handleStartEstimate} 
                    />
                  </div>
                  
                  <div className="glass rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Ready for a Quote?</h3>
                    <p className="mb-6 text-muted-foreground">
                      Get an instant, accurate estimate for your painting project using our detailed calculator. Just answer a few questions about your space.
                    </p>
                    <button 
                      onClick={handleStartEstimate}
                      className="w-full bg-paint hover:bg-paint-dark text-white font-medium py-3 px-8 rounded-lg shadow-lg shadow-paint/20 transition-all hover:shadow-xl hover:shadow-paint/30"
                    >
                      Start Your Free Estimate
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
