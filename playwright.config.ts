import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  use: {
    browserName: "chromium",
    headless: true,
    ...(process.env.UI_SMOKE_CLIENT_IP
      ? { extraHTTPHeaders: { "X-Commerce-Client-IP": process.env.UI_SMOKE_CLIENT_IP } }
      : {}),
    timezoneId: "Asia/Ho_Chi_Minh",
    launchOptions: {
      args: ["--host-resolver-rules=MAP example.test 127.0.0.1, MAP *.example.test 127.0.0.1"],
      ...(process.env.UI_SMOKE_CHROMIUM_PATH
        ? { executablePath: process.env.UI_SMOKE_CHROMIUM_PATH }
        : {}),
    },
  },
});
