import { expect, request, test, type Page, type Route } from "@playwright/test";
import { randomUUID } from "node:crypto";

const apiOrigin = process.env.UI_SMOKE_API_ORIGIN || "http://127.0.0.1:8080";
const uiPort = process.env.UI_SMOKE_UI_PORT || "3000";

async function forward(route: Route) {
  const source = new URL(route.request().url());
  const local = new URL(source);
  local.hostname = "127.0.0.1";
  try {
    return await route.fetch({
      url: local.href,
      headers: { ...route.request().headers(), host: source.host },
    });
  } catch {
    throw new Error("Local fixture forwarding failed");
  }
}

async function provision(subdomain: string, token: string, password: string) {
  const context = await request.newContext();
  const response = await context.post(`${apiOrigin}/api/v1/onboarding/stores`, {
    headers: { Host: "example.test", Authorization: `Bearer ${token}` },
    data: { subdomain, store_name: "UI Smoke Store", email: `owner@${subdomain}.test`, password },
  });
  expect(response.status(), await response.text()).toBe(201);
  await context.dispose();
}

async function write(page: Page, path: string, method: string, data: unknown) {
  return page.evaluate(
    async ({ path, method, data, key }) => {
      const response = await fetch(path, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-commerce-csrf": "1",
          "Idempotency-Key": key,
        },
        body: JSON.stringify(data),
      });
      return { status: response.status, data: await response.json() };
    },
    { path, method, data, key: randomUUID() },
  );
}

async function read(page: Page, path: string) {
  return page.evaluate(async (path) => {
    const response = await fetch(path);
    return { status: response.status, data: await response.json() };
  }, path);
}

