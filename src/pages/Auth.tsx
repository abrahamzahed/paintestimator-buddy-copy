import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "@/auth/use-session";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTemporaryEstimate, clearTemporaryEstimate, hasSavedEstimate, getTemporaryProjectName } from "@/utils/estimateStorage";
import { SignInForm } from "@/common/components/auth/SignInForm";
import { SignUpForm } from "@/common/components/auth/SignUpForm";
import { PasswordResetConfirmation } from "@/common/components/auth/PasswordResetConfirmation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isLoading, user } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sign-in");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [processingRecovery, setProcessingRecovery] = useState(true);
  const [redirectTriggered, setRedirectTriggered] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab");
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  const saveEstimate = searchParams.get("saveEstimate") === "true";
  const type = searchParams.get("type");
  
  useEffect(() => {
    const checkRecoveryMode = async () => {
      if (type === "recovery") {
        console.log("Recovery mode detected, signing out any existing user");
        try {
          await supabase.auth.signOut();
          setIsRecoveryMode(true);
        } catch (error) {
          console.error("Error signing out user in recovery mode:", error);
          toast({
            title: "Error processing recovery",
            description: "There was a problem preparing for password reset. Please try again.",
            variant: "destructive",
          });
        }
      } else if (type === "signin" || tab === "signin") {
        setActiveTab("sign-in");
      } else if (type === "signup" || tab === "signup") {
        setActiveTab("sign-up");
      } else if (saveEstimate) {
        setActiveTab("sign-up");
      }
      
      setProcessingRecovery(false);
      setLocalLoading(false);
    };
    
    checkRecoveryMode();
  }, [type, saveEstimate, toast, tab]);

  useEffect(() => {
    const handleSessionRedirect = async () => {
      if (isRecoveryMode || processingRecovery || redirectTriggered || localLoading) {
        return;
      }
      
      if (session && user && !isLoading) {
        try {
          console.log("Valid session detected, redirecting to:", saveEstimate ? "/estimate?saveEstimate=true" : returnUrl);
          setRedirectTriggered(true);
          
          if (saveEstimate && hasSavedEstimate()) {
            navigate("/estimate?saveEstimate=true");
          } else {
            navigate(returnUrl);
          }
        } catch (error) {
          console.error("Error during redirect:", error);
          toast({
            title: "Navigation error",
            description: "There was a problem redirecting you. Please try again.",
            variant: "destructive",
          });
          setRedirectTriggered(false);
        }
      }
    };
    
    handleSessionRedirect();
  }, [session, user, isLoading, navigate, returnUrl, saveEstimate, isRecoveryMode, processingRecovery, toast, redirectTriggered, localLoading]);

  const handleSignUpSuccess = () => {
    setActiveTab("sign-in");
    toast({
      title: "Account created",
      description: "Please check your email to verify your account."
    });
  };

  if (processingRecovery || (isLoading && !redirectTriggered)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <p>Processing your request...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {isRecoveryMode
                ? "Create a new password for your account"
                : "Sign in to your account or create a new one"}
              {saveEstimate && hasSavedEstimate() && !isRecoveryMode && (
                <span className="block mt-2 text-paint">
                  Create an account to save your estimate
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRecoveryMode ? (
              <PasswordResetConfirmation />
            ) : (
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                  <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="sign-in">
                  <SignInForm />
                </TabsContent>

                <TabsContent value="sign-up">
                  <SignUpForm onSuccess={handleSignUpSuccess} />
                </TabsContent>
              </Tabs>
            )}
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
