import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getTemporaryEstimate, clearTemporaryEstimate, hasSavedEstimate, getTemporaryProjectName } from "@/utils/estimateStorage";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session, isLoading } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("sign-in");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetEmailSent, setIsResetEmailSent] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  const saveEstimate = searchParams.get("saveEstimate") === "true";
  
  useEffect(() => {
    if (saveEstimate) {
      setActiveTab("sign-up");
    }
  }, [saveEstimate]);

  useEffect(() => {
    if (session && !isLoading) {
      if (saveEstimate && hasSavedEstimate()) {
        navigate("/estimate?saveEstimate=true");
      } else {
        navigate(returnUrl);
      }
    }
  }, [session, isLoading, navigate, returnUrl, saveEstimate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            phone: phone || null,
          },
        },
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        
        setActiveTab("sign-in");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Error creating account",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Error signing in",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) throw error;

      setIsResetEmailSent(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error sending reset link",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-paint">Paint Pro</h1>
          <p className="text-muted-foreground mt-2">
            Professional painting services tailored to your needs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Access</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
              {saveEstimate && hasSavedEstimate() && (
                <span className="block mt-2 text-paint">
                  Create an account to save your estimate
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="sign-in">
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
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-paint hover:bg-paint-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                  <div className="text-center mt-2">
                    <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="link" className="text-sm text-muted-foreground hover:text-paint">
                          Forgot password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset your password</DialogTitle>
                          <DialogDescription>
                            Enter your email address and we'll send you a link to reset your password.
                          </DialogDescription>
                        </DialogHeader>
                        {!isResetEmailSent ? (
                          <form onSubmit={handlePasswordReset} className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="reset-email">Email</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                placeholder="Your email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                              />
                            </div>
                            <Button
                              type="submit"
                              className="w-full bg-paint hover:bg-paint-dark"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Sending..." : "Send Reset Link"}
                            </Button>
                          </form>
                        ) : (
                          <div className="py-4">
                            <p className="text-center mb-4">
                              A password reset link has been sent to your email address.
                            </p>
                            <Button
                              className="w-full"
                              onClick={() => {
                                setResetDialogOpen(false);
                                setIsResetEmailSent(false);
                              }}
                            >
                              Close
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="sign-up">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-signup">Full Name</Label>
                    <Input
                      id="name-signup"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-signup">Phone (Optional)</Label>
                    <Input
                      id="phone-signup"
                      placeholder="Your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
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
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-paint hover:bg-paint-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-sm"
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
