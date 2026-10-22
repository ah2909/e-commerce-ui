import { ProductEditor } from "@/components/admin/catalog";
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productID: string }>;
}) {
  const { productID } = await params;
  return <ProductEditor productID={productID} />;
}
