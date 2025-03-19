
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/common/hooks/use-toast";
import { PasswordResetDialog } from "./PasswordResetDialog";

interface SignInFormProps {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!email.trim()) {
        throw new Error("Email is required");
      }
      
      if (!password) {
        throw new Error("Password is required");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Sign in successful");
      
      // Success! Show toast only - redirect will happen automatically via Auth page
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      // Handle success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      
      // Set specific error message based on error type
      if (error.message.includes("Invalid login credentials")) {
        setFormError("Invalid email or password. Please try again.");
      } else if (error.message.includes("Email not confirmed")) {
        setFormError("Please confirm your email before signing in.");
      } else {
        setFormError(error.message || "An error occurred during sign in. Please try again.");
      }
      
      toast({
        title: "Error signing in",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-signin">Email</Label>
          <Input
            id="email-signin"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={formError && !email.trim() ? "border-red-500" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-signin">Password</Label>
          <Input
            id="password-signin"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={formError && !password ? "border-red-500" : ""}
          />
        </div>
        
        {formError && (
          <p className="text-destructive text-sm">{formError}</p>
        )}
        
        <Button
          type="submit"
          className="w-full bg-paint hover:bg-paint-dark"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
        <div className="text-center mt-2">
          <Button 
            variant="link" 
            className="text-sm text-muted-foreground hover:text-paint"
            onClick={() => setResetDialogOpen(true)}
            type="button"
          >
            Forgot password?
          </Button>
        </div>
      </form>

      <PasswordResetDialog 
        open={resetDialogOpen} 
        onOpenChange={setResetDialogOpen} 
      />
    </>
  );
}
