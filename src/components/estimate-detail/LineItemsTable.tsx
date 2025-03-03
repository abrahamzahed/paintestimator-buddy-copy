
import { LineItem } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";

interface LineItemsTableProps {
  lineItems: LineItem[];
}

const LineItemsTable = ({ lineItems }: LineItemsTableProps) => {
  if (lineItems.length === 0) {
    return null;
  }
  
  return (
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
  );
};

export default LineItemsTable;
