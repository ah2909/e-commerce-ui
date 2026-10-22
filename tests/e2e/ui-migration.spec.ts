import { expect, test, type Page } from "@playwright/test";

const origin = process.env.UI_MIGRATION_ORIGIN || "http://localhost:3011";
const appearance = {
  preset: "home",
  display_name: "Cửa hàng thử nghiệm",
  tagline: "Tiếng Việt",
  hero_title: "Sản phẩm của cửa hàng",
  hero_text: "Nội dung thử nghiệm",
  announcement: "",
  logo_url: "",
  hero_url: "",
  version: 1,
};
const address = {
  address_id: "address-fixture",
  label: "Nhà riêng",
  recipient_name: "Người thử nghiệm",
  phone: "0901234567",
  line1: "12 Nguyễn Huệ",
  line2: "",
  province: "Thành phố Hồ Chí Minh",
  ward: "Phường Sài Gòn",
  district: "",
  postal_code: "",
  country_code: "VN",
  version: 2,
};

async function fixtures(page: Page, kind = "user") {
  const writes: {
    path: string;
    method: string;
    body: Record<string, unknown>;
  }[] = [];
  let current = { ...appearance };
  await page.route("**/api/session**", (route) =>
    route.fulfill({ json: { kind, session: "ui-migration-fixture" } }),
  );
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() !== "GET") {
      const body = request.postDataJSON() as Record<string, unknown>;
      writes.push({ path, method: request.method(), body });
      if (path === "/api/v1/admin/storefront")
        current = { ...current, ...body, version: current.version + 1 };
      return route.fulfill(
        request.method() === "DELETE"
          ? { status: 204 }
          : { json: path === "/api/v1/admin/storefront" ? current : address },
      );
    }
    const responses: Record<string, unknown> = {
      "/api/v1/storefront": current,
      "/api/v1/admin/storefront": current,
      "/api/v1/store": { name: appearance.display_name, role: "owner" },
      "/api/v1/customer/addresses": { addresses: [address], next_cursor: null },
      "/api/v1/catalog/products": { products: [], next_cursor: null },
      "/api/v1/cart": {
        version: 1,
        status: "active",
        checkout_ready: true,
        estimated_subtotal: { amount_minor: 100000, currency: "VND" },
        lines: [
          {
            variant_id: "variant-fixture",
            product_name: "Sản phẩm thử nghiệm",
            quantity: 1,
            line_estimate: { amount_minor: 100000, currency: "VND" },
          },
        ],
      },
      "/api/v1/admin/catalog/products": { products: [], next_cursor: null },
      "/api/v1/admin/catalog/categories": { categories: [], next_cursor: null },
    };
    return route.fulfill({ json: responses[path] || {} });
  });
  return writes;
}

