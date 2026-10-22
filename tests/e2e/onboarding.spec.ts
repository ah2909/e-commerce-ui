import { expect, test } from "@playwright/test";

const url = `http://example.test:${process.env.UI_SMOKE_UI_PORT || "3000"}/platform/stores/new`;
async function fill(page: import("@playwright/test").Page) {
  await page.getByLabel("Tên cửa hàng", { exact: true }).fill("Mộc Studio");
  await expect(page.getByLabel("Địa chỉ cửa hàng", { exact: true })).toHaveValue("moc-studio");
  await page.getByLabel("Email", { exact: true }).fill("owner@example.com");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("owner-password-123");
  await page.getByLabel("Mã truy cập nền tảng", { exact: true }).fill("synthetic-platform-token");
}
test("single-page onboarding previews names and addresses without overflow", async ({ page }) => {
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "Tạo cửa hàng của bạn." })).toBeVisible();
  await fill(page);
  await page.getByLabel("Địa chỉ cửa hàng", { exact: true }).fill("custom-shop");
  await page.getByLabel("Tên cửa hàng", { exact: true }).fill("Mộc Studio mới");
  await expect(page.getByLabel("Địa chỉ cửa hàng", { exact: true })).toHaveValue("custom-shop");
  await page.getByRole("button", { name: "Hiện mật khẩu" }).click();
  await expect(page.getByLabel("Mật khẩu", { exact: true })).toHaveAttribute("type", "text");
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({
      path: `docs/previews/onboarding/create-store-${width}.png`,
      fullPage: true,
    });
  }
});
test("submits the contract and links to the new tenant after confirmed creation", async ({
  page,
}) => {
  let count = 0;
  await page.route("**/api/platform/stores", async (route) => {
    count++;
    expect(route.request().headers().authorization).toBe("Bearer synthetic-platform-token");
    expect(route.request().postDataJSON()).toEqual({
      store_name: "Mộc Studio",
      subdomain: "moc-studio",
      email: "owner@example.com",
      password: "owner-password-123",
      default_currency: "VND",
      locale: "vi-VN",
      timezone: "Asia/Ho_Chi_Minh",
    });
    await route.fulfill({ status: 201, json: { subdomain: "moc-studio" } });
  });
  await page.goto(url);
  await fill(page);
  await page.getByRole("button", { name: "Tạo cửa hàng", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Cửa hàng đã được tạo!" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Đăng nhập cửa hàng" })).toHaveAttribute(
    "href",
    new RegExp(
      `^https?://moc-studio\\.example\\.test:${process.env.UI_SMOKE_UI_PORT || "3000"}/account$`,
    ),
  );
  expect(count).toBe(1);
});
test("blocks reserved addresses and avoids retries after an uncertain creation", async ({
  page,
}) => {
  let count = 0;
  await page.route("**/api/platform/stores", async (route) => {
    count++;
    await route.fulfill({ status: 502, json: { code: "result_unknown" } });
  });
  await page.goto(url);
  await fill(page);
  await page.getByLabel("Địa chỉ cửa hàng", { exact: true }).fill("admin");
  await page.getByRole("button", { name: "Tạo cửa hàng", exact: true }).click();
  expect(count).toBe(0);
  await page.getByLabel("Địa chỉ cửa hàng", { exact: true }).fill("moc-studio");
  await page.getByRole("button", { name: "Tạo cửa hàng", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Chưa thể hoàn tất" })).toContainText(
    "Chưa xác định được kết quả",
  );
  await expect(page.getByRole("button", { name: "Tạo cửa hàng", exact: true })).toBeDisabled();
  expect(count).toBe(1);
});
