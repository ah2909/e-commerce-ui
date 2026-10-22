import { expect, request, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
const port = process.env.UI_SMOKE_UI_PORT || "3000";
const apiOrigin = process.env.UI_SMOKE_API_ORIGIN || "http://127.0.0.1:8080";
async function json(page: Page, path: string, method = "GET", body?: unknown) {
  return page.evaluate(
    async ({ path, method, body }) => {
      const r = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json", "X-Commerce-CSRF": "1" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: r.status, data: await r.json() };
    },
    { path, method, body },
  );
}
test("appearance editor, themes, keyboard preview and cross-store isolation", async ({
  browser,
}, info) => {
  test.setTimeout(180_000);
  const token = process.env.UI_SMOKE_PLATFORM_TOKEN;
  if (!token) throw new Error("UI_SMOKE_PLATFORM_TOKEN required for disposable tenants");
  const suffix = randomUUID().slice(0, 8);
  const shop = `theme${suffix}`;
  const other = `other${suffix}`;
  const password = `Test-${randomUUID()}!`;
  const setup = await request.newContext();
  for (const subdomain of [shop, other]) {
    const r = await setup.post(`${apiOrigin}/api/v1/onboarding/stores`, {
      headers: { Host: "example.test", Authorization: `Bearer ${token}` },
      data: {
        subdomain,
        store_name: `Store ${subdomain}`,
        email: `owner@${subdomain}.test`,
        password,
      },
    });
    expect(r.status(), await r.text()).toBe(201);
  }
  await setup.dispose();
  const context = await browser.newContext();
  const page = await context.newPage();
  const origin = `http://${shop}.example.test:${port}`;
  await page.goto(`${origin}/account`);
  await page.getByRole("textbox", { name: "Email" }).fill(`owner@${shop}.test`);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByText(`owner@${shop}.test`)).toBeVisible();
  await page.goto(`${origin}/admin/appearance`);
  await page.getByLabel("Tên hiển thị", { exact: true }).fill("Mộc · Cửa hàng nhỏ");
  await page.getByLabel("Lời giới thiệu ngắn").fill("Đồ dùng cho những ngày bình yên");
  await page.getByLabel("Thông báo đầu trang (không bắt buộc)").fill("Chào mừng bạn đến với Mộc");
  await page.getByRole("radio", { name: "Thời trang", exact: true }).click();
  await page.getByRole("button", { name: "Xem toàn màn hình" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() =>
      document.querySelector('[role="dialog"]')?.contains(document.activeElement),
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Xem toàn màn hình" })).toBeFocused();
  await page.getByRole("button", { name: "Lưu giao diện", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã lưu giao diện");
  await page.reload();
  await expect(page.getByLabel("Tên hiển thị", { exact: true })).toHaveValue("Mộc · Cửa hàng nhỏ");
  await page.clock.install();
  await page.getByLabel("Tên hiển thị", { exact: true }).fill("Bản nháp được giữ lại");
  for (const path of ["/api/v1/storefront", "/api/v1/admin/storefront"]) {
    await page.route(`**${path}`, (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          code: "dependency_unavailable",
          message: "Tạm thời không thể tải giao diện",
        }),
      }),
    );
  }
  await page.clock.fastForward(31000);
  await page.evaluate(() => window.dispatchEvent(new Event("visibilitychange")));
  await expect(page.locator(".notice[role=alert]").first()).toContainText(
    "Tạm thời không thể tải giao diện",
  );
  await expect(page.getByLabel("Tên hiển thị", { exact: true })).toHaveValue(
    "Bản nháp được giữ lại",
  );
  await page.unroute("**/api/v1/storefront");
  await page.unroute("**/api/v1/admin/storefront");
  await page.evaluate(() => window.dispatchEvent(new Event("visibilitychange")));
  await expect(page.locator(".notice[role=alert]")).toHaveCount(0);
  await expect(page.getByLabel("Tên hiển thị", { exact: true })).toHaveValue(
    "Bản nháp được giữ lại",
  );
  const current = await json(page, "/api/v1/admin/storefront");
  expect(current.status).toBe(200);
  await page.getByLabel("Tên hiển thị", { exact: true }).fill("Bản nháp chưa lưu");
  const { version, ...content } = current.data;
  expect(
    (
      await json(page, "/api/v1/admin/storefront", "PUT", {
        ...content,
        display_name: "Bản mới trên máy khác",
        expected_version: version,
      })
    ).status,
  ).toBe(200);
  await page.getByRole("button", { name: "Lưu giao diện", exact: true }).click();
  await expect(page.locator(".notice[role=alert]")).toContainText("Dữ liệu đã thay đổi");
  await expect(page.getByLabel("Tên hiển thị", { exact: true })).toHaveValue("Bản nháp chưa lưu");
  await page.getByRole("button", { name: "Xem phiên bản mới nhất" }).click();
  await page.getByRole("button", { name: "Bỏ bản nháp và dùng phiên bản mới nhất" }).click();
  await expect(page.getByLabel("Tên hiển thị", { exact: true })).toHaveValue(
    "Bản mới trên máy khác",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: info.outputPath("appearance-editor.png"), fullPage: true });
  for (const preset of ["home", "fashion", "sport"]) {
    const latest = await json(page, "/api/v1/admin/storefront");
    const { version: v, ...body } = latest.data;
    expect(
      (
        await json(page, "/api/v1/admin/storefront", "PUT", {
          ...body,
          display_name: "Mộc · Cửa hàng nhỏ",
          preset,
          expected_version: v,
        })
      ).status,
    ).toBe(200);
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      await page.goto(origin);
      await expect(page.locator(".store-theme")).toHaveAttribute("data-theme", preset);
      await expect(page).toHaveTitle(/Mộc/);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("h1").first()).toHaveCSS("font-family", /Be Vietnam Pro/);
      expect(
        await page.evaluate(() =>
          document.fonts.check(
            '500 16px "Be Vietnam Pro"',
            "Tiếng Việt: Ắ Ằ Ẳ Ẵ Ặ Ấ Ề Ể Ễ Ệ Ớ Ờ Ở Ỡ Ợ Ứ Ừ Ử Ữ Ự Đ",
          ),
        ),
      ).toBe(true);
      await expect(
        page
          .getByRole("navigation", { name: "Điều hướng chính" })
          .getByRole("link", { name: "Sản phẩm", exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      await expect(page.getByRole("heading", { name: "Sản phẩm sẽ sớm có mặt" })).toBeVisible();
      await page.screenshot({ path: info.outputPath(`${preset}-${width}.png`), fullPage: true });
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator('[data-slot="button"]')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  const visitor = await browser.newContext();
  const second = await visitor.newPage();
  await second.goto(`http://${other}.example.test:${port}`);
  expect((await json(second, "/api/v1/storefront")).data.display_name).toBe(`Store ${other}`);
  expect(
    (await json(second, "/api/v1/admin/storefront", "PUT", { ...content, expected_version: 0 }))
      .status,
  ).toBe(401);
  await second.goto(`http://unknown-${suffix}.example.test:${port}`);
  await expect(second.getByRole("heading", { name: "Chưa thể mở cửa hàng" })).toBeVisible();
  await visitor.close();
  await context.close();
});
