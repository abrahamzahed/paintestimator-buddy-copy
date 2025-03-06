
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function PasswordResetConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Extract the access token from the URL hash
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get("access_token");
    
    if (token) {
      console.log("Access token found in URL");
      setAccessToken(token);
      
      // Set the session using the access token
      const setSession = async () => {
        const { data, error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: "",
        });
        
        if (error) {
          console.error("Error setting session:", error);
          toast({
            title: "Authentication error",
            description: "There was a problem authenticating your request. Please try again.",
            variant: "destructive",
          });
        } else {
          console.log("Session set successfully");
        }
      };
      
      setSession();
    } else {
      console.log("No access token found in URL");
      // If we're in recovery mode but no token, show an error
      toast({
        title: "Invalid or expired recovery link",
        description: "Please request a new password reset link.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated successfully",
        description: "You can now sign in with your new password",
      });

      // Sign out the user
      await supabase.auth.signOut();
      
      // Redirect to sign in
      navigate("/auth?type=signin");
    } catch (error: any) {
      console.error("Password update error:", error);
      toast({
        title: "Error updating password",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Reset Your Password</h2>
        <p className="text-muted-foreground mt-2">
          Please enter a new password for your account
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        {passwordError && (
          <p className="text-destructive text-sm">{passwordError}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-paint hover:bg-paint-dark"
          disabled={isSubmitting || !accessToken}
        >
          {isSubmitting ? "Updating Password..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
