
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

const AddressAutocomplete = ({
  value,
  onChange,
  label = "Address",
  placeholder = "Enter your address",
  required = false,
  error,
  className,
  id = "address"
}: AddressAutocompleteProps) => {
  const { toast } = useToast();
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the API request
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 3) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (input.trim().length < 3) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: input,
          format: "json",
          addressdetails: 1,
          limit: 5,
        },
        headers: {
          "User-Agent": "PaintPro Web Application",
        },
      });
      
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      toast({
        title: "Error fetching addresses",
        description: "Could not load address suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onChange(value); // Update parent component's state
  };

  // Format address to remove county information and include only essential parts
  const formatAddress = (suggestion: NominatimResult): string => {
    const address = suggestion.address;
    const parts = [];

    // Add house number and road
    if (address.house_number) parts.push(address.house_number);
    if (address.road) parts.push(address.road);
    
    // Add neighborhood/suburb (but not both)
    if (address.neighbourhood) parts.push(address.neighbourhood);
    else if (address.suburb) parts.push(address.suburb);
    
    // Add city
    if (address.city) parts.push(address.city);
    
    // Add state
    if (address.state) parts.push(address.state);
    
    // Add postal code
    if (address.postcode) parts.push(address.postcode);
    
    // Skip county

    // Only include country for international addresses
    if (address.country && address.country !== "United States") {
      parts.push(address.country);
    }

    return parts.join(", ");
  };

  const handleSelect = (suggestion: NominatimResult) => {
    const selectedAddress = formatAddress(suggestion);
    setQuery(selectedAddress);
    onChange(selectedAddress);
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <div className={cn("space-y-2 relative", className)}>
      <Label 
        htmlFor={id} 
        className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}
      >
        {label}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={cn(error ? "border-red-500" : "")}
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      
      {suggestions.length > 0 && isFocused && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-background rounded-md shadow-lg border border-input overflow-hidden"
        >
          <ul className="py-1 max-h-60 overflow-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
              >
                {formatAddress(suggestion)}
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 text-xs text-muted-foreground border-t">
            Data provided by OpenStreetMap
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