test("tenant catalog, guest checkout, and cross-store denial", async ({ browser }, info) => {
  const token = process.env.UI_SMOKE_PLATFORM_TOKEN;
  if (!token && (!process.env.UI_SMOKE_SHOP || !process.env.UI_SMOKE_OTHER))
    throw new Error("UI_SMOKE_PLATFORM_TOKEN is required for isolated store provisioning");
  const suffix = process.env.UI_SMOKE_SHOP?.slice(2) || Math.random().toString(36).slice(2, 10);
  const shop = process.env.UI_SMOKE_SHOP || `ui${suffix}`;
  const other = process.env.UI_SMOKE_OTHER || `other${suffix}`;
  if (process.env.UI_SMOKE_SHOP && !process.env.UI_SMOKE_PASSWORD)
    throw new Error("UI_SMOKE_PASSWORD is required when reusing smoke tenants");
  const password = process.env.UI_SMOKE_PASSWORD || `Smoke-${randomUUID()}!`;
  if (!process.env.UI_SMOKE_SHOP) await provision(shop, token!, password);
  if (!process.env.UI_SMOKE_OTHER) await provision(other, token!, password);
  const origin = `http://${shop}.example.test:${uiPort}`;
  const owner = await browser.newContext();
  const admin = await owner.newPage();
  await admin.goto(`${origin}/account`);
  await admin.getByRole("textbox", { name: "Email" }).fill(`owner@${shop}.test`);
  await admin.getByLabel("Mật khẩu").fill(password);
  await admin.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(admin.getByText(`owner@${shop}.test`)).toBeVisible();

  const slug = `ao-the-thao-${Math.random().toString(36).slice(2, 10)}`;
  const product = await write(admin, "/api/v1/admin/catalog/products", "POST", {
    name: "Áo thể thao Smoke",
    slug,
    description: "Sản phẩm kiểm thử",
    category_ids: [],
    media: [],
    variants: [
      { sku: `SMOKE-${slug}`, option_values: { size: "M" }, weight_grams: 300, dimensions: {} },
    ],
  });
  expect(product.status, JSON.stringify(product.data)).toBe(201);
  const productID = product.data.product_id as string;
  const variantID = product.data.variants[0].variant_id as string;
  const price = await write(admin, "/api/v1/admin/pricing/price-lists", "POST", {
    name: "Smoke price",
    channel: "storefront",
    currency: "VND",
    priority: 1,
    prices: [{ variant_id: variantID, amount_minor: 125000 }],
  });
  expect(price.status, JSON.stringify(price.data)).toBe(201);
  const stock = await write(
    admin,
    `/api/v1/admin/inventory/stock-items/${variantID}/adjustments`,
    "POST",
    { quantity_delta: 5, reason: "Smoke fixture", expected_version: 0 },
  );
  expect(stock.status, JSON.stringify(stock.data)).toBe(200);
  const publish = await write(
    admin,
    `/api/v1/admin/catalog/products/${productID}/publish`,
    "POST",
    { expected_version: product.data.version },
  );
  expect(publish.status, JSON.stringify(publish.data)).toBe(200);
  const paymentCurrent = await read(admin, "/api/v1/admin/payment-providers/vietqr");
  const payment = await write(admin, "/api/v1/admin/payment-providers/vietqr", "PUT", {
    expected_version: paymentCurrent.status === 200 ? paymentCurrent.data.version : 0,
    enabled: true,
    bank_bin: "970436",
    account_number: "123456789",
    account_name: "UI SMOKE",
  });
  expect(payment.status, JSON.stringify(payment.data)).toBe(200);
  const shippingCurrent = await read(admin, "/api/v1/admin/shipping/rule");
  const shipping = await write(admin, "/api/v1/admin/shipping/rule", "PUT", {
    expected_version: shippingCurrent.status === 200 ? shippingCurrent.data.version : 0,
    mode: "free",
    flat_amount_minor: 0,
  });
  expect(shipping.status, JSON.stringify(shipping.data)).toBe(200);

  const shopper = await browser.newContext({ viewport: { width: 375, height: 900 } });
  const page = await shopper.newPage();
  await page.goto(`${origin}/products`);
  await expect(page.locator(`a[href="/products/${slug}"]`)).toBeVisible();
  await page.locator(`a[href="/products/${slug}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/products/${slug}$`));
  await expect(page.getByRole("heading", { name: "Áo thể thao Smoke", level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("product-mobile.png"), fullPage: true });
  await page.getByRole("button", { name: "Thêm vào giỏ hàng" }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole("link", { name: "Tiếp tục thanh toán" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("cart-mobile.png"), fullPage: true });
  await page.getByRole("link", { name: "Tiếp tục thanh toán" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByLabel("Email liên hệ").fill("guest@smoke.test");
  await page.getByLabel("Tên người nhận").fill("Smoke Guest");
  await page.getByLabel("Số điện thoại").fill("0901234567");
  await page.getByRole("button", { name: "Nhập thủ công", exact: true }).click();
  await page.getByLabel("Số nhà, tên đường", { exact: true }).fill("123 Main Street");
  await page.getByLabel("Phường / Xã").fill("Ward 1");
  await page.getByText("Thông tin bổ sung (không bắt buộc)", { exact: true }).click();
  await page.getByLabel("Quận / Huyện cũ (nếu cần)", { exact: true }).fill("District 1");
  await page.getByLabel("Tỉnh / Thành phố").fill("Ho Chi Minh");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("checkout-mobile.png"), fullPage: true });
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await expect(page).toHaveURL(/\/orders\/[a-f0-9-]+$/);
  await expect(page.getByText("125.000").first()).toBeVisible();
  const orderPath = new URL(page.url()).pathname;
  const ownedOrder = await read(page, `/api/v1${orderPath}`);
  expect(ownedOrder.status).toBe(200);
  await page.getByRole("button", { name: "Lấy hướng dẫn thanh toán" }).click();
  await expect(page.getByRole("img", { name: "Mã QR chuyển khoản cho đơn hàng" })).toBeVisible();
  const reference = await page.locator("p", { hasText: "Nội dung:" }).locator("strong").innerText();
  expect(await page.evaluate(() => document.cookie)).not.toContain("commerce-");
  const otherPage = await shopper.newPage();
  await otherPage.goto(`http://${other}.example.test:${uiPort}${orderPath}`);
  await expect(otherPage.locator('[role="alert"] strong')).toBeVisible();
  expect([401, 404]).toContain((await read(otherPage, `/api/v1${orderPath}`)).status);

  await admin.goto(`${origin}/admin/payments`);
  await admin.getByLabel("Mã thanh toán", { exact: true }).fill(ownedOrder.data.payment.payment_id);
  await admin.getByLabel("Mã chuyển khoản", { exact: true }).fill(reference);
  await admin.getByLabel("Số tiền nhận (VND)", { exact: true }).fill("125000");
  await admin
    .getByLabel("Thời điểm nhận")
    .fill(
      new Date(Date.now() - 60_000)
        .toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" })
        .slice(0, 16)
        .replace(" ", "T"),
    );
  admin.on("dialog", (dialog) => dialog.accept());
  await admin.getByRole("button", { name: "Xác nhận thanh toán", exact: true }).click();
  await expect(admin.getByText("Đã lưu thay đổi.")).toBeVisible();
  await admin.goto(`${origin}/admin${orderPath}`);
  await expect(admin.getByRole("button", { name: "Tạo vận đơn" })).toBeVisible();
  await admin.getByLabel("Đơn vị vận chuyển").fill("Smoke Carrier");
  await admin.getByLabel("Mã vận đơn").fill(`TRACK-${slug}`);
  await admin.getByRole("button", { name: "Tạo vận đơn" }).click();
  await admin.getByRole("button", { name: "Đã gửi hàng", exact: true }).click();
  await admin.getByRole("button", { name: "Hoàn tất giao hàng", exact: true }).click();
  await expect(admin).toHaveURL(`${origin}/admin/orders`);
  await page.reload();
  await expect(page.getByText("Hoàn tất", { exact: true }).first()).toBeVisible();
  await owner.close();
  await shopper.close();

  const customer = await browser.newContext();
  const account = await customer.newPage();
  const customerEmail = `customer-${slug}@smoke.test`;
  await account.goto(`${origin}/account`);
  await account.getByRole("button", { name: "Tạo tài khoản mới" }).click();
  await account.getByRole("textbox", { name: "Email" }).fill(customerEmail);
  await account.getByLabel("Mật khẩu").fill(password);
  await account.getByRole("button", { name: "Đăng ký", exact: true }).click();
  await expect(account.getByText(customerEmail)).toBeVisible();
  await account.goto(`${origin}/admin`);
  await expect(account.getByRole("alert")).toBeVisible();
  await account.goto(`${origin}/account/profile`);
  await account.getByLabel("Họ và tên").fill("Smoke Customer");
  await account.getByRole("textbox", { name: "Email", exact: true }).fill(customerEmail);
  await account.getByLabel("Điện thoại", { exact: true }).fill("0901234567");
  await account.getByRole("button", { name: "Lưu thông tin" }).click();
  await expect(account.getByText("Đã lưu thay đổi.")).toBeVisible();
  await account.goto(`${origin}/account/addresses`);
  await account.getByRole("button", { name: "Thêm địa chỉ", exact: true }).click();
  await account.getByLabel("Tên địa chỉ").fill("Smoke Home");
  await account.getByLabel("Tên người nhận").fill("Smoke Customer");
  await account.getByLabel("Số điện thoại").fill("0901234567");
  await account.getByRole("button", { name: "Nhập thủ công", exact: true }).click();
  await account.getByLabel("Số nhà, tên đường", { exact: true }).fill("456 Main Street");
  await account.getByLabel("Phường / Xã").fill("Ward 1");
  await account.getByText("Thông tin bổ sung (không bắt buộc)", { exact: true }).click();
  await account.getByLabel("Quận / Huyện cũ (nếu cần)", { exact: true }).fill("District 1");
  await account.getByLabel("Tỉnh / Thành phố").fill("Ho Chi Minh");
  await account.getByRole("button", { name: "Lưu địa chỉ" }).click();
  await expect(account.getByRole("heading", { name: "Smoke Home" })).toBeVisible();
  await account.goto(`${origin}/products/${slug}`);
  await account.getByRole("button", { name: "Thêm vào giỏ hàng" }).click();
  await expect(account).toHaveURL(/\/cart$/);
  await account.getByRole("link", { name: "Tiếp tục thanh toán" }).click();
  await account
    .getByLabel("Địa chỉ đã lưu")
    .selectOption({ label: "Smoke Home · 456 Main Street" });
  const registeredAttempts: Array<{
    key: string | undefined;
    body: string | null;
    orderID: string;
  }> = [];
  await account.route("**/api/v1/checkout", async (route) => {
    const response = await forward(route);
    const data = await response.json();
    registeredAttempts.push({
      key: route.request().headers()["idempotency-key"],
      body: route.request().postData(),
      orderID: data.order?.order_id,
    });
    if (registeredAttempts.length === 1) await route.abort("failed");
    else await route.fulfill({ response });
  });
  await account.getByRole("button", { name: "Đặt hàng" }).click();
  await expect(account.getByRole("button", { name: "Thử lại thao tác đã gửi" })).toBeVisible();
  expect((await read(account, "/api/v1/cart")).status).toBe(404);
  await account.evaluate(() => window.dispatchEvent(new Event("visibilitychange")));
  await account.getByRole("button", { name: "Thử lại thao tác đã gửi" }).click();
  await expect(account).toHaveURL(/\/orders\/[a-f0-9-]+$/);
  expect(registeredAttempts).toHaveLength(2);
  expect(registeredAttempts[1]).toEqual(registeredAttempts[0]);
  await expect(account.getByText("456 Main Street", { exact: false })).toBeVisible();
  account.on("dialog", (dialog) => dialog.accept());
  await account.getByLabel("Lý do", { exact: true }).fill("Smoke cancellation");
  await account.getByRole("button", { name: "Hủy đơn hàng", exact: true }).click();
  await expect(account.getByText("Đã hủy", { exact: true }).first()).toBeVisible();
  await account.goto(`${origin}/account`);
  await account.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(account.getByRole("button", { name: "Đăng nhập", exact: true })).toBeVisible();
  await account.goto(`${origin}/account/profile`);
  await expect(account.getByRole("link", { name: "Đăng nhập để quản lý thông tin" })).toBeVisible();
  await expect(account.locator('input[value="Smoke Customer"]')).toHaveCount(0);
  await customer.close();
});

test("fresh-store authoring and ambiguous mutation recovery", async ({ browser }) => {
  const token = process.env.UI_SMOKE_PLATFORM_TOKEN;
  if (!token) throw new Error("UI_SMOKE_PLATFORM_TOKEN is required for fresh-store setup");
  const suffix = Math.random().toString(36).slice(2, 10);
  const shop = `new${suffix}`;
  const password = `Smoke-${randomUUID()}!`;
  await provision(shop, token, password);
  const origin = `http://${shop}.example.test:${uiPort}`;
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${origin}/account`);
  await page.getByLabel("Email", { exact: true }).fill(`owner@${shop}.test`);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByText(`owner@${shop}.test`)).toBeVisible();

  await page.goto(`${origin}/admin/payments`);
  const qrForm = page
    .locator("form")
    .filter({ has: page.getByLabel("Số tài khoản", { exact: true }) });
  await page.getByLabel("Bật VietQR").check();
  await page.getByLabel("Mã ngân hàng (BIN)").fill("970436");
  await page.getByLabel("Số tài khoản", { exact: true }).fill("123456789");
  await page.getByLabel("Tên tài khoản (không dấu)").fill("UI SMOKE");
  await qrForm.getByRole("button", { name: "Lưu cấu hình" }).click();
  await expect(qrForm.getByText("Đã lưu thay đổi.")).toBeVisible();
  await page.getByLabel("Số tài khoản", { exact: true }).fill("987654321");
  await page.getByLabel("Tên tài khoản (không dấu)").fill("DIRTY INPUT");
  expect(
    (
      await write(page, "/api/v1/admin/payment-providers/vietqr", "PUT", {
        expected_version: 1,
        enabled: true,
        bank_bin: "970436",
        account_number: "123456789",
        account_name: "CONCURRENT UPDATE",
      })
    ).status,
  ).toBe(200);
  const qrConflict = page.waitForResponse(
    (response) => response.url().endsWith("/payment-providers/vietqr") && response.status() === 409,
  );
  await qrForm.getByRole("button", { name: "Lưu cấu hình" }).click();
  await qrConflict;
  await expect(page.getByLabel("Tên tài khoản (không dấu)")).toHaveValue("CONCURRENT UPDATE");
  await expect(page.getByLabel("Số tài khoản", { exact: true })).toHaveValue("");
  const momoForm = page.locator("form").filter({ has: page.getByLabel("Secret key mới") });
  await page.getByLabel("Mã đối tác", { exact: true }).fill("smoke-partner");
  await page.getByLabel("Access key mới").fill("smoke-access-key");
  await page.getByLabel("Secret key mới").fill("smoke-secret-key");
  await momoForm.getByRole("button", { name: "Lưu cấu hình" }).click();
  await expect(momoForm.getByText("Đã lưu thay đổi.")).toBeVisible();
  await page.goto(`${origin}/admin/shipping`);
  await page.getByLabel("Hình thức").selectOption("free");
  await page.getByRole("button", { name: "Lưu quy tắc" }).click();
  await expect(page.getByText("Đã lưu thay đổi.")).toBeVisible();

  await page.goto(`${origin}/admin/products`);
  await page.getByRole("button", { name: "Thêm danh mục" }).click();
  await page.getByLabel("Tên", { exact: true }).fill("Smoke category");
  await page.getByLabel("Đường dẫn", { exact: true }).fill(`smoke-${suffix}`);
  await page.getByRole("button", { name: "Lưu danh mục", exact: true }).click();
  await page.getByLabel("Tên danh mục", { exact: true }).fill("Updated Smoke category");
  await page.getByRole("button", { name: "Lưu danh mục", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Updated Smoke category" })).toBeVisible();
  await page.getByRole("link", { name: "Thêm sản phẩm", exact: true }).click();
  const slug = `authoring-${suffix}`;
  await page.getByLabel("Tên sản phẩm").fill("Smoke authoring shirt");
  await page.getByLabel("Đường dẫn", { exact: true }).fill(slug);
  await page.getByLabel("SKU", { exact: true }).fill(`SKU-M-${suffix}`);
  await page.getByRole("button", { name: "Thêm thuộc tính", exact: true }).click();
  await page.getByLabel("Tên thuộc tính").fill("size");
  await page.getByLabel("Giá trị thuộc tính").fill("M");
  await page.getByRole("button", { name: "Thêm biến thể", exact: true }).click();
  await page.getByLabel("SKU", { exact: true }).nth(1).fill(`SKU-L-${suffix}`);
  await page.getByRole("button", { name: "Thêm hình ảnh", exact: true }).click();
  await page.getByLabel("Mã đối tượng hình ảnh").fill("catalog/smoke.jpg");
  await page.getByLabel("Mô tả hình ảnh").fill("Smoke shirt");
  await page.getByLabel("Updated Smoke category", { exact: true }).check();
  const createResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/admin/catalog/products") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  const created = await createResponse;
  expect(created.status()).toBe(201);
  const product = await created.json();
  await page.goto(`${origin}/admin/products/${product.product_id}`);
  await page.getByLabel("SKU", { exact: true }).nth(1).fill(`SKU-L-EDIT-${suffix}`);
  const replaceResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/v1/admin/catalog/products/${product.product_id}`) &&
      response.request().method() === "PUT",
  );
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  const replaced = await replaceResponse;
  expect(replaced.status()).toBe(200);
  const edited = await replaced.json();
  for (const original of product.variants) {
    const preserved = edited.variants.find(
      (variant: { variant_id: string }) => variant.variant_id === original.variant_id,
    );
    expect(preserved.option_values).toEqual(original.option_values);
  }
  expect(
    edited.variants.find(
      (variant: { variant_id: string }) => variant.variant_id === product.variants[1].variant_id,
    ).sku,
  ).toBe(`SKU-L-EDIT-${suffix}`.toUpperCase());
  expect(edited.media[0].object_key).toBe("catalog/smoke.jpg");

  await page.goto(`${origin}/admin/prices`);
  await page.getByRole("button", { name: "Thêm bảng giá", exact: true }).click();
  await page.getByLabel("Tên bảng giá").fill("Authored price");
  await page
    .getByLabel("Giá theo biến thể")
    .fill(
      edited.variants
        .map((variant: { variant_id: string }) => `${variant.variant_id}, 125000`)
        .join("\n"),
    );
  await page.getByLabel("Bắt đầu", { exact: true }).fill("2026-10-01T19:00");
  const priceResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/admin/pricing/price-lists") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Lưu bảng giá", exact: true }).click();
  const priced = await priceResponse;
  expect(priced.status()).toBe(201);
  const price = await priced.json();
  expect(new Date(price.valid_from).toISOString()).toBe("2026-10-01T12:00:00.000Z");
  await page.getByRole("button", { name: "Chỉnh sửa", exact: true }).click();
  await expect(page.getByLabel("Bắt đầu", { exact: true })).toHaveValue("2026-10-01T19:00");
  const priceUpdate = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/v1/admin/pricing/price-lists/${price.price_list_id}`) &&
      response.request().method() === "PUT",
  );
  await page.getByRole("button", { name: "Lưu bảng giá", exact: true }).click();
  expect((await (await priceUpdate).json()).valid_from).toBe(price.valid_from);
  const alternate = await write(page, "/api/v1/admin/pricing/price-lists", "POST", {
    name: "Alternate price",
    channel: "storefront",
    currency: "VND",
    priority: -1,
    prices: edited.variants.map((variant: { variant_id: string }) => ({
      variant_id: variant.variant_id,
      amount_minor: 125000,
    })),
  });
  expect(alternate.status).toBe(201);
  expect(
    (
      await write(
        page,
        `/api/v1/admin/pricing/price-lists/${alternate.data.price_list_id}`,
        "PUT",
        {
          name: "Alternate price",
          channel: "storefront",
          currency: "VND",
          priority: -1,
          expected_version: 1,
          prices: edited.variants.map((variant: { variant_id: string }) => ({
            variant_id: variant.variant_id,
            amount_minor: 125000,
          })),
        },
      )
    ).status,
  ).toBe(200);
  await page.reload();
  await page
    .locator(".panel")
    .filter({ has: page.getByRole("heading", { name: "Alternate price", exact: false }) })
    .getByRole("button", { name: "Chỉnh sửa", exact: true })
    .click();
  await page.getByLabel("Tên bảng giá").fill("Unsaved wrong values");
  await page
    .locator(".panel")
    .filter({ has: page.getByRole("heading", { name: "Authored price", exact: false }) })
    .getByRole("button", { name: "Chỉnh sửa", exact: true })
    .click();
  await expect(page.getByLabel("Tên bảng giá")).toHaveValue("Authored price");
  await page.getByLabel("Tên bảng giá").fill("Another unsaved value");
  await page.getByRole("button", { name: "Thêm bảng giá", exact: true }).click();
  await expect(page.getByLabel("Tên bảng giá")).toHaveValue("");

  const variantID = edited.variants[0].variant_id as string;
  await page.goto(`${origin}/admin/inventory`);
  await page.getByLabel("Biến thể sản phẩm").selectOption(variantID);
  await expect(page.getByText("Trong kho: 0 · Có thể bán: 0", { exact: true })).toBeVisible();
  await page.getByLabel("Thay đổi số lượng (+/-)").fill("5");
  await page.getByLabel("Lý do", { exact: true }).fill("Initial stock");
  const adjustments: Array<{ key: string | undefined; body: string | null }> = [];
  await page.route(
    `**/api/v1/admin/inventory/stock-items/${variantID}/adjustments`,
    async (route) => {
      const response = await forward(route);
      adjustments.push({
        key: route.request().headers()["idempotency-key"],
        body: route.request().postData(),
      });
      if (adjustments.length === 1) await route.abort("failed");
      else await route.fulfill({ response });
    },
  );
  await page.getByRole("button", { name: "Xác nhận điều chỉnh", exact: true }).click();
  await expect(page.getByRole("button", { name: "Thử lại thao tác đã gửi" })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event("visibilitychange")));
  await expect(page.getByText("Trong kho: 5 · Có thể bán: 5", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Thử lại thao tác đã gửi" }).click();
  await expect(page.getByText("Đã lưu thay đổi.")).toBeVisible();
  expect(adjustments).toHaveLength(2);
  expect(adjustments[1]).toEqual(adjustments[0]);
  expect((await read(page, `/api/v1/admin/inventory/stock-items/${variantID}`)).data.on_hand).toBe(
    5,
  );
  await page.unroute(`**/api/v1/admin/inventory/stock-items/${variantID}/adjustments`);
  expect(
    (
      await write(page, `/api/v1/admin/inventory/stock-items/${variantID}/adjustments`, "POST", {
        quantity_delta: 1,
        reason: "Concurrent worker",
        expected_version: 1,
      })
    ).status,
  ).toBe(200);
  await page.getByLabel("Thay đổi số lượng (+/-)").fill("2");
  const conflict = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/stock-items/${variantID}/adjustments`) && response.status() === 409,
  );
  await page.getByRole("button", { name: "Xác nhận điều chỉnh", exact: true }).click();
  await conflict;
  await expect(page.getByText("Trong kho: 6 · Có thể bán: 6", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận điều chỉnh", exact: true }).click();
  await expect(page.getByText("Trong kho: 8 · Có thể bán: 8", { exact: true })).toBeVisible();
  await page.goto(`${origin}/admin/products/${product.product_id}`);
  await page.getByRole("button", { name: "Xuất bản", exact: true }).click();
  await expect(page.getByText("Đang bán", { exact: true })).toBeVisible();
  await context.close();

  const guestContext = await browser.newContext();
  const guest = await guestContext.newPage();
  await guest.goto(`${origin}/products/${slug}`);
  await guest.getByRole("button", { name: "Thêm vào giỏ hàng" }).click();
  await expect(guest).toHaveURL(/\/cart$/);
  await guest.getByRole("link", { name: "Tiếp tục thanh toán" }).click();
  await guest.getByLabel("Email liên hệ").fill("guest@smoke.test");
  await guest.getByLabel("Tên người nhận").fill("Smoke Guest");
  await guest.getByLabel("Số điện thoại").fill("0901234567");
  await guest.getByRole("button", { name: "Nhập thủ công", exact: true }).click();
  await guest.getByLabel("Số nhà, tên đường", { exact: true }).fill("123 Main Street");
  await guest.getByLabel("Phường / Xã").fill("Ward 1");
  await guest.getByText("Thông tin bổ sung (không bắt buộc)", { exact: true }).click();
  await guest.getByLabel("Quận / Huyện cũ (nếu cần)", { exact: true }).fill("District 1");
  await guest.getByLabel("Tỉnh / Thành phố").fill("Ho Chi Minh");
  const checkouts: Array<{ key: string | undefined; body: string | null; orderID: string }> = [];
  await guest.route("**/api/v1/checkout", async (route) => {
    const response = await forward(route);
    const data = await response.json();
    checkouts.push({
      key: route.request().headers()["idempotency-key"],
      body: route.request().postData(),
      orderID: data.order?.order_id,
    });
    if (checkouts.length === 1) await route.abort("failed");
    else await route.fulfill({ response });
  });
  await guest.getByRole("button", { name: "Đặt hàng" }).click();
  await expect(guest.getByRole("button", { name: "Thử lại thao tác đã gửi" })).toBeVisible();
  expect((await read(guest, "/api/v1/cart")).status).toBe(404);
  await guest.clock.install();
  await guest.route("**/api/v1/storefront", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        code: "dependency_unavailable",
        message: "Appearance temporarily unavailable",
      }),
    }),
  );
  await guest.clock.fastForward(31000);
  await guest.evaluate(() => window.dispatchEvent(new Event("visibilitychange")));
  await expect(
    guest.locator(".notice[role=alert]").filter({ hasText: "Appearance temporarily unavailable" }),
  ).toBeVisible();
  await expect(guest.getByRole("button", { name: "Thử lại thao tác đã gửi" })).toBeVisible();
  await guest.unroute("**/api/v1/storefront");
  await guest.evaluate(() => window.dispatchEvent(new Event("visibilitychange")));
  await expect(
    guest.locator(".notice[role=alert]").filter({ hasText: "Appearance temporarily unavailable" }),
  ).toHaveCount(0);
  await guest.getByRole("button", { name: "Thử lại thao tác đã gửi" }).click();
  await expect(guest.getByRole("heading", { name: "Đơn hàng đã được ghi nhận" })).toBeVisible();
  expect(checkouts).toHaveLength(2);
  expect(checkouts[1]).toEqual(checkouts[0]);
  expect([401, 404]).toContain(
    (await read(guest, `/api/v1/orders/${checkouts[0].orderID}`)).status,
  );
  await guestContext.close();
});
