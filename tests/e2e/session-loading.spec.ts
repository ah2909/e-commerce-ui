import { expect, test } from "@playwright/test";

const origin = process.env.UI_SESSION_ORIGIN || "http://localhost:3013";
const appearance = {
  preset: "home",
  display_name: "Session Test Store",
  tagline: "",
  hero_title: "Cửa hàng thử nghiệm",
  hero_text: "",
  announcement: "",
  logo_url: "",
  hero_url: "",
  version: 1,
};

test("first visit to an unconfigured host explains the address instead of loading forever", async ({
  page,
}) => {
  await page.goto(origin);
  await expect(page.getByRole("heading", { name: "Chưa thể mở cửa hàng" })).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "thay cho localhost" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("session failure can be retried to open the anonymous storefront and sign in", async ({
  page,
}) => {
  let available = false;
  await page.route("**/api/session", (route) =>
    available
      ? route.fulfill({ json: { kind: "anonymous", session: null } })
      : route.fulfill({ status: 503, json: { message: "Session temporarily unavailable" } }),
  );
  await page.route("**/api/v1/**", (route) =>
    route.fulfill({
      json: route.request().url().endsWith("/storefront") ? appearance : { products: [] },
    }),
  );
  await page.goto(origin);
  await expect(
    page.getByRole("alert").filter({ hasText: "Session temporarily unavailable" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
  available = true;
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(page.getByRole("heading", { name: appearance.hero_title })).toBeVisible();
  await page.getByRole("link", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("button", { name: "Đăng nhập", exact: true })).toBeVisible();
  await expect(page).toHaveURL(`${origin}/account`);
});
