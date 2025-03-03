
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  
  // Track scroll position to change header style
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
            <span className="font-display text-xl font-semibold">PaintEstimator</span>
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
        
        <div>
          <Button className="bg-paint hover:bg-paint-dark transition-all">
            Get a Quote
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
