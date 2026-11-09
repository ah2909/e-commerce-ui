import { test, expect, type Page } from "@playwright/test";

const origin = process.env.UI_STOREFRONT_ORIGIN || "http://football.example.test:3000";
const appearance = {
  preset: "sport",
  display_name: "Football Test Store",
  tagline: "Football without borders",
  hero_title: "Màu áo của đam mê",
  hero_text: "Cửa hàng dành cho người yêu bóng đá.",
  announcement: "",
  logo_url: "",
  hero_url: "",
  version: 1,
};
const product = (
  id: string,
  name: string,
  brand: string,
  price: number,
  category = "giay-bong-da",
) => ({
  product_id: id,
  name,
  slug: id,
  description: "Sản phẩm bóng đá",
  published_at: "2026-10-22T00:00:00Z",
  media: [],
  categories: [
    { category_id: `brand-${brand}`, name: `Brand ${brand}`, slug: `brand-${brand.toLowerCase()}` },
    {
      category_id: category,
      name: category === "ao-bong-da" ? "Áo bóng đá" : "Giày bóng đá",
      slug: category,
    },
  ],
  variants: [
    {
      variant_id: `${id}-m`,
      sku: id,
      option_values: { size: "M" },
      price: { amount_minor: price, currency: "VND", vat_inclusive: true },
      in_stock: true,
      dimensions: {},
      weight_grams: 250,
    },
  ],
});
const products = [
  product("nike", "Nike Tiempo", "Nike", 2000000),
  product("puma", "Puma Future", "Puma", 3000000),
  (() => {
    const shirt = product("arsenal", "Arsenal Home Jersey", "Adidas", 790000, "ao-bong-da");
    return {
      ...shirt,
      variants: [
        ...shirt.variants,
        {
          ...shirt.variants[0],
          variant_id: "arsenal-l",
          sku: "arsenal-l",
          option_values: { size: "L" },
          price: { ...shirt.variants[0].price, amount_minor: 850000 },
        },
      ],
    };
  })(),
];
async function fixtures(
  page: Page,
  role: "customer" | "owner" | "staff" | "unavailable" = "customer",
) {
  await page.route("**/api/session**", (route) =>
    route.fulfill({ json: { kind: "user", session: "discovery-fixture" } }),
  );
  await page.route("**/api/v1/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/v1/storefront") return route.fulfill({ json: appearance });
    if (url.pathname === "/api/v1/auth/me")
      return route.fulfill({ json: { email: "customer@fixture.test" } });
    if (url.pathname === "/api/v1/store")
      return role === "customer" || role === "unavailable"
        ? route.fulfill({
            status: role === "customer" ? 403 : 503,
            json: { code: "unavailable", message: "Unavailable" },
          })
        : route.fulfill({ json: { name: "Football Test Store", role } });
    if (url.pathname === "/api/v1/catalog/products")
      return route.fulfill({
        json: url.searchParams.get("cursor")
          ? { products: products.slice(2), next_cursor: null }
          : { products: products.slice(0, 2), next_cursor: "second-page" },
      });
    const product = products.find(
      (item) => url.pathname === `/api/v1/catalog/products/${item.slug}`,
    );
    if (product) return route.fulfill({ json: product });
    return route.fulfill({ json: {} });
  });
}
test("customer dashboard hides every management link and remains usable on mobile", async ({
  page,
}) => {
  await fixtures(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${origin}/account`);
  await expect(page.getByRole("heading", { name: "Tài khoản của bạn" })).toBeVisible();
  await expect(page.getByText("customer@fixture.test", { exact: true })).toBeVisible();
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Thông tin cá nhân/ })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
});
for (const role of ["owner", "staff", "unavailable"] as const)
  test(`management navigation follows confirmed ${role} access`, async ({ page }) => {
    await fixtures(page, role);
    await page.goto(`${origin}/account`);
    await expect(page.getByText("customer@fixture.test", { exact: true })).toBeVisible();
    await expect(page.locator('a[href="/admin"]')).toHaveCount(role === "unavailable" ? 0 : 2);
  });
test("search includes later pages and brand/price/sort filters survive reload", async ({
  page,
}) => {
  await fixtures(page);
  await page.goto(`${origin}/products`);
  await expect(page.locator(".product-card")).toHaveCount(3);
  await page.getByLabel("Tìm sản phẩm", { exact: true }).fill("Arsenal");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card")).toContainText("Arsenal Home Jersey");
  await page.getByRole("button", { name: "Xóa tất cả", exact: true }).click();
  await page.getByLabel("Sắp xếp").selectOption("price-asc");
  await expect(page.locator(".product-card").first()).toContainText("Arsenal Home Jersey");
  await page.getByLabel("Sắp xếp").selectOption("price-desc");
  await expect(page.locator(".product-card").first()).toContainText("Puma Future");
  await page.getByLabel("Thương hiệu").selectOption("Nike");
  await page.getByLabel("Giá từ (VND)").fill("1500000");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.reload();
  await expect(page.getByLabel("Thương hiệu")).toHaveValue("Nike");
  await expect(page.getByLabel("Giá từ (VND)")).toHaveValue("1500000");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByLabel("Giá đến (VND)").fill("1000000");
  await expect(page.locator("#price-range-error")).toContainText("Giá đến phải lớn hơn");
  await expect(page.getByRole("heading", { name: "Chưa tìm thấy sản phẩm phù hợp" })).toBeVisible();
});
test("a failed later page does not present partial products as complete search results", async ({
  page,
}) => {
  await fixtures(page);
  await page.route("**/api/v1/catalog/products?**", (route) => {
    if (new URL(route.request().url()).searchParams.get("cursor"))
      return route.fulfill({
        status: 503,
        json: { code: "catalog_unavailable", message: "Catalog temporarily unavailable" },
      });
    return route.fallback();
  });
  await page.goto(`${origin}/products`);
  await expect(page.getByText("Catalog temporarily unavailable", { exact: true })).toBeVisible();
  await expect(page.locator(".product-card")).toHaveCount(0);
  await expect(page.getByLabel("Tìm sản phẩm", { exact: true })).toHaveCount(0);
});

test("homepage introduces the store using real catalog collections", async ({ page }) => {
  await fixtures(page);
  await page.goto(origin);
  await expect(page.locator(".hero-products")).toBeVisible();
  await expect(page.locator(".store-story")).toContainText("điểm hẹn dành cho người yêu bóng đá");
  await expect(page.locator(".store-facts")).toContainText("3");
  await expect(
    page
      .getByRole("navigation", { name: "Mua theo bộ sưu tập" })
      .getByRole("link", { name: "Giày bóng đá" }),
  ).toHaveAttribute("href", "/products?category=giay-bong-da");
  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
});

test("a phone shopper can recover a typo, open the filtered variant, and return to results", async ({
  page,
}) => {
  await fixtures(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(origin);
  await page.getByRole("searchbox").fill("Arsneal");
  await page.getByRole("button", { name: "Tìm", exact: true }).click();
  await page.getByRole("button", { name: "Tìm “Arsenal”" }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  const size = page.getByRole("combobox", { name: "Kích cỡ", exact: true });
  await expect(size).toBeHidden();
  await expect(page.locator(".product-card")).toBeInViewport();

  await page.getByRole("button", { name: "Lọc", exact: true }).click();
  await size.selectOption("L");
  await page.getByLabel("Giá đến (VND)").fill("900000");
  await page.getByRole("checkbox", { name: "Chỉ xem sản phẩm còn hàng" }).check();
  await page.getByRole("button", { name: "Lọc (3)", exact: true }).click();
  const card = page.locator(".product-card");
  await expect(card.locator(".price")).toHaveText(/850\.000/);
  await card.click();
  await expect(page.getByRole("button", { name: "L", exact: true, pressed: true })).toBeVisible();
  await expect(page.locator(".purchase-panel .price")).toHaveText(/850\.000/);
  await page.getByRole("link", { name: "Quay lại kết quả" }).click();
  await expect(page.getByRole("button", { name: "Lọc (3)", exact: true })).toBeVisible();
  await expect(page.getByRole("searchbox")).toHaveValue("Arsenal");
  await expect(card).toHaveCount(1);
});
