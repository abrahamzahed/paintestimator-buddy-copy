
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroProps {
  onChatOpen: () => void;
}

const Hero = ({ onChatOpen }: HeroProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Background decoration */}
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
              <Button 
                size="lg" 
                onClick={onChatOpen}
                className="bg-paint hover:bg-paint-dark text-white font-medium px-8 shadow-lg shadow-paint/20 transition-all hover:shadow-xl hover:shadow-paint/30 hover:-translate-y-0.5"
              >
                Get Free Estimate
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-foreground/20 hover:bg-foreground/5"
              >
                See Our Work
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 border-white",
                      `bg-[#${(i * 2 + 3).toString(16)}${(i * 3).toString(16)}${(i * 4).toString(16)}]`
                    )}
                  />
                ))}
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
              {/* Placeholder for image or video */}
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse-subtle"></div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -top-6 -right-6 glass px-4 py-3 rounded-xl shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="font-semibold">Premium Quality</div>
              <div className="text-sm text-muted-foreground">Industry-leading paints</div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 glass px-4 py-3 rounded-xl shadow-lg animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="font-semibold">5-Year Warranty</div>
              <div className="text-sm text-muted-foreground">On all our work</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
