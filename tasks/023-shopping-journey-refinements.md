# Task 023: Shopping journey refinements

## Ownership and status

Frontend: e-commerce-ui. Implementation complete on 2026-10-22 under the user's request; no delivery workflow selected.

## Outcome

- Product detail: photo gallery, explicit size/variant selection, product information, and responsive purchase controls.
- Checkout: consistent page design, clear address/payment selection and estimated totals, expected missing-cart states, and safe failed/uncertain submission handling.
- Order tracking: authoritative progress timeline, VietQR instructions and expiry feedback, payment/reconciliation/cancellation/refund states, and mobile layouts.

## Constraints

Use the existing sibling [OpenAPI contract](../../e-commerce/api/openapi.json). Preserve server prices/stock, tenant/session scoping, snapshot-based order information, guest order access, idempotency across uncertain requests, and optimistic cart versions. Do not infer provider enablement or invent shipping charges, authentication mechanisms, size conversions, or delivery guarantees.

## Verification

- `npm run verify`: passed formatting, OpenAPI drift, lint, TypeScript, 22 unit tests and production build. Three existing image-optimization warnings remain.
- `npx playwright test tests/e2e/shopping-journey.spec.ts tests/e2e/customer-pages.spec.ts tests/e2e/storefront-discovery.spec.ts --workers=1`: all 30 passed using installed Chrome. Sixteen tests cover the new shopping behavior, including quantity/version, missing/error cart, selected payment, definite rejection, identical uncertain retry, guest access recovery, QR/MoMo expiry, reservation expiry, reconciliation/refunds, cancellation and mobile layouts.
- `npx playwright test tests/e2e/ui-migration.spec.ts --grep 'address search|confirmation cancellation|checkout radio' --workers=1`: all three passed.
- Real football-store photos, current checkout state and shipped/refunded/pending orders were inspected at 375px and 1440px without overflow. No cart, order, address or payment data was changed. Local screenshots and evidence are in the backend's ignored `.cache/football-shopping-journey/` folder.
- Changed documentation links and backend `git diff --check`: passed.

## Implementation and limits

Changed `src/components/catalog.tsx`, `cart-checkout.tsx`, `order.tsx` and `src/app/globals.css`; added `tests/e2e/shopping-journey.spec.ts`. See [storefront notes](../docs/storefront-discovery.md#shopping-journey-follow-up) for behavior and design choices.

No backend changes, API changes, dependency changes or delivery workflow reviews are part of this task. Shipping remains an estimate until the server records the order, provider availability remains server-validated, and local payment deadlines never invent an official state. Tests use intercepted provider instructions; no external payment was initiated. The pre-existing backend vulnerability-check failure documented in the storefront notes is unchanged.
