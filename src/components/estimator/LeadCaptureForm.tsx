
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EstimateResult } from '@/types';
import AddressAutocomplete from "@/components/AddressAutocomplete";

interface LeadCaptureFormProps {
  estimate: EstimateResult;
  onSubmit: (userData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => void;
  isSubmitting: boolean;
  isAuthenticated?: boolean;
}

const LeadCaptureForm = ({ 
  estimate, 
  onSubmit, 
  isSubmitting,
  isAuthenticated 
}: LeadCaptureFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, phone, address });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      
      <AddressAutocomplete
        value={address}
        onChange={setAddress}
        required={true}
      />
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Saving...' : 'Submit Estimate'}
      </Button>
    </form>
  );
};

export default LeadCaptureForm;
