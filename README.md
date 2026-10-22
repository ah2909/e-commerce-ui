# Small-store commerce UI

Responsive Vietnamese storefront and store admin for the sibling Go API. The [customization guide](docs/store-customization.md) describes the reusable storefront and appearance editor; the [OpenAPI contract](../e-commerce/api/openapi.json) defines implemented behavior.

See [storefront discovery](docs/storefront-discovery.md) for account navigation, catalog search/filter/sort, and the catalog-driven homepage.

Frontend task records live only in [tasks](tasks/README.md). Select delivery stages manually; ordinary requests and `continue` do not activate the workflow.

The [Vietnamese address guide](docs/vietnamese-addresses.md) covers searchable province/ward entry, manual legacy addresses, locally hosted reference data and migration 15.

## Run locally

Use Node 24.14.0 from `.nvmrc` and npm 11. The project typechecks with TypeScript 7.0.2. `eslint-config-next` uses Microsoft's TypeScript 6 compatibility API, while the isolated `scripts/openapi` package uses TypeScript 5.9.3 because `openapi-typescript` 7.13.0 requires it. `npm ci` installs both lockfiles.

1. Start the sibling Go backend and its dependencies as described in `../e-commerce/README.md`. The frontend never selects a store ID; provision a test store through the backend's protected platform API.
2. Resolve a tenant host such as `shop.example.test` to `127.0.0.1`. On Windows, add it to the hosts file with administrator privileges. Keep the backend's `TENANT_BASE_DOMAIN=example.test` and `PLATFORM_HOST=example.test`.
3. Copy `.env.example` to `.env.local`. Keep `GO_API_ORIGIN=http://127.0.0.1:8080`, `TENANT_BASE_DOMAIN=example.test`, and `COOKIE_SECURE=false` for local HTTP.
4. Run `npm ci`, then `npm run dev`. Open `http://shop.example.test:3000` in the browser. The UI sends same-origin `/api/v1` requests; the Next.js route forwards the original validated `Host` header to Go, including the local port.

Use a second tenant host, such as `other.example.test`, for isolation checks. The browser never receives Go bearer, refresh, or guest order-grant tokens; the UI stores them in host-only HTTP-only cookies. For production, terminate TLS at a trusted ingress, keep `COOKIE_SECURE=true`, preserve the public `Host` when routing `/api/v1` through Next.js, and send `/api/v1/payment-webhooks/momo/*` directly to the Go API. Provider/social callback routes configured on the authentication or payment host also go directly to Go so signatures and raw bodies remain intact. Do not expose `GO_API_ORIGIN` as a public environment variable or let clients choose its value.

`MEDIA_BASE_URL` may point to an HTTPS image origin whose paths match the backend's media `object_key`. With no media origin configured, catalog products show an accessible placeholder. Storefront branding uses saved appearance settings; the neutral fallback artwork is decorative and is not a catalog product.

Production requests require `TRUSTED_CLIENT_IP_HEADER=X-Commerce-Client-IP`. A trusted ingress must overwrite that header from its socket client address and restrict direct network access to Next.js. Next validates a single IPv4/IPv6 address, ignores ordinary browser forwarding headers, and forwards the trusted address to Go as `X-Forwarded-For`. Set Go's `TRUSTED_PROXY_CIDRS` to Next's exact egress addresses, such as `127.0.0.1/32` for a same-machine private deployment; do not trust arbitrary client networks. Missing production configuration returns 503, and missing/malformed identity in enabled mode returns 400. Local dev may leave the setting empty, which shares Go's proxy-peer rate-limit bucket across local browsers.

For example, an ingress directly accepting client connections can use these Nginx directives on its Next upstream route:

```nginx
client_max_body_size 1m;
proxy_set_header Host $http_host;
proxy_set_header X-Commerce-Client-IP $remote_addr;
proxy_set_header X-Forwarded-For "";
```

Keep provider callbacks on their direct Go routes. The frontend cancels streamed API bodies beyond 1,000,000 bytes; ingress limits add protection before application buffering.

## Verify

Run `npm run verify` for formatting, OpenAPI drift, ESLint, TypeScript 7 typecheck, focused tests, and a production build. `npm run api:generate` regenerates `src/lib/api/schema.d.ts`, `routes.json`, and the contract hash from the sibling backend contract. `npm run api:check` fails if generated artifacts drift.

Run `npm run test:e2e` with the local Next dev server and a disposable Go database running. Set `UI_SMOKE_PLATFORM_TOKEN` to that environment's platform token; the test provisions two temporary tenants and creates fixture catalog, stock, payment, and shipping data. Install Chromium with `npx playwright install chromium`, or set `UI_SMOKE_CHROMIUM_PATH` to an existing executable. The browser resolves `*.example.test` locally through its launch options, so the test needs no hosts-file edits. Optional `UI_SMOKE_API_ORIGIN` and `UI_SMOKE_UI_PORT` override the local defaults. To reuse isolated fixture tenants, set `UI_SMOKE_SHOP`, `UI_SMOKE_OTHER`, and `UI_SMOKE_PASSWORD` instead of provisioning again.

The browser smoke covers guest checkout and VietQR instructions, payment confirmation, fulfillment completion, registered checkout with a profile and saved address, cancellation, denied customer admin access, and cross-store order denial. It uses fixture payments; external MoMo provider behavior requires separate configured provider testing. The backend remains authoritative for price, stock, permissions, payment, and order state.

## UI components

The storefront and admin screens use app-owned shadcn/ui components, Radix interactions, and Tailwind CSS 4. See [UI component ownership and migration](docs/shadcn-ui.md) for theme tokens, form behavior, and verification.

## Code formatting

Run `npm run format` to format source, tests, scripts, and project configuration. Run `npm run format:check` to check formatting without changing files; `npm run verify` includes this check. Prettier uses two-space indentation, a 100-column line width, double quotes, semicolons, and LF line endings. `.editorconfig` keeps editor defaults consistent. Generated API artifacts, lockfiles, reference data, and build output are excluded.

## Create a store

Open `/platform/stores/new` on the configured `PLATFORM_HOST` (defaults to `TENANT_BASE_DOMAIN`, locally `http://example.test:3000/platform/stores/new`). Resolve that platform hostname to the frontend alongside your tenant hostnames. Enter the store name, immutable subdomain, initial owner's email/password, and a deployment-issued platform-admin bearer token. The backend verifies the token; tenant accounts cannot provision stores. The UI sends it only for that request and never persists it or the owner's password. The server preserves the validated platform host, same-origin protection, trusted ingress identity, backend errors, and rate limits.

The page suggests an address from the store name, preserves edits to that address, and previews it. VND, Vietnamese, and Vietnam time are preselected. Creation and owner provisioning are atomic in the backend. A confirmed result links to the owner's tenant sign-in. An uncertain result stops further submissions until the platform administrator checks the store; onboarding has no idempotency contract, so the UI never retries automatically. Appearance and catalog setup happen after sign-in.

`tests/onboarding.test.ts` verifies the platform bridge with a mocked upstream. `tests/e2e/onboarding.spec.ts` checks the form, responsive layout, confirmed success, and uncertain-result handling using synthetic intercepted API responses. These tests do not provision real stores.

Reviewed previews: [desktop](docs/previews/onboarding/create-store-empty.png) and [phone](docs/previews/onboarding/create-store-empty-mobile.png). Run `npm run test:e2e -- tests/e2e/onboarding.spec.ts` with the frontend running on the platform host; this isolated browser suite uses synthetic data and needs no platform token or backend database.
