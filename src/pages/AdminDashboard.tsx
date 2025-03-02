
import { useState, useEffect } from "react";
import { supabase } from "../App";
import { useSession } from "@/context/SessionContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead, Estimate, PricingRule, Profile } from "@/types";
import { PlusCircle, DollarSign, Users, FileText, House, PaintBucket } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, signOut } = useSession();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }

    const fetchAdminData = async () => {
      try {
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (usersError) throw usersError;
        setUsers(usersData || []);

        // Fetch leads
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false });

        if (leadsError) throw leadsError;
        setLeads(leadsData || []);

        // Fetch estimates
        const { data: estimatesData, error: estimatesError } = await supabase
          .from("estimates")
          .select("*")
          .order("created_at", { ascending: false });

        if (estimatesError) throw estimatesError;
        setEstimates(estimatesData || []);

        // Fetch pricing rules
        const { data: pricingData, error: pricingError } = await supabase
          .from("pricing_rules")
          .select("*")
          .order("service_type", { ascending: true });

        if (pricingError) throw pricingError;
        setPricingRules(pricingData || []);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({
          title: "Error loading admin data",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [isAdmin, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-paint">Paint Pro Admin</h1>
              <nav className="hidden md:flex space-x-4">
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
                <Button variant="ghost" onClick={() => navigate("/estimate")}>Estimator</Button>
                <Button variant="ghost" onClick={() => navigate("/admin")}>Admin</Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your painting business operations from one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Total Users</h3>
                <p className="text-3xl font-bold mt-2">{users.length}</p>
              </div>
              <span className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                <Users className="w-6 h-6" />
              </span>
            </div>
          </div>
          
          <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Active Leads</h3>
                <p className="text-3xl font-bold mt-2">
                  {leads.filter(l => l.status === "new" || l.status === "contacted").length}
                </p>
              </div>
              <span className="bg-paint/10 p-2 rounded-full text-paint">
                <House className="w-6 h-6" />
              </span>
            </div>
          </div>
          
          <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Pending Estimates</h3>
                <p className="text-3xl font-bold mt-2">
                  {estimates.filter(e => e.status === "pending").length}
                </p>
              </div>
              <span className="bg-yellow-500/10 p-2 rounded-full text-yellow-500">
                <FileText className="w-6 h-6" />
              </span>
            </div>
          </div>
          
          <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Pricing Rules</h3>
                <p className="text-3xl font-bold mt-2">{pricingRules.length}</p>
              </div>
              <span className="bg-green-500/10 p-2 rounded-full text-green-500">
                <PaintBucket className="w-6 h-6" />
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
          </TabsList>
          
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>View and manage customer leads</CardDescription>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No leads yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Name</th>
                          <th className="py-3 px-4 text-left">Service</th>
                          <th className="py-3 px-4 text-left">Status</th>
                          <th className="py-3 px-4 text-left">Date</th>
                          <th className="py-3 px-4 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b hover:bg-secondary/50">
                            <td className="py-3 px-4">{lead.name}</td>
                            <td className="py-3 px-4">{lead.service_type}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                lead.status === "new" 
                                  ? "bg-blue-100 text-blue-800" 
                                  : lead.status === "contacted" 
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {new Date(lead.created_at!).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="estimates">
            <Card>
              <CardHeader>
                <CardTitle>Estimate Management</CardTitle>
                <CardDescription>View and manage project estimates</CardDescription>
              </CardHeader>
              <CardContent>
                {estimates.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No estimates yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">ID</th>
                          <th className="py-3 px-4 text-left">Total</th>
                          <th className="py-3 px-4 text-left">Status</th>
                          <th className="py-3 px-4 text-left">Date</th>
                          <th className="py-3 px-4 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estimates.map((estimate) => (
                          <tr key={estimate.id} className="border-b hover:bg-secondary/50">
                            <td className="py-3 px-4">{estimate.id?.substring(0, 8)}</td>
                            <td className="py-3 px-4">${estimate.total_cost.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                estimate.status === "pending" 
                                  ? "bg-yellow-100 text-yellow-800" 
                                  : estimate.status === "approved" 
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {estimate.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {new Date(estimate.created_at!).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage system users</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Name</th>
                          <th className="py-3 px-4 text-left">Role</th>
                          <th className="py-3 px-4 text-left">Phone</th>
                          <th className="py-3 px-4 text-left">Joined</th>
                          <th className="py-3 px-4 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-secondary/50">
                            <td className="py-3 px-4">{user.name || "No name"}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.role === "admin" 
                                  ? "bg-red-100 text-red-800" 
                                  : user.role === "staff" 
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">{user.phone || "No phone"}</td>
                            <td className="py-3 px-4">
                              {new Date(user.created_at!).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pricing">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pricing Rules</CardTitle>
                  <CardDescription>Manage service pricing rules</CardDescription>
                </div>
                <Button size="sm" className="bg-paint hover:bg-paint-dark">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Rule
                </Button>
              </CardHeader>
              <CardContent>
                {pricingRules.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pricing rules configured</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Service Type</th>
                          <th className="py-3 px-4 text-left">Room Type</th>
                          <th className="py-3 px-4 text-left">Base Price</th>
                          <th className="py-3 px-4 text-left">Cost Per SqFt</th>
                          <th className="py-3 px-4 text-left">Labor Cost/Hr</th>
                          <th className="py-3 px-4 text-left">Material Cost</th>
                          <th className="py-3 px-4 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricingRules.map((rule) => (
                          <tr key={rule.id} className="border-b hover:bg-secondary/50">
                            <td className="py-3 px-4">{rule.service_type}</td>
                            <td className="py-3 px-4">{rule.room_type || "Any"}</td>
                            <td className="py-3 px-4">${rule.base_price.toFixed(2)}</td>
                            <td className="py-3 px-4">${rule.cost_per_sqft.toFixed(2)}</td>
                            <td className="py-3 px-4">${rule.labor_cost_per_hour.toFixed(2)}</td>
                            <td className="py-3 px-4">${rule.material_cost_per_gallon.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
