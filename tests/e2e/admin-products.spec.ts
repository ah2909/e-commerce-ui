import { expect, test, type Page } from "@playwright/test";

const origin = process.env.ADMIN_PRODUCTS_ORIGIN || "http://localhost:3012";
const variantID = "11111111-1111-4111-8111-111111111111";
const missingID = "22222222-2222-4222-8222-222222222222";
const product = {
  product_id: "product-fixture",
  name: "Áo thun basic",
  slug: "ao-thun-basic",
  status: "published",
  media: [{ object_key: "shirt.png", alt_text: "Áo thun đen", position: 0, archived_at: null }],
  variants: [
    {
      variant_id: variantID,
      sku: "AT-DEN-M",
      option_values: { color: "Đen", size: "M" },
      status: "active",
    },
  ],
};
const stock = { variant_id: variantID, on_hand: 20, reserved: 2, available: 18, version: 7 };
const amount = { amount_minor: 150000, currency: "VND" };
const order = {
  order_id: "order-fixture",
  order_number: "DH-001",
  state: "completed",
  contact: { name: "Khách thử nghiệm" },
  created_at: "2026-10-27T01:00:00Z",
  lines: [
    {
      line_id: "line-fixture",
      variant_id: variantID,
      product_name: "Tên áo lúc đặt hàng",
      sku: "OLD-SKU",
      option_values: { size: "L" },
      quantity: 2,
      line_total: amount,
    },
  ],
  subtotal: amount,
  shipping_total: amount,
  grand_total: amount,
  delivery_address: {
    recipient_name: "Khách thử nghiệm",
    phone: "0901234567",
    line1: "12 Nguyễn Huệ",
    ward: "Phường Sài Gòn",
    province: "Thành phố Hồ Chí Minh",
  },
  payment: { state: "succeeded", provider: "vietqr", amount },
};

async function fixtures(page: Page, { broken = false, denied = false } = {}) {
  const writes: { path: string; body: Record<string, unknown> }[] = [];
  const cursors: (string | null)[] = [];
  await page.route("**/api/session**", (route) =>
    route.fulfill({ json: { kind: "user", session: "admin-image-fixture" } }),
  );
  await page.route("**/api/media?**", (route) =>
    broken
      ? route.fulfill({ status: 404 })
      : route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><path fill="#264b3a" d="M20 8 4 20l9 13 7-4v28h24V29l7 4 9-13L44 8Z"/></svg>',
        }),
  );
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (request.method() !== "GET") {
      writes.push({ path, body: request.postDataJSON() });
      return route.fulfill({ json: { ...stock, version: 8 } });
    }
    if (path === "/api/v1/admin/catalog/products") {
      if (denied)
        return route.fulfill({
          status: 403,
          json: { code: "forbidden", message: "Không có quyền xem danh mục" },
        });
      cursors.push(url.searchParams.get("cursor"));
      return route.fulfill({
        json:
          url.searchParams.get("limit") === "100" && !url.searchParams.get("cursor")
            ? { products: [], next_cursor: "next-products" }
            : { products: [product], next_cursor: null },
      });
    }
    const responses: Record<string, unknown> = {
      "/api/v1/store": { name: "Cửa hàng thử nghiệm", role: "owner" },
      "/api/v1/storefront": { preset: "home", display_name: "Cửa hàng thử nghiệm", version: 1 },
      "/api/v1/catalog/products": { products: [], next_cursor: null },
      "/api/v1/admin/catalog/categories": { categories: [], next_cursor: null },
      "/api/v1/admin/inventory/stock-items": {
        stock_items: [stock, { ...stock, variant_id: missingID }],
        next_cursor: null,
      },
      [`/api/v1/admin/inventory/stock-items/${variantID}`]: stock,
      "/api/v1/admin/pricing/price-lists": {
        price_lists: [
          {
            price_list_id: "price-fixture",
            name: "Giá bán",
            priority: 0,
            status: "active",
            version: 3,
            prices: [{ variant_id: variantID, money: amount }],
          },
        ],
        next_cursor: null,
      },
      "/api/v1/admin/orders": { orders: [order], next_cursor: null },
      "/api/v1/admin/orders/order-fixture": order,
    };
    return route.fulfill({ json: responses[path] || {} });
  });
  return { writes, cursors };
}