test("address search preserves Vietnamese names, native validation and dependent ward reset", async ({
  page,
}) => {
  const writes = await fixtures(page);
  await page.goto(`${origin}/account/addresses`);
  await page.getByRole("button", { name: "Thêm địa chỉ", exact: true }).click();
  const form = page.locator("form");
  await form.getByLabel("Tên người nhận").fill("Người thử nghiệm");
  await form.getByLabel("Số điện thoại").fill("0901234567");
  await form.getByLabel("Số nhà, tên đường").fill("12 Nguyễn Huệ");
  await form.getByRole("button", { name: "Lưu địa chỉ", exact: true }).click();
  await expect(page.locator('[data-slot="popover-content"][data-state="open"]')).toBeVisible();
  expect(writes).toHaveLength(0);
  const popover = page.locator('[data-slot="popover-content"][data-state="open"]');
  await popover.getByRole("combobox").fill("ho chi minh");
  await expect(popover.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(form.getByRole("combobox", { name: "Tỉnh / Thành phố", exact: true })).toContainText(
    "Hồ Chí Minh",
  );
  await form.getByRole("combobox", { name: "Phường / Xã / Đặc khu", exact: true }).click();
  await popover.getByRole("option").first().click();
  const values = await form.evaluate((element) =>
    Object.fromEntries(new FormData(element as HTMLFormElement)),
  );
  expect(values.province).toContain("Hồ Chí Minh");
  expect(values.ward).not.toBe("");
  await form.getByRole("combobox", { name: "Tỉnh / Thành phố", exact: true }).click();
  await popover.getByRole("combobox").fill("ha noi");
  await popover.getByRole("option").first().click();
  await expect(
    form.getByRole("combobox", { name: "Phường / Xã / Đặc khu", exact: true }),
  ).toContainText("Tìm phường");
  await form.getByRole("button", { name: "Nhập thủ công", exact: true }).click();
  await expect(form.getByLabel("Tỉnh / Thành phố", { exact: true })).toHaveValue(/Hà Nội/);
  await form.getByLabel("Phường / Xã / Đặc khu", { exact: true }).fill("Phường thử nghiệm");
  await form.getByRole("button", { name: "Thông tin bổ sung (không bắt buộc)" }).click();
  await form.getByLabel("Mã bưu chính").fill("100000");
  await form.getByRole("button", { name: "Thông tin bổ sung (không bắt buộc)" }).click();
  await form.getByRole("button", { name: "Lưu địa chỉ", exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].body).toMatchObject({
    province: "Thành phố Hà Nội",
    ward: "Phường thử nghiệm",
    postal_code: "100000",
    line1: "12 Nguyễn Huệ",
    district: "",
  });
});

test("confirmation cancellation blocks mutation and acceptance preserves version", async ({
  page,
}) => {
  const writes = await fixtures(page);
  await page.goto(`${origin}/account/addresses`);
  const archive = page.getByRole("button", { name: "Lưu trữ", exact: true });
  await archive.click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toContainText("Lưu trữ địa chỉ này?");
  await dialog.getByRole("button", { name: "Quay lại" }).click();
  expect(writes).toHaveLength(0);
  await expect(archive).toBeFocused();
  await archive.click();
  await dialog.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0]).toMatchObject({
    method: "DELETE",
    path: "/api/v1/customer/addresses/address-fixture",
    body: { expected_version: 2 },
  });
});

test("appearance preview keeps draft theme in its portal and restores keyboard focus", async ({
  page,
}, info) => {
  const writes = await fixtures(page);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${origin}/admin/appearance`);
  for (const [name, preset] of [
    ["Thời trang", "fashion"],
    ["Thể thao", "sport"],
    ["Nhà & đời sống", "home"],
  ]) {
    await page.getByRole("radio", { name, exact: true }).click();
    await page.getByRole("button", { name: "Xem toàn màn hình" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveAttribute("data-theme", preset);
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Xem toàn màn hình" })).toBeFocused();
  }
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      return document.fonts.ready;
    });
    if (width <= 1100) {
      const preset = page.getByRole("radio", { name: "Nhà & đời sống", exact: true });
      const swatch = await preset.locator(".preset-swatch").boundingBox();
      const label = await preset.locator("strong").boundingBox();
      expect(label!.x).toBeGreaterThan(swatch!.x + swatch!.width);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`appearance-${width}.png`),
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Lưu giao diện", exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].body).toMatchObject({ preset: "home", expected_version: 1 });
  expect(errors).toEqual([]);
});

test("checkout radio group submits the selected payment provider and respects disabled fieldsets", async ({
  page,
}) => {
  await fixtures(page, "guest");
  await page.goto(`${origin}/checkout`);
  const form = page.locator("form");
  const providers = form.getByRole("radiogroup", { name: "Phương thức thanh toán" });
  await expect(providers.getByRole("radio", { name: "Chuyển khoản VietQR" })).toBeChecked();
  await expect(providers.getByRole("radio", { name: "Ví MoMo" })).toBeDisabled();
  const payment = await form.evaluate((element) =>
    new FormData(element as HTMLFormElement).get("payment_provider"),
  );
  expect(payment).toBe("vietqr");
  await form.locator("fieldset").evaluate((element) => {
    (element as HTMLFieldSetElement).disabled = true;
  });
  await expect(providers.getByRole("radio", { name: "Chuyển khoản VietQR" })).toBeDisabled();
  const disabledPayment = await form.evaluate((element) =>
    new FormData(element as HTMLFormElement).get("payment_provider"),
  );
  expect(disabledPayment).toBeNull();
});
