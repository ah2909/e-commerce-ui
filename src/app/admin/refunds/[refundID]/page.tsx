import { RefundView } from "@/components/admin/payments";
export default async function RefundPage({ params }: { params: Promise<{ refundID: string }> }) {
  const { refundID } = await params;
  return <RefundView refundID={refundID} />;
}
