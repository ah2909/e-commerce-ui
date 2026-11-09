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
  sort: "",
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
export function catalogQuery(filters: CatalogFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([key, value]) => value !== emptyFilters[key as keyof CatalogFilters],
    ),
  );
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
export function preferredCatalogVariant(variants: CatalogProduct["variants"]) {
  let preferred: CatalogProduct["variants"][number] | undefined;
  for (const variant of variants) {
    if (
      !preferred ||
      (variant.in_stock && !preferred.in_stock) ||
      (variant.in_stock === preferred.in_stock &&
        variant.price.amount_minor < preferred.price.amount_minor)
    ) {
      preferred = variant;
    }
  }
  return preferred;
}
export function filterCatalog(products: CatalogProduct[], filters: CatalogFilters) {
  const minimum = priceBound(filters.min);
  const maximum = priceBound(filters.max);
  const terms = normalizeSearch(filters.q.trim()).split(/\s+/).filter(Boolean);
  const query = terms.join(" ");
  return products
    .flatMap((product) => {
      const brand = brandOf(product);
      const categories = product.categories || [];
      const name = normalizeSearch(product.name);
      const skus = product.variants.map((variant) => normalizeSearch(variant.sku));
      const haystack = normalizeSearch(
        [
          product.name,
          product.description,
          brand,
          ...categories.map((category) => category.name),
          ...skus,
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
      const variant = preferredCatalogVariant(variants);
      if (!variant) return [];
      const relevance = !query
        ? 0
        : skus.includes(query) || name === query
          ? 3
          : name.includes(query)
            ? 2
            : Number(terms.every((term) => name.includes(term)));
      return [
        {
          product,
          brand,
          variant,
          price: variant.price.amount_minor,
          inStock: variant.in_stock,
          relevance,
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
        (!filters.sort ? b.relevance - a.relevance : 0) ||
        Date.parse(b.product.published_at) - Date.parse(a.product.published_at) ||
        b.product.product_id.localeCompare(a.product.product_id)
      );
    });
}

function isSingleEdit(term: string, word: string) {
  if (term === word || Math.abs(term.length - word.length) > 1) return false;
  const [shorter, longer] = term.length <= word.length ? [term, word] : [word, term];
  const first = longer.split("").findIndex((char, index) => char !== shorter[index]);
  if (shorter.length !== longer.length) return longer.slice(first + 1) === shorter.slice(first);
  if (longer.slice(first + 1) === shorter.slice(first + 1)) return true;
  return (
    longer[first] === shorter[first + 1] &&
    longer[first + 1] === shorter[first] &&
    longer.slice(first + 2) === shorter.slice(first + 2)
  );
}

export function suggestCatalogSearch(products: CatalogProduct[], filters: CatalogFilters) {
  const terms = filters.q.trim().split(/\s+/);
  const normalized = terms.map(normalizeSearch);
  if (!normalized.some((term) => term.length >= 4)) return;
  for (const { product } of filterCatalog(products, { ...filters, q: "" })) {
    const words = product.name.match(/[\p{L}\p{N}]+/gu) || [];
    const name = normalizeSearch(product.name);
    const missing = normalized.map((term) => !name.includes(term));
    const index = missing.indexOf(true);
    if (index < 0 || normalized[index].length < 4 || missing.lastIndexOf(true) !== index) continue;
    const word = words.find((candidate) =>
      isSingleEdit(normalized[index], normalizeSearch(candidate)),
    );
    if (word) return terms.map((term, position) => (position === index ? word : term)).join(" ");
  }
}
