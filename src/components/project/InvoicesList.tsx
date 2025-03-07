
import { Invoice } from "@/types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface InvoicesListProps {
  invoices: Invoice[];
}

const InvoicesList = ({ invoices }: InvoicesListProps) => {
  if (invoices.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="hover:bg-secondary/20 transition-colors overflow-hidden border border-gray-100 shadow-sm">
            <div className={`h-2 w-full ${
              invoice.status === "unpaid" 
                ? "bg-yellow-400" 
                : invoice.status === "paid" 
                ? "bg-green-400"
                : "bg-gray-400"
            }`}></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Invoice #{invoice.id?.substring(0, 8)}</CardTitle>
              <CardDescription>
                {new Date(invoice.created_at!).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">${invoice.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={`px-2 py-1 rounded text-xs inline-block ${
                      invoice.status === "unpaid" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : invoice.status === "paid" 
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to={`/invoice/${invoice.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="text-center py-12 bg-secondary/30 rounded-lg">
      <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
      <p className="text-lg font-medium mb-2">No invoices yet</p>
      <p className="text-muted-foreground">
        Invoices will appear here after estimates are approved
      </p>
    </div>
  );
};

export default InvoicesList;
