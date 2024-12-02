import { getUser } from "@/lib/queries";

export async function OrderHistoryDynamic() {
  const user = await getUser();
  return user ? (
    <div className="border-t border-gray-200 pt-4">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm font-medium text-gray-500">
            <th className="w-1/2 pb-2">Product</th>
            <th className="w-1/4 pb-2">Last Order Date</th>
            <th className="w-1/4 pb-2">Purchase Order</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3} className="py-8 text-center text-gray-500">
              You have no previous orders.
              <br />
              When you place an order, it will appear here.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ) : (
    <p className="font-semibold text-black">Log in to view order history</p>
  );
}
