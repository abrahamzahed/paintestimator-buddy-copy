import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AddressAutocomplete from "@/components/AddressAutocomplete";

interface SignUpFormProps {
  onSuccess?: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }
    
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }
    
    if (!address.trim()) {
      errors.address = "Address is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formattedPhone = phone.replace(/\D/g, '');
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            display_name: name,
            name,
            phone: formattedPhone,
            address
          },
        },
      });

      if (signUpError) throw signUpError;

      console.log("Auth user created:", authData?.user?.id);
      console.log("User metadata:", authData?.user?.user_metadata);
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      if (error.message.includes("already registered")) {
        setFormErrors({
          ...formErrors,
          email: "This email is already registered. Please sign in instead."
        });
      } else {
        toast({
          title: "Error creating account",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name-signup">Full Name</Label>
        <Input
          id="name-signup"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={formErrors.name ? "border-red-500" : ""}
        />
        {formErrors.name && (
          <p className="text-destructive text-sm">{formErrors.name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-signup">Email</Label>
        <Input
          id="email-signup"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={formErrors.email ? "border-red-500" : ""}
        />
        {formErrors.email && (
          <p className="text-destructive text-sm">{formErrors.email}</p>
        )}
      </div>
      <AddressAutocomplete
        value={address}
        onChange={setAddress}
        label="Address"
        placeholder="Enter your address"
        required
        error={formErrors.address}
        id="address-signup"
      />
      <div className="space-y-2">
        <Label htmlFor="phone-signup">Phone Number</Label>
        <Input
          id="phone-signup"
          placeholder="Your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className={formErrors.phone ? "border-red-500" : ""}
        />
        {formErrors.phone && (
          <p className="text-destructive text-sm">{formErrors.phone}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-signup">Password</Label>
        <Input
          id="password-signup"
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className={formErrors.password ? "border-red-500" : ""}
        />
        {formErrors.password && (
          <p className="text-destructive text-sm">{formErrors.password}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full bg-paint hover:bg-paint-dark"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
