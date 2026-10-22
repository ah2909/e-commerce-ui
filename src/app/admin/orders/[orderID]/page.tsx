import { AdminOrderView } from "@/components/admin/orders";
export default async function AdminOrderPage({ params }: { params: Promise<{ orderID: string }> }) {
  const { orderID } = await params;
  return <AdminOrderView orderID={orderID} />;
}
