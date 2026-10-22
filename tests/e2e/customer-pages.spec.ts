import { expect, test, type Page } from "@playwright/test";

const origin = process.env.UI_STOREFRONT_ORIGIN || "http://football.example.test:3000";
const appearance = {
  preset: "sport",
  display_name: "Football Test Store",
  tagline: "Football",
  hero_title: "Football",
  hero_text: "Store fixture",
  logo_url: "",
  hero_url: "",
  announcement: "",
  version: 1,
};
const savedAddress = {
  address_id: "address-fixture",
  label: "Nhà riêng",
  recipient_name: "Khách hàng Test",
  phone: "0901234567",
  line1: "12 Nguyễn Huệ",
  line2: "",
  ward: "Phường Sài Gòn",
  district: "",
  province: "Thành phố Hồ Chí Minh",
  postal_code: "",
  country_code: "VN",
  version: 2,
};
async function fixtures(
  page: Page,
  cartMode: "missing" | "error" | "filled" | "denied" = "missing",
  kind = "user",
) {
  const writes: Array<{ path: string; method: string; body: Record<string, unknown> }> = [];
  let quantity = 1;
  let version = 3;
  let removed = false;
  let addresses = [savedAddress];
  let profile = {
    full_name: "Khách hàng Test",
    email: "customer@fixture.test",
    phone: "0901234567",
    version: 2,
  };
  await page.route("**/api/session**", (route) =>
    route.fulfill({
      json: { kind, session: kind === "anonymous" ? null : "customer-pages-fixture" },
    }),
  );
  await page.route("**/api/v1/**", (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() !== "GET") {
      const body = request.postDataJSON() as Record<string, unknown>;
      writes.push({ path, method: request.method(), body });
      if (path === "/api/v1/customer/profile") {
        profile = { ...profile, ...body, version: 3 };
        return route.fulfill({ json: profile });
      }
      if (path.endsWith("/addresses/address-fixture")) {
        if (request.method() === "DELETE") {
          addresses = [];
          return route.fulfill({ status: 204 });
        }
        addresses = [{ ...savedAddress, ...body, version: 3 }];
        return route.fulfill({ json: addresses[0] });
      }
      if (path.includes("/cart/lines/")) {
        version++;
        if (request.method() === "DELETE") removed = true;
        else quantity = Number(body.quantity);
        return route.fulfill({ json: { version } });
      }
      return route.fulfill({ json: {} });
    }
    if (path === "/api/v1/storefront") return route.fulfill({ json: appearance });
    if (path === "/api/v1/store")
      return route.fulfill({ status: 403, json: { code: "forbidden" } });
    if (path === "/api/v1/customer/profile") return route.fulfill({ json: profile });
    if (path === "/api/v1/customer/addresses")
      return route.fulfill({ json: { addresses, next_cursor: null } });
    if (path === "/api/v1/catalog/products")
      return route.fulfill({ json: { products: [], next_cursor: null } });
    if (path === "/api/v1/cart") {
      if (cartMode === "missing")
        return route.fulfill({
          status: 404,
          json: { code: "cart_unavailable", message: "Cart resource is unavailable." },
        });
      if (cartMode === "error" || cartMode === "denied")
        return route.fulfill({
          status: cartMode === "error" ? 503 : 403,
          json: { code: "unavailable", message: "Unavailable" },
        });
      return route.fulfill({
        json: {
          version,
          status: "active",
          checkout_ready: true,
          estimated_subtotal: { amount_minor: quantity * 990000, currency: "VND" },
          lines: removed
            ? []
            : [
                {
                  variant_id: "variant-fixture",
                  product_name: "Arsenal Home Jersey",
                  sku: "ARS-M",
                  option_values: { size: "M" },
                  quantity,
                  sellable: true,
                  in_stock: true,
                  unit_price: { amount_minor: 990000, currency: "VND" },
                  line_estimate: { amount_minor: quantity * 990000, currency: "VND" },
                },
              ],
        },
      });
    }
    return route.fulfill({ json: {} });
  });
  return writes;
}
test("missing cart is a useful empty state without creating a cart", async ({ page }) => {
  const writes = await fixtures(page);
  await page.goto(`${origin}/cart`);
  await expect(page.getByRole("heading", { name: "Giỏ hàng của bạn", exact: true })).toBeVisible();
  await expect(page.locator(".cart-empty-card")).toContainText("Giỏ hàng của bạn đang trống");
  await expect(
    page.locator(".cart-empty-card").getByRole("link", { name: "Khám phá sản phẩm", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".cart-load-error")).toHaveCount(0);
  expect(writes).toHaveLength(0);
});
for (const state of ["error", "denied"] as const)
  test(`${state} cart responses are not disguised as empty carts`, async ({ page }) => {
    await fixtures(page, state);
    await page.goto(`${origin}/cart`);
    await expect(page.getByRole("heading", { name: "Chưa thể tải giỏ hàng" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Thử lại", exact: true })).toBeVisible();
    await expect(page.locator(".cart-empty-card")).toHaveCount(0);
  });
test("populated cart updates and removes lines with current versions", async ({ page }) => {
  const writes = await fixtures(page, "filled");
  await page.goto(`${origin}/cart`);
  await expect(page.getByRole("heading", { name: "Arsenal Home Jersey" })).toBeVisible();
  await page.getByLabel("Số lượng", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Cập nhật", exact: true }).click();
  await expect(page.locator(".cart-summary-total strong")).toContainText("1.980.000");
  expect(writes[0]).toMatchObject({ method: "PUT", body: { quantity: 2, expected_version: 3 } });
  await page.getByRole("button", { name: "Xóa", exact: true }).click();
  await expect(page.locator(".cart-empty-card")).toBeVisible();
  expect(writes[1]).toMatchObject({ method: "DELETE", body: { expected_version: 4 } });
});
test("profile saves the contact fields with optimistic version and shows feedback", async ({
  page,
}) => {
  const writes = await fixtures(page);
  await page.goto(`${origin}/account/profile`);
  await page.getByLabel("Họ và tên", { exact: true }).fill("Nguyễn Khách Test");
  await page.getByRole("button", { name: "Lưu thông tin", exact: true }).click();
  await expect(page.getByText("Đã lưu thay đổi.", { exact: true })).toBeVisible();
  expect(writes[0]).toMatchObject({
    path: "/api/v1/customer/profile",
    method: "PUT",
    body: { full_name: "Nguyễn Khách Test", expected_version: 2 },
  });
  await expect(page.getByRole("link", { name: /Thông tin cá nhân/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
test("address editing and confirmed archive preserve current address versions", async ({
  page,
}) => {
  const writes = await fixtures(page);
  await page.goto(`${origin}/account/addresses`);
  await page.getByRole("button", { name: "Chỉnh sửa", exact: true }).click();
  await expect(page.getByLabel("Tên địa chỉ", { exact: true })).toBeFocused();
  await page.getByLabel("Số nhà, tên đường").fill("24 Nguyễn Huệ");
  await page.getByRole("button", { name: "Lưu địa chỉ", exact: true }).click();
  await expect(page.locator(".saved-address-details")).toContainText("24 Nguyễn Huệ");
  expect(writes[0]).toMatchObject({
    method: "PUT",
    body: { line1: "24 Nguyễn Huệ", expected_version: 2 },
  });
  await page.getByRole("button", { name: "Lưu trữ", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Quay lại" }).click();
  expect(writes).toHaveLength(1);
  await page.getByRole("button", { name: "Lưu trữ", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Xác nhận", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Thêm điểm đến đầu tiên" })).toBeVisible();
  expect(writes[1]).toMatchObject({ method: "DELETE", body: { expected_version: 3 } });
});
test("customer pages fit a small phone", async ({ page }) => {
  await fixtures(page, "filled");
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ["/account/profile", "/account/addresses", "/cart"]) {
    await page.goto(`${origin}${path}`);
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForLoadState("networkidle");
    if (path === "/account/addresses") {
      await page.getByRole("button", { name: "Chỉnh sửa", exact: true }).click();
      await expect(page.getByLabel("Tên địa chỉ", { exact: true })).toBeFocused();
      expect(
        await page
          .locator(".address-location-heading")
          .evaluate((element) => getComputedStyle(element).flexDirection),
      ).toBe("column");
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
  }
});
