import { OrderView } from "@/components/order";
export default async function OrderPage({ params }: { params: Promise<{ orderID: string }> }) {
  const { orderID } = await params;
  return <OrderView orderID={orderID} />;
}