test("inventory resolves later catalog pages and adjusts the identified variant", async ({
  page,
}) => {
  const { writes, cursors } = await fixtures(page);
  await page.goto(`${origin}/admin/inventory`);
  const row = page.getByRole("row").filter({ hasText: "AT-DEN-M" });
  await expect(row).toContainText("Áo thun basic");
  await expect(row).toContainText("Đen / M");
  await expect(row.getByRole("img", { name: "Áo thun đen" })).toBeVisible();
  expect(cursors).toContain(null);
  expect(cursors.at(-1)).toBe("next-products");
  await row.getByRole("button", { name: "Điều chỉnh", exact: true }).click();
  const form = page
    .locator("form")
    .filter({ has: page.getByRole("heading", { name: "Điều chỉnh tồn kho" }) });
  await expect(form).toContainText("AT-DEN-M");
  await form.getByLabel("Thay đổi số lượng (+/-)", { exact: true }).fill("3");
  await form.getByLabel("Lý do", { exact: true }).fill("Nhập hàng mới");
  await form.getByRole("button", { name: "Xác nhận điều chỉnh" }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0]).toEqual({
    path: `/api/v1/admin/inventory/stock-items/${variantID}/adjustments`,
    body: { quantity_delta: 3, reason: "Nhập hàng mới", expected_version: 7 },
  });
});

test("missing products and broken images retain usable inventory rows", async ({ page }) => {
  await fixtures(page, { broken: true });
  await page.goto(`${origin}/admin/inventory`);
  const row = page.getByRole("row").filter({ hasText: "AT-DEN-M" });
  await expect(
    row.getByRole("img", { name: "Chưa có hình ảnh: Áo thun basic", exact: true }),
  ).toBeVisible();
  const unknown = page.getByRole("row").filter({ hasText: missingID });
  await expect(unknown).toContainText("Chưa có thông tin sản phẩm");
  await expect(unknown.getByRole("button", { name: "Điều chỉnh" })).toBeEnabled();
});

test("product and pricing pages show product thumbnails and names", async ({ page }) => {
  await fixtures(page);
  await page.goto(`${origin}/admin/products`);
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: "Áo thun basic" })
      .getByRole("img", { name: "Áo thun đen" }),
  ).toBeVisible();
  await page.goto(`${origin}/admin/prices`);
  await expect(page.getByText("SKU: AT-DEN-M", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Áo thun đen" })).toBeVisible();
});

test("orders retain historical names, SKUs and options beside current catalog images", async ({
  page,
}) => {
  await fixtures(page);
  for (const path of ["/admin/orders", "/admin/orders/order-fixture"]) {
    await page.goto(`${origin}${path}`);
    await expect(page.getByText("Tên áo lúc đặt hàng", { exact: true })).toBeVisible();
    await expect(page.getByText("SKU: OLD-SKU", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "Áo thun đen" })).toBeVisible();
    await expect(page.getByText("SKU: AT-DEN-M", { exact: true })).toHaveCount(0);
  }
});

test("catalog permission failure does not hide orders or their saved details", async ({ page }) => {
  await fixtures(page, { denied: true });
  await page.goto(`${origin}/admin/orders/order-fixture`);
  await expect(page.getByText("Tên áo lúc đặt hàng", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Chưa có hình ảnh: Tên áo lúc đặt hàng", exact: true }),
  ).toBeVisible();
});

test("inventory remains readable at phone and desktop widths", async ({ page }, info) => {
  await fixtures(page);
  await page.goto(`${origin}/admin/inventory`);
  await expect(page.getByText("SKU: AT-DEN-M", { exact: true })).toBeVisible();
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: info.outputPath(`inventory-${width}.png`), fullPage: true });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});
