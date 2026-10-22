import { expect, test, type Page } from "@playwright/test";

const origin = process.env.UI_STOREFRONT_ORIGIN || "http://football.example.test:3000";
const amount = { amount_minor: 990000, currency: "VND" };
const address = {
  address_id: "address-fixture",
  label: "Nhà riêng",
  recipient_name: "Khách hàng Test",
  phone: "0901234567",
  line1: "12 Nguyễn Huệ",
  line2: "",
  ward: "Phường Sài Gòn",
  district: "",
  province: "Thành phố Hồ Chí Minh",
  country_code: "VN",
  postal_code: "",
  version: 2,
};
const product = {
  product_id: "product-fixture",
  slug: "arsenal-home",
  name: "Arsenal Home Jersey",
  description: "Áo đấu dành cho người hâm mộ Arsenal.",
  categories: [
    { category_id: "brand", name: "Brand Adidas", slug: "adidas" },
    { category_id: "club", name: "Arsenal", slug: "arsenal" },
  ],
  media: [1, 2].map((position) => ({
    object_key: `fixture-${position}.png`,
    position,
    alt_text: `Arsenal góc ${position}`,
  })),
  variants: [
    {
      variant_id: "variant-m",
      sku: "ARS-M",
      option_values: { size: "M" },
      price: amount,
      in_stock: true,
      weight_grams: 250,
    },
    {
      variant_id: "variant-l",
      sku: "ARS-L",
      option_values: { size: "L" },
      price: { ...amount, amount_minor: 1090000 },
      in_stock: false,
      weight_grams: 260,
    },
  ],
};
function newOrder(
  state = "pending_payment",
  paymentState = "pending",
  expires = Date.now() + 600000,
  provider = "vietqr",
) {
  return {
    order_id: "order-fixture",
    order_number: "FF-2026-TEST",
    state,
    created_at: "2026-10-22T01:00:00Z",
    updated_at: "2026-10-22T01:00:00Z",
    reservation_expires_at: new Date(expires).toISOString(),
    payment: { payment_id: "payment-fixture", provider, state: paymentState },
    lines: [
      {
        variant_id: "variant-m",
        product_name: "Arsenal Home Jersey",
        quantity: 1,
        option_values: { size: "M" },
        unit_price: amount,
        line_total: amount,
      },
    ],
    subtotal: amount,
    shipping_total: { ...amount, amount_minor: 30000 },
    grand_total: { ...amount, amount_minor: 1020000 },
    delivery_address: address,
    shipment: null,
  };
}
type Write = {
  path: string;
  method: string;
  body: Record<string, unknown> | null;
  key: string | undefined;
};
async function setup(
  page: Page,
  options: {
    cart?: "missing" | "error";
    checkout?: "success" | "reject" | "uncertain";
    order?: ReturnType<typeof newOrder>;
    instructionExpiry?: number;
    kind?: "user" | "guest";
    grant?: boolean;
  } = {},
) {
  const writes: Write[] = [];
  let checkoutCount = 0;
  let consumed = false;
  const order = options.order || newOrder();
  await page.route("**/api/session**", (route) =>
    route.fulfill({
      json: {
        kind: options.kind || "user",
        session: "shopping-fixture",
        order_access_available: options.grant ?? true,
      },
    }),
  );
  await page.route("**/api/media?**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#edf3ef"/><path d="M180 140L120 220L190 265L210 230V460H390V230L410 265L480 220L420 140L350 110Q300 180 250 110Z" fill="#d12d39"/><text x="300" y="330" text-anchor="middle" fill="white" font-size="30">ARSENAL</text></svg>',
    }),
  );
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() !== "GET") {
      writes.push({
        path,
        method: request.method(),
        body: request.postData() ? request.postDataJSON() : null,
        key: request.headers()["idempotency-key"],
      });
      if (path === "/api/v1/checkout") {
        checkoutCount++;
        if (options.checkout === "reject" && checkoutCount === 1)
          return route.fulfill({
            status: 422,
            json: { code: "order_operation_unavailable", message: "Phương thức chưa khả dụng" },
          });
        consumed = true;
        if (options.checkout === "uncertain" && checkoutCount === 1)
          return route.fulfill({
            status: 503,
            json: { code: "dependency_unavailable", message: "Chưa nhận được kết quả" },
          });
        return route.fulfill({ json: { order } });
      }
      if (path.endsWith("/vietqr/instructions"))
        return route.fulfill({
          json: {
            order_id: order.order_id,
            payment_id: order.payment.payment_id,
            attempt_id: "attempt",
            expires_at: new Date(options.instructionExpiry ?? Date.now() + 300000).toISOString(),
            transfer_reference: "FFTEST123",
            amount: order.grand_total,
            qr_png_base64:
              "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
          },
        });
      if (path.endsWith("/momo/attempts"))
        return route.fulfill({
          json: {
            order_id: order.order_id,
            payment_id: order.payment.payment_id,
            attempt_id: "momo-attempt",
            state: "action_required",
            expires_at: new Date(options.instructionExpiry ?? Date.now() + 300000).toISOString(),
            pay_url: "https://payment.momo.vn/fixture",
          },
        });
      if (path.endsWith("/cancellations")) {
        order.state = "cancelled";
        return route.fulfill({ json: order });
      }
      if (path.includes("/cart/lines/")) return route.fulfill({ json: { version: 4 } });
      if (path === "/api/v1/cart")
        return route.fulfill({
          json: { version: 3, lines: [{ variant_id: "variant-m", quantity: 2 }] },
        });
      return route.fulfill({ json: {} });
    }
    if (path === "/api/v1/store")
      return route.fulfill({ status: 403, json: { code: "forbidden" } });
    if (path === "/api/v1/storefront")
      return route.fulfill({
        json: { preset: "sport", display_name: "Football Store", version: 1 },
      });
    if (path === "/api/v1/customer/profile")
      return route.fulfill({
        json: {
          full_name: "Khách hàng Test",
          email: "customer@fixture.test",
          phone: address.phone,
          version: 1,
        },
      });
    if (path === "/api/v1/customer/addresses")
      return route.fulfill({ json: { addresses: [address], next_cursor: null } });
    if (path.startsWith("/api/v1/orders/")) return route.fulfill({ json: order });
    if (path === "/api/v1/catalog/products/arsenal-home") return route.fulfill({ json: product });
    if (path === "/api/v1/catalog/products")
      return route.fulfill({ json: { products: [product], next_cursor: null } });
    if (path === "/api/v1/cart") {
      if (options.cart === "error")
        return route.fulfill({
          status: 503,
          json: { code: "dependency_unavailable", message: "Không kết nối được giỏ hàng" },
        });
      if (options.cart === "missing" || consumed)
        return route.fulfill({
          status: 404,
          json: { code: "cart_unavailable", message: "Cart resource is unavailable." },
        });
      return route.fulfill({
        json: {
          version: 3,
          checkout_ready: true,
          estimated_subtotal: amount,
          lines: [
            {
              variant_id: "variant-m",
              product_name: product.name,
              quantity: 1,
              option_values: { size: "M" },
              line_estimate: amount,
            },
          ],
        },
      });
    }
    return route.fulfill({ json: {} });
  });
  return writes;
}

