import { describe, expect, it } from "vitest";
import {
  brandOf,
  emptyFilters,
  filterCatalog,
  priceBound,
  readFilters,
  suggestCatalogSearch,
  type CatalogProduct,
} from "../src/lib/catalog";

function product(
  id: string,
  brand: string,
  variants: Array<[string, number, boolean]>,
): CatalogProduct {
  return {
    product_id: id,
    slug: id,
    name: `Áo ${id}`,
    description: "Áo bóng đá",
    published_at: "2026-10-22T00:00:00Z",
    media: [],
    categories: [
      { category_id: "brand", slug: `brand-${brand.toLowerCase()}`, name: `Brand ${brand}` },
      { category_id: "jerseys", slug: "ao-bong-da", name: "Áo bóng đá" },
    ],
    variants: variants.map(([size, amount, inStock], index) => ({
      variant_id: `${id}-${index}`,
      sku: `${id}-${size}`,
      option_values: { size },
      price: { amount_minor: amount, currency: "VND", vat_inclusive: true },
      in_stock: inStock,
      weight_grams: 250,
      dimensions: {},
    })),
  };
}
describe("catalog discovery", () => {
  const arsenal = product("Arsenal", "ADIDAS", [
    ["M", 900000, false],
    ["L", 1200000, true],
  ]);
  const nike = product("Nike", "Nike", [["M", 1500000, true]]);
  it("matches price, size and stock on the same variant", () => {
    expect(filterCatalog([arsenal], { ...emptyFilters, min: "1000000", size: "M" })).toHaveLength(
      0,
    );
    expect(
      filterCatalog([arsenal], { ...emptyFilters, max: "1000000", stock: "in-stock" }),
    ).toHaveLength(0);
    expect(
      filterCatalog([arsenal], { ...emptyFilters, min: "1000000", size: "L", stock: "in-stock" })[0]
        .price,
    ).toBe(1200000);
  });
  it("searches without Vietnamese accents and combines brand/category filters", () => {
    expect(
      filterCatalog([arsenal, nike], {
        ...emptyFilters,
        q: "ao arsenal",
        brand: "adidas",
        category: "ao-bong-da",
      }).map((item) => item.product.product_id),
    ).toEqual(["Arsenal"]);
    expect(brandOf(arsenal)).toBe("adidas");
  });
  it("sorts both price directions without mutating the source catalog", () => {
    const products = [nike, arsenal];
    expect(
      filterCatalog(products, { ...emptyFilters, sort: "price-asc" }).map((item) => item.price),
    ).toEqual([1200000, 1500000]);
    expect(
      filterCatalog(products, { ...emptyFilters, sort: "price-desc" }).map((item) => item.price),
    ).toEqual([1500000, 1200000]);
    expect(products[0]).toBe(nike);
  });
  it("selects one variant for the displayed price and availability", () => {
    expect(filterCatalog([arsenal], emptyFilters)[0]).toMatchObject({
      price: 1200000,
      inStock: true,
      variant: { variant_id: "Arsenal-1" },
    });
    expect(filterCatalog([arsenal], { ...emptyFilters, size: "M" })[0]).toMatchObject({
      price: 900000,
      inStock: false,
      variant: { variant_id: "Arsenal-0" },
    });
  });
  it("ranks product names first and suggests a nearby search within the active filters", () => {
    const other = {
      ...nike,
      description: "Áo Arsenal",
      published_at: "2026-10-23T00:00:00Z",
    };
    expect(filterCatalog([other, arsenal], { ...emptyFilters, q: "Arsenal" })[0].product).toBe(
      arsenal,
    );
    const typo = { ...emptyFilters, q: "ao Arsneal", size: "L", stock: "in-stock" };
    expect(suggestCatalogSearch([other, arsenal], typo)).toBe("ao Arsenal");
    expect(suggestCatalogSearch([other, arsenal], { ...typo, max: "1000000" })).toBeUndefined();
  });
  it("preserves URL filters and treats invalid money inputs as absent", () => {
    expect(
      readFilters(new URLSearchParams("q=Arsenal&brand=adidas&sort=price-desc")),
    ).toMatchObject({ q: "Arsenal", brand: "adidas", sort: "price-desc", min: "" });
    for (const invalid of ["-1", "1.5", "NaN", "9007199254740992"])
      expect(priceBound(invalid)).toBeUndefined();
    expect(
      filterCatalog([arsenal], { ...emptyFilters, min: "2000000", max: "1000000" }),
    ).toHaveLength(0);
  });
});
