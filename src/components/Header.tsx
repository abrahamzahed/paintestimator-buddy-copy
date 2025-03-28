
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/context/use-session';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, signOut } = useSession();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    try {
      console.log("Sign out button clicked in header");
      setIsSigningOut(true);
      
      await signOut();
      
      // Don't navigate programmatically - the auth state change will trigger a re-render
      console.log("Successfully signed out in header");
    } catch (error) {
      console.error("Error in handleSignOut:", error);
    } finally {
      // Reset signing out state after a delay to ensure visual feedback
      setTimeout(() => setIsSigningOut(false), 500);
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-300 ease-in-out",
        scrolled ? "glass shadow-sm py-3" : "bg-transparent"
      )}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Link to="/" className="flex items-center space-x-1">
            <div className="w-8 h-8 rounded-lg bg-paint animate-pulse-subtle"></div>
            <span className="font-display text-xl font-semibold">Paint Pro</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          {['Services', 'About', 'Portfolio', 'Testimonials', 'Contact'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Profile</Link>
              </Button>
              <Button 
                className="bg-paint hover:bg-paint-dark transition-all"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button className="bg-paint hover:bg-paint-dark transition-all" asChild>
                <Link to="/auth?tab=signup">Create Account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