test("gallery, stock selection and quantity preserve cart versions", async ({ page }) => {
  const writes = await setup(page);
  await page.goto(`${origin}/products/arsenal-home`);
  const gallery = page.getByRole("region", { name: "Hình ảnh sản phẩm" });
  await expect(gallery.getByRole("button", { name: "Xem ảnh 1" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await gallery.getByRole("button", { name: "Ảnh tiếp theo" }).click();
  await expect(gallery.locator(".product-gallery-main img")).toHaveAttribute(
    "alt",
    "Arsenal góc 2",
  );
  await page.getByRole("button", { name: "L · Hết hàng", exact: true }).click();
  await expect(page.getByRole("button", { name: "Thêm vào giỏ hàng" })).toBeDisabled();
  await expect(page.locator(".purchase-panel h2.price")).toContainText("1.090.000");
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByRole("button", { name: "Tăng số lượng" }).click();
  await expect(page.getByLabel("Số lượng", { exact: true })).toHaveValue("2");
  await page.getByRole("button", { name: "Thêm vào giỏ hàng" }).click();
  await expect
    .poll(() => writes.find((write) => write.method === "PUT"))
    .toMatchObject({
      path: "/api/v1/cart/lines/variant-m",
      body: { quantity: 4, expected_version: 3 },
    });
  await expect(page).toHaveURL(`${origin}/cart`);
});

test("checkout disables MoMo and submits VietQR with the saved address", async ({ page }) => {
  const writes = await setup(page);
  await page.goto(`${origin}/checkout`);
  await expect(page.locator(".saved-address-summary")).toContainText(address.line1);
  await expect(page.getByRole("radio", { name: "Ví MoMo" })).toBeDisabled();
  await expect(page.getByRole("radio", { name: "Chuyển khoản VietQR" })).toBeChecked();
  await expect(page.locator(".checkout-summary")).toContainText("Chuyển khoản VietQR");
  await page.getByRole("button", { name: "Đặt hàng", exact: true }).click();
  await expect(page).toHaveURL(`${origin}/orders/order-fixture`);
  expect(writes[0]).toMatchObject({
    path: "/api/v1/checkout",
    body: { cart_version: 3, address_id: address.address_id, payment_provider: "vietqr" },
  });
  expect(writes[0].key).toBeTruthy();
});

test("definite checkout rejection permits a fresh VietQR submission", async ({ page }) => {
  const writes = await setup(page, { checkout: "reject" });
  await page.goto(`${origin}/checkout`);
  await page.getByRole("button", { name: "Đặt hàng", exact: true }).click();
  await expect(page.locator(".checkout-form")).toContainText("Phương thức chưa khả dụng");
  await page.getByRole("button", { name: "Đặt hàng", exact: true }).click();
  await expect(page).toHaveURL(`${origin}/orders/order-fixture`);
  expect(writes).toHaveLength(2);
  expect(writes[1].body?.payment_provider).toBe("vietqr");
  expect(writes[1].key).not.toBe(writes[0].key);
});

test("uncertain checkout retries the identical request even after the cart disappears", async ({
  page,
}) => {
  const writes = await setup(page, { checkout: "uncertain" });
  await page.goto(`${origin}/checkout`);
  await page.getByRole("button", { name: "Đặt hàng", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Đang xác nhận đơn hàng" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Đặt hàng", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Thử lại thao tác đã gửi" }).click();
  await expect(page).toHaveURL(`${origin}/orders/order-fixture`);
  expect(writes).toHaveLength(2);
  expect(writes[1]).toEqual(writes[0]);
});

test("guest checkout preserves the recorded order when access has not arrived", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 375, height: 950 });
  const writes = await setup(page, { kind: "guest", grant: false });
  await page.goto(`${origin}/checkout`);
  await page.getByLabel("Email liên hệ", { exact: true }).fill("guest@fixture.test");
  await page.getByLabel("Tên người nhận", { exact: true }).fill(address.recipient_name);
  await page.getByLabel("Số điện thoại", { exact: true }).fill(address.phone);
  await page.getByRole("button", { name: "Nhập thủ công", exact: true }).click();
  await page.getByLabel("Tỉnh / Thành phố", { exact: true }).fill(address.province);
  await page.getByLabel("Phường / Xã / Đặc khu", { exact: true }).fill(address.ward);
  await page.getByLabel("Số nhà, tên đường", { exact: true }).fill(address.line1);
  await page.screenshot({ path: info.outputPath("guest-checkout-375.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Đặt hàng", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Đơn hàng đã được ghi nhận" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Đặt hàng", exact: true })).toHaveCount(0);
  expect(writes).toHaveLength(1);
  expect(writes[0].body).toMatchObject({
    cart_version: 3,
    contact: { email: "guest@fixture.test" },
    delivery_address: {
      recipient_name: address.recipient_name,
      line1: address.line1,
      country_code: "VN",
    },
  });
});

for (const cart of ["missing", "error"] as const)
  test(`checkout handles ${cart} cart without mutations`, async ({ page }) => {
    const writes = await setup(page, { cart });
    await page.goto(`${origin}/checkout`);
    await expect(page.getByRole("heading", { name: "Hoàn tất đơn hàng" })).toBeVisible();
    if (cart === "missing")
      await expect(page.getByRole("heading", { name: "Giỏ hàng chưa sẵn sàng" })).toBeVisible();
    else await expect(page.getByRole("button", { name: "Thử lại", exact: true })).toBeVisible();
    expect(writes).toHaveLength(0);
  });

test("QR instructions expire without declaring the server order expired", async ({ page }) => {
  await page.clock.install();
  await setup(page, { instructionExpiry: Date.now() + 4000 });
  await page.goto(`${origin}/orders/order-fixture`);
  await page.getByRole("button", { name: "Lấy hướng dẫn thanh toán" }).click();
  await expect(page.getByRole("img", { name: "Mã QR chuyển khoản cho đơn hàng" })).toBeVisible();
  await expect(page.locator(".vietqr-instructions")).toContainText("FFTEST123");
  await page.clock.fastForward(5000);
  await expect(page.locator(".vietqr-instructions")).toHaveCount(0);
  await expect(page.locator(".order-payment-card")).toContainText(
    "Hướng dẫn thanh toán đã hết hạn",
  );
  await expect(page.locator(".order-timeline [aria-current=step]")).toContainText("Chờ thanh toán");
});

test("reservation deadline hides payment controls and requests authoritative refresh", async ({
  page,
}) => {
  await page.clock.install();
  await setup(page, { order: newOrder("pending_payment", "pending", Date.now() + 4000) });
  await page.goto(`${origin}/orders/order-fixture`);
  await expect(page.locator(".payment-countdown")).toBeVisible();
  await page.clock.fastForward(5000);
  await expect(page.getByRole("button", { name: "Lấy hướng dẫn thanh toán" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Đang kiểm tra hạn giữ hàng" })).toBeVisible();
  await expect(page.locator(".order-timeline [aria-current=step]")).toContainText("Chờ thanh toán");
});

test("MoMo links disappear when the attempt expires", async ({ page }) => {
  await page.clock.install();
  await setup(page, {
    order: newOrder("pending_payment", "pending", Date.now() + 600000, "momo"),
    instructionExpiry: Date.now() + 4000,
  });
  await page.goto(`${origin}/orders/order-fixture`);
  await page.getByRole("button", { name: "Lấy hướng dẫn thanh toán" }).click();
  await expect(page.getByRole("link", { name: "Mở MoMo" })).toHaveAttribute(
    "href",
    "https://payment.momo.vn/fixture",
  );
  await page.clock.fastForward(5000);
  await expect(page.getByRole("link", { name: "Mở MoMo" })).toHaveCount(0);
});

for (const [state, payment, title] of [
  ["shipped", "succeeded", "Giao hàng"],
  ["refund_pending", "refund_pending", "Đang xử lý hoàn tiền"],
  ["cancelled", "refunded", "Đã hoàn tiền"],
  ["pending_payment", "reconciliation_required", "Giao dịch cần đối soát"],
])
  test(`order ${state}/${payment} shows accurate progress without payment actions`, async ({
    page,
  }) => {
    await setup(page, { order: newOrder(state, payment) });
    await page.goto(`${origin}/orders/order-fixture`);
    if (state === "shipped")
      await expect(page.locator(".order-timeline [aria-current=step]")).toContainText(title);
    else await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lấy hướng dẫn thanh toán" })).toHaveCount(0);
    await expect(page.locator(".order-items-card .total")).toContainText("1.020.000");
  });

test("cancellation requires confirmation and keeps its idempotency key", async ({ page }) => {
  const writes = await setup(page);
  await page.goto(`${origin}/orders/order-fixture`);
  await page.getByLabel("Lý do", { exact: true }).fill("Đổi kích cỡ");
  await page.getByRole("button", { name: "Hủy đơn hàng", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Quay lại" }).click();
  expect(writes).toHaveLength(0);
  await page.getByRole("button", { name: "Hủy đơn hàng", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Xác nhận", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Đơn hàng đã hủy" })).toBeVisible();
  expect(writes[0]).toMatchObject({
    path: "/api/v1/orders/order-fixture/cancellations",
    body: { reason: "Đổi kích cỡ" },
  });
  expect(writes[0].key).toBeTruthy();
});

test("shopping pages remain readable at mobile and desktop widths", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await setup(page);
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const path of ["/products/arsenal-home", "/checkout", "/orders/order-fixture"]) {
      await page.goto(`${origin}${path}`);
      await expect(
        page.locator(".product-detail-layout, .checkout-layout, .order-tracking-layout"),
      ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: info.outputPath(`${path.split("/")[1]}-${width}.png`),
        fullPage: true,
      });
      const overflow = await page.evaluate(() =>
        [...document.querySelectorAll("main *")]
          .filter((element) => element.getBoundingClientRect().right > innerWidth + 1)
          .map((element) => ({
            tag: element.tagName,
            className: element.className,
            right: element.getBoundingClientRect().right,
          })),
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        JSON.stringify({ path, width, overflow }),
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
