# Storefront discovery and account navigation

The account dashboard separates personal information, saved addresses, cart access, and order-tracking guidance. Store management appears in the account dashboard and footer only after `GET /api/v1/store` confirms an `owner`, `admin`, or `staff` membership. Customers, anonymous visitors, unresolved membership checks, and failed checks receive no management link. Backend permissions remain authoritative for every admin operation.

The product page supports accent-insensitive search across product names, descriptions, SKUs, brands, and assigned categories. Filters include brand, collection, size, inclusive minimum/maximum VND price, and stock. Sort options are newest, ascending price, descending price, and name. Filters are reflected in the URL and survive reload; clearing them resets the view.

Size, price, and stock constraints must all match the same variant. Product-card prices use the cheapest matching variant, so a cheap sold-out size cannot incorrectly satisfy an in-stock price filter. Invalid reversed ranges display a message and no matches. Results display 24 cards at a time, with more results available without losing active filters.

For the current small-store catalog, the UI reads every public API page before filtering or sorting, caches that catalog by tenant/session, and never labels a partially loaded page as complete search results. Failed or repeated cursors produce an error with retry. Large catalogs should eventually move this operation to a bounded server-side search API; this change does not introduce a search index or depend on Kafka.

Brand labels come from assigned `Brand <name>` categories or an explicit `brand` variant option. Known brand capitalization is normalized; names are not guessed from product titles. Other assigned category slugs drive collection links. Size labels preserve the merchant's original system.

The backend public product list and detail now include `categories`, containing only IDs, names, and slugs of active categories assigned to published products in the current store. Draft products and foreign-store labels are excluded. One bounded batch query resolves the labels for each returned page. No schema migration is needed. The OpenAPI contract and generated frontend types include this projection.

The homepage uses merchant appearance content, real catalog photos, collection links, actual catalog counts, a store introduction, a mixed product selection, and shopping guidance. Football-specific introductions are shown when an assigned collection is named `Áo bóng đá`; the merchant's actual category slug is retained for navigation. Other stores receive generic store content. Merchant hero artwork takes precedence; without it, real product photos are used when available, with the existing typographic poster as the empty-catalog fallback. No delivery-time, authenticity, discount, review, or service guarantees are invented.

Verification commands:

```powershell
npm run verify
npx playwright test tests/e2e/storefront-discovery.spec.ts --workers=1
```

The browser suite uses intercepted fixture responses and verifies customer/workforce navigation, a failed membership check, search across two API pages, price sorting, combined filters, URL persistence, empty results, and mobile layouts. Real-store visual checks use the local football fixture separately.

## Verification on 2026-10-22

- `npm run verify`: formatting, contract drift, lint, type checking, all 22 unit tests, and the production build passed. Lint retains three existing image-optimization warnings.
- `npx playwright test tests/e2e/storefront-discovery.spec.ts --workers=1`: all seven browser tests passed using the installed Chrome executable.
- Real football-store browser checks: all 184 products were available to filtering; a Nike/maximum-price combination returned 27 matches; the actual customer had zero management links and the owner had two. Home, account, and catalog fit a 375px viewport without horizontal overflow. Screenshots are retained in the backend's ignored `.cache/football-redesign/` folder.
- `go test ./internal/catalog/...`, `make fmt-check lint`, and the focused real-PostgreSQL category isolation/hydration tests passed. `make migrate-test-up` upgraded only the guarded disposable test database to the already-existing schema 15; no new migration was added.
- `make vulncheck` failed on existing Go standard-library and dependency vulnerabilities. `go.mod` and `go.sum` are unchanged. This remains a release-verification blocker; no passing vulnerability gate or production-readiness claim is made.
- Local documentation links and `git diff --check` passed.

The homepage design follows the existing store theme and accessible layout defaults; the UI/UX skill's homepage-pattern search did not return a suitable verified match.

## Customer-page follow-up

The personal-information and saved-address pages share a responsive account navigation panel, page introduction, and consistent cards. The profile form groups contact details and explains that its contact email does not change the sign-in email. Address cards show recipient, phone, and formatted address separately; editing remains inline, focuses the first field, and retains the existing Vietnamese address picker and archive confirmation. Save operations still send the current optimistic version. Existing address-validation rules and historical verification waivers are unchanged.

The cart now distinguishes an expected missing active cart (`404` with `cart_unavailable`) from genuine loading or permission failures. Missing and anonymous carts receive a shopping empty state without creating a cart on page load. Other failures retain retry and error feedback. A populated cart shows public catalog photos when available, variant details, server-provided estimates, quantity updates/removal, and a separate checkout summary. No shipping charge is invented before checkout. Optional catalog recommendations can fail independently without blocking cart access.

The follow-up changes only frontend presentation and missing-cart handling; no backend API, schema, or permissions changed. `npm run verify` passed with 22 unit tests, production build, and the three existing image-optimization warnings. All 14 customer/storefront browser tests and both existing address-picker/archive regressions passed. A read-only check of the real football customer's cart, profile, addresses, and address editor confirmed mobile layouts without overflow. Screenshots are saved in the backend's ignored `.cache/football-customer-pages/` folder.

## Shopping journey follow-up

On 2026-10-22, at the user's request, checkout temporarily disabled MoMo and labels it unavailable. New checkout submissions use VietQR. Existing MoMo orders retain their status and payment handling.

[Task 023](../tasks/023-shopping-journey-refinements.md) adds a photo gallery with thumbnail and previous/next controls, explicit selected variants, stock-dependent purchase controls, a quantity stepper, product information, and collection links. Prices, stock, size labels and descriptions come from the public catalog. Missing photos retain the existing fallback.

Checkout now groups delivery and payment choices beside a separate estimate summary. Shipping remains unquoted until the server records the order; the UI does not assume which payment providers the merchant has enabled. An expected missing cart has a useful empty state, while other failures retain retry. Definite checkout rejections allow editing; uncertain requests retain the exact body and idempotency key even if the cart disappears. A recorded guest order without its browser access grant remains visible with its order number and guidance to avoid a duplicate purchase.

Order tracking shows a five-step timeline for normal states and specific messages for cancellation, expiry, failed payments, reconciliation and refunds. It uses immutable order-line snapshots, actual shipping totals and shipment timestamps. QR instructions and MoMo links require a matching order/payment and an unexpired deadline. The countdown hides payment controls when the displayed reservation deadline passes and asks for a server refresh; it never changes the official order state locally. Cancellation retains confirmation and idempotency. No payment or shipping backend behavior changes.

Verification on 2026-10-22: `npm run verify` passed (22 unit tests and production build; three existing image-optimization warnings). The shopping/customer/storefront browser suites passed all 30 tests, and three existing address/checkout regressions passed. Screenshots at 375px and 1440px were reviewed. Real football photos, the current checkout state and existing shipped/refunded/pending orders also fit both widths; those checks only signed in and read data. Evidence is in the backend's ignored `.cache/football-shopping-journey/` folder. Payment provider integration tests and historical delivery-workflow reviews are outside this frontend-only change.
