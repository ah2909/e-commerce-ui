import type { Schema } from "./api/client";

export type CatalogProduct = Schema["PublicCatalogProduct"];
export type CatalogFilters = {
  q: string;
  brand: string;
  category: string;
  size: string;
  min: string;
  max: string;
  stock: string;
  sort: string;
};
export const emptyFilters: CatalogFilters = {
  q: "",
  brand: "",
  category: "",
  size: "",
  min: "",
  max: "",
  stock: "",
  sort: "newest",
};
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D")
    .toLowerCase();
export function readFilters(params: URLSearchParams): CatalogFilters {
  return Object.fromEntries(
    Object.entries(emptyFilters).map(([key, fallback]) => [key, params.get(key) || fallback]),
  ) as CatalogFilters;
}
export function brandOf(product: CatalogProduct): string {
  const value =
    product.categories
      ?.find((category) => /^brand\s/i.test(category.name))
      ?.name.replace(/^brand\s+/i, "")
      .trim() ||
    product.variants.find((variant) => variant.option_values.brand)?.option_values.brand ||
    "";
  const known: Record<string, string> = {
    nike: "Nike",
    adidas: "adidas",
    puma: "Puma",
    mizuno: "Mizuno",
    asics: "ASICS",
    "new balance": "New Balance",
  };
  return known[value.toLowerCase()] || value;
}
export function priceBound(value: string): number | undefined {
  if (!/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}
export function filterCatalog(products: CatalogProduct[], filters: CatalogFilters) {
  const minimum = priceBound(filters.min);
  const maximum = priceBound(filters.max);
  const terms = normalizeSearch(filters.q.trim()).split(/\s+/).filter(Boolean);
  return products
    .flatMap((product) => {
      const brand = brandOf(product);
      const categories = product.categories || [];
      const haystack = normalizeSearch(
        [
          product.name,
          product.description,
          brand,
          ...categories.map((category) => category.name),
          ...product.variants.map((variant) => variant.sku),
        ].join(" "),
      );
      if (
        terms.some((term) => !haystack.includes(term)) ||
        (filters.brand && normalizeSearch(brand) !== normalizeSearch(filters.brand)) ||
        (filters.category && !categories.some((category) => category.slug === filters.category))
      )
        return [];
      const variants = product.variants.filter(
        (variant) =>
          (!filters.size || variant.option_values.size === filters.size) &&
          (!filters.stock || variant.in_stock) &&
          (minimum === undefined || variant.price.amount_minor >= minimum) &&
          (maximum === undefined || variant.price.amount_minor <= maximum),
      );
      if (!variants.length) return [];
      return [
        {
          product,
          brand,
          price: Math.min(...variants.map((variant) => variant.price.amount_minor)),
          inStock: variants.some((variant) => variant.in_stock),
        },
      ];
    })
    .sort((a, b) => {
      if (filters.sort === "price-asc")
        return a.price - b.price || a.product.product_id.localeCompare(b.product.product_id);
      if (filters.sort === "price-desc")
        return b.price - a.price || a.product.product_id.localeCompare(b.product.product_id);
      if (filters.sort === "name-asc") return a.product.name.localeCompare(b.product.name, "vi");
      return (
        Date.parse(b.product.published_at) - Date.parse(a.product.published_at) ||
        b.product.product_id.localeCompare(a.product.product_id)
      );
    });
}
