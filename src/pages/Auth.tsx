
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTemporaryEstimate, clearTemporaryEstimate, hasSavedEstimate, getTemporaryProjectName } from "@/utils/estimateStorage";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isLoading } = useSession();
  const [activeTab, setActiveTab] = useState("sign-in");

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

  const handleSignUpSuccess = () => {
    setActiveTab("sign-in");
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
                <SignInForm />
              </TabsContent>

              <TabsContent value="sign-up">
                <SignUpForm onSuccess={handleSignUpSuccess} />
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
