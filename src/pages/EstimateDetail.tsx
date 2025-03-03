
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Estimate, LineItem } from "@/types";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ChevronLeft, FileText } from "lucide-react";
import { formatCurrency } from "@/utils/estimateUtils";

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, signOut } = useSession();
  const { toast } = useToast();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstimateData = async () => {
      try {
        if (!id) return;

        // Fetch estimate
        const { data: estimateData, error: estimateError } = await supabase
          .from("estimates")
          .select("*, projects(name)")
          .eq("id", id)
          .single();

        if (estimateError) throw estimateError;
        
        // Transform the data to match our Estimate interface
        const formattedEstimate: Estimate = {
          ...estimateData,
          project_name: estimateData.projects?.name || "Unknown Project",
          // Make sure to explicitly cast details to our expected type
          details: estimateData.details as Record<string, any>,
          // Add any missing fields with default values
          notes: estimateData.notes || "",
          discount: estimateData.discount || 0
        };
        
        setEstimate(formattedEstimate);

        // Check if line_items table exists in Supabase
        try {
          // Use a safer approach to check for line items
          const { data: itemsData, error: itemsError } = await supabase
            .rpc('get_line_items_for_estimate', { estimate_id: id });

          if (!itemsError && itemsData) {
            setLineItems(itemsData as LineItem[]);
          } else {
            // If RPC doesn't exist or there's an error, handle empty line items
            console.log("No line items found or table doesn't exist:", itemsError);
            setLineItems([]);
          }
        } catch (error) {
          console.log("Line items table may not exist:", error);
          setLineItems([]);
        }

      } catch (error) {
        console.error("Error fetching estimate data:", error);
        toast({
          title: "Error loading estimate",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEstimateData();
  }, [id, toast]);

  if (loading) {
    return (
      <DashboardLayout user={user} profile={profile} signOut={signOut}>
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p>Loading estimate details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!estimate) {
    return (
      <DashboardLayout user={user} profile={profile} signOut={signOut}>
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Estimate not found</h3>
          <p className="text-muted-foreground mb-6">
            The estimate you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link to="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} signOut={signOut}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/project/${estimate.project_id}`}>
                <ChevronLeft className="h-4 w-4" />
                Back to Project
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Estimate #{estimate.id?.substring(0, 8)}</h1>
          </div>
          <div className={`px-3 py-1 rounded text-sm ${
            estimate.status === "pending" 
              ? "bg-yellow-100 text-yellow-800" 
              : estimate.status === "approved" 
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {estimate.status?.toUpperCase()}
          </div>
        </div>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="bg-secondary/20">
            <CardTitle>Estimate Details</CardTitle>
            <CardDescription>Created on {new Date(estimate.created_at!).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Project Information</h3>
                <p className="text-sm text-muted-foreground mb-1">Project: {estimate.project_name || "Unknown Project"}</p>
                <p className="text-sm text-muted-foreground">Created: {new Date(estimate.created_at!).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cost Summary</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Labor:</span>
                    <span className="text-sm">{formatCurrency(estimate.labor_cost || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Materials:</span>
                    <span className="text-sm">{formatCurrency(estimate.material_cost || 0)}</span>
                  </div>
                  {(estimate.discount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Discount:</span>
                      <span className="text-sm text-green-600">-{formatCurrency(estimate.discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">{formatCurrency(estimate.total_cost || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {lineItems.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Line Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unit_price || 0)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency((item.quantity || 0) * (item.unit_price || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {estimate.notes && (
              <div className="mt-8">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground p-4 bg-gray-50 rounded-md">{estimate.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <div className="w-full flex justify-between items-center">
              {estimate.status === "pending" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Decline</Button>
                  <Button className="bg-green-600 hover:bg-green-700" size="sm">Approve Estimate</Button>
                </div>
              )}
              {estimate.status === "approved" && (
                <p className="text-sm text-green-600">This estimate has been approved</p>
              )}
              {estimate.status === "declined" && (
                <p className="text-sm text-red-600">This estimate has been declined</p>
              )}
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
