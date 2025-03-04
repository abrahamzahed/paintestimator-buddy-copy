
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContactFormProps {
  onClose: () => void;
}

const ContactForm = ({ onClose }: ContactFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    message: "",
    preferredContactMethod: "email",
    bestTimeToCall: "",
    preferredTimeline: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create a lead in the Supabase database
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            service_type: "interior",
            description: formData.message,
            status: "new"
          }
        ]);
        
      if (error) throw error;
      
      // If successful, create a basic estimate with the contact preferences
      if (data) {
        const { error: estimateError } = await supabase
          .from('estimates')
          .insert([
            {
              lead_id: data[0].id,
              labor_cost: 0,
              material_cost: 0,
              total_cost: 0,
              estimated_hours: 0,
              preferred_contact_method: formData.preferredContactMethod,
              best_time_to_call: formData.bestTimeToCall,
              preferred_timeline: formData.preferredTimeline,
              details: {
                initialInquiry: true,
                message: formData.message
              }
            }
          ]);
          
        if (estimateError) console.error("Error creating estimate:", estimateError);
      }
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          name="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Project Address</Label>
        <Input
          id="address"
          name="address"
          placeholder="123 Paint Street, Brushville, CA"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
        <Select 
          value={formData.preferredContactMethod} 
          onValueChange={(value) => handleSelectChange("preferredContactMethod", value)}
        >
          <SelectTrigger id="preferredContactMethod">
            <SelectValue placeholder="Select contact method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="text">Text Message</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {formData.preferredContactMethod === "phone" && (
        <div className="space-y-2">
          <Label htmlFor="bestTimeToCall">Best Time to Call</Label>
          <Input
            id="bestTimeToCall"
            name="bestTimeToCall"
            placeholder="Morning / Afternoon / Evening"
            value={formData.bestTimeToCall}
            onChange={handleChange}
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="preferredTimeline">When do you need this project completed?</Label>
        <Select 
          value={formData.preferredTimeline} 
          onValueChange={(value) => handleSelectChange("preferredTimeline", value)}
        >
          <SelectTrigger id="preferredTimeline">
            <SelectValue placeholder="Select timeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asap">As soon as possible</SelectItem>
            <SelectItem value="1month">Within 1 month</SelectItem>
            <SelectItem value="3months">Within 3 months</SelectItem>
            <SelectItem value="planning">Just planning/pricing now</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us more about your project..."
          value={formData.message}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="flex justify-between pt-2">
        <Button 
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-paint hover:bg-paint-dark"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;
