
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChatInterface from "@/components/ChatInterface";
import HomeEstimator from "@/components/HomeEstimator";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/ContactForm";

const Index = () => {
  const { user, isLoading } = useSession();
  const navigate = useNavigate();
  const [showEstimateCalculator, setShowEstimateCalculator] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const serviceSectionRef = useRef<HTMLDivElement>(null);

  const handleOpenChat = () => {
    if (user) {
      navigate("/estimate");
    } else {
      // Just scroll to the services section without showing the estimator
      serviceSectionRef.current?.scrollIntoView({
        behavior: "smooth"
      });
    }
  };

  return <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-paint">Paint Pro</h1>
              <nav className="hidden md:flex space-x-4">
                <Link to="/" className="text-foreground hover:text-paint">Home</Link>
                <a href="#services" className="text-foreground hover:text-paint">Services</a>
                <a href="#contact" className="text-foreground hover:text-paint">Contact</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {!isLoading && (user ? <Button asChild className="bg-paint hover:bg-paint-dark">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button> : <>
                    <Button variant="outline" asChild>
                      <Link to="/auth?tab=signin">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-paint hover:bg-paint-dark">
                      <Link to="/auth?tab=signup">Sign Up</Link>
                    </Button>
                  </>)}
            </div>
          </div>
        </div>
      </header>
      
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] bg-paint/10 rounded-full filter blur-3xl animate-blob opacity-70"></div>
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-blue-100 rounded-full filter blur-3xl opacity-50"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-8 max-w-lg animate-fade-up">
              <div>
                <div className="inline-block bg-paint/10 rounded-full px-3 py-1 text-sm font-medium text-paint mb-4">
                  Professional Painting Services
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Transform Your Space With a Fresh Coat
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Get instant, accurate estimates for your painting project with our AI-powered calculator. Professional quality, competitive pricing.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" onClick={handleOpenChat} className="bg-paint hover:bg-paint-dark text-white font-medium px-8 shadow-lg shadow-paint/20 transition-all hover:shadow-xl hover:shadow-paint/30 hover:-translate-y-0.5">
                  Get Free Estimate
                </Button>
                <Button variant="outline" size="lg" className="border-foreground/20 hover:bg-foreground/5" asChild>
                  <Link to={user ? "/dashboard" : "/auth"}>
                    {user ? "View Dashboard" : "Create Account"}
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-[#${(i * 2 + 3).toString(16)}${(i * 3).toString(16)}${(i * 4).toString(16)}]`} />)}
                </div>
                <div>
                  <div className="font-semibold">500+ Satisfied Clients</div>
                  <div className="text-sm text-muted-foreground">
                    5.0 ★★★★★ Rating
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="aspect-video w-full h-auto rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-paint/20 to-transparent z-10 rounded-2xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full glass flex items-center justify-center cursor-pointer group">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-paint border-b-8 border-b-transparent ml-1 group-hover:scale-110 transition-transform"></div>
                  </div>
                </div>
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse-subtle"></div>
              </div>
              
              <div className="absolute -top-6 -right-6 glass px-4 py-3 rounded-xl shadow-lg animate-fade-in" style={{
              animationDelay: '0.3s'
            }}>
                <div className="font-semibold">Premium Quality</div>
                <div className="text-sm text-muted-foreground">Industry-leading paints</div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 glass px-4 py-3 rounded-xl shadow-lg animate-fade-in" style={{
              animationDelay: '0.6s'
            }}>
                <div className="font-semibold">5-Year Warranty</div>
                <div className="text-sm text-muted-foreground">On all our work</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div ref={serviceSectionRef} className="py-16 bg-background" id="services">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Services</h2>
            
            {!showEstimateCalculator ? (
              <div className="flex justify-center">
                <div className="glass rounded-xl p-6 shadow-lg px-[24px] py-[24px] mx-0 max-w-md">
                  <h3 className="text-xl font-semibold mb-4">Interior Painting</h3>
                  <p className="mb-4 text-muted-foreground">
                    Transform your living spaces with expert interior painting services. We handle everything from color selection to flawless application.
                  </p>
                  <Button onClick={() => setShowEstimateCalculator(true)} className="w-full bg-paint hover:bg-paint-dark">
                    Get Estimate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 animate-fade-in">
                <h3 className="text-xl font-semibold mb-4">Get Your Free Estimate</h3>
                <HomeEstimator />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="py-16 bg-secondary/20" id="contact">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact us today to schedule a consultation or get your detailed estimate.
            </p>
            <Button 
              size="lg" 
              className="bg-paint hover:bg-paint-dark"
              onClick={() => setContactDialogOpen(true)}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      
      <footer className="bg-foreground/5 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-paint mb-4">Paint Pro</h3>
              <p className="text-muted-foreground">
                Professional painting services for residential and commercial properties.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-muted-foreground hover:text-paint">Home</Link></li>
                <li><a href="#services" className="text-muted-foreground hover:text-paint">Services</a></li>
                <li><Link to="/auth" className="text-muted-foreground hover:text-paint">Sign In</Link></li>
                <li><Link to="/auth?tab=signup" className="text-muted-foreground hover:text-paint">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <address className="not-italic text-muted-foreground">
                <p>123 Paint Street</p>
                <p>Brushville, CA 90210</p>
                <p className="mt-2">(555) 123-4567</p>
                <p>info@paintpro.example</p>
              </address>
            </div>
          </div>
          <div className="border-t border-foreground/10 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Paint Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ContactForm onClose={() => setContactDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};

export default Index;
