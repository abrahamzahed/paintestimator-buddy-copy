
import { LineItem } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LineItemsTableProps {
  lineItems: LineItem[];
}

const LineItemsTable = ({ lineItems }: LineItemsTableProps) => {
  if (lineItems.length === 0) {
    return null;
  }
  
  // Calculate the grand total for all line items
  const grandTotal = lineItems.reduce(
    (total, item) => total + (item.quantity || 0) * (item.unit_price || 0),
    0
  );
  
  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">Materials & Services</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Description</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.description}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.unit_price || 0)}</TableCell>
              <TableCell className="text-right">{formatCurrency((item.quantity || 0) * (item.unit_price || 0))}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3} className="text-right font-medium">
              Subtotal
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(grandTotal)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default LineItemsTable;
