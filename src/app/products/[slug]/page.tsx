import { ProductDetail } from "@/components/catalog";
import { catalogQuery, readFilters } from "@/lib/catalog";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) search.set(name, first);
  }
  const variant = search.get("variant") || undefined;
  return (
    <ProductDetail
      key={`${slug}/${variant || ""}`}
      slug={slug}
      preferredVariantID={variant}
      returnFilters={catalogQuery(readFilters(search))}
    />
  );
}
