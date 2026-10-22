# shadcn/ui foundation

The storefront, cart, checkout, account, orders, and store-admin screens use local shadcn/ui components in `src/components/ui/`. The components were obtained with shadcn CLI 4.21.4 using the Radix-based `new-york` registry. `components.json` records aliases, the stylesheet, and registry style. Radix provides accessible interactions; Tailwind CSS 4 provides utility styles through `postcss.config.mjs`.

## Ownership and upgrades

shadcn distributes source code. Review upstream changes before updating local components; avoid an overwrite of project adaptations. Imports of `cn` point to `src/lib/utils.ts`. Buttons and inputs retain generous touch targets and Vietnamese body typography. Card and Alert support `asChild` so existing semantic forms and sections can share their styling. RadioGroupItem supports appearance-preset cards. Badge includes the existing amber warning state. Dialog close text is Vietnamese.

Add a component with `npx shadcn@4.21.4 add <component>`. Review generated files and dependency changes, remove explanatory comments that conflict with AGENTS.md, and run the checks below. Pin installed dependencies as in package.json. Do not blindly overwrite adapted components.

## Themes and layouts

`src/app/globals.css` maps existing store palettes to shadcn semantic tokens such as background, foreground, primary, card, popover, input, and ring through `@theme inline`. Each `data-theme` boundary resolves its own tokens. Portal content receives the relevant store or draft preset explicitly, allowing an unsaved preview to differ from the live storefront.

Custom hero, product, navigation, and responsive layouts remain in the components CSS layer. Global control painting has been removed so shadcn controls own their styles. Product grids and page containers use commerce-specific class names to avoid Tailwind utility collisions. Be Vietnam Pro remains self-hosted. The three allowed appearance presets remain the backend authority.

## Forms and commerce

Inputs, textareas, native selects, checkbox controls, and radio groups preserve field names and existing FormData handlers. NativeSelect is appropriate for simple fixed option lists and preserves browser validation. Checkout payment choices submit the selected provider through RadioGroup. Hidden fields and the address picker's native validation proxy intentionally remain native HTML.

LocationPicker combines Popover and Command, with accent-insensitive Vietnamese search, keyboard selection, dependent ward reset, required-selection feedback, and existing manual entry. Optional address details use Collapsible with mounted content so closing the section preserves values and their submission.

ConfirmProvider replaces browser confirmation dialogs with AlertDialog. It resolves cancellation without a mutation, preserves captured form values and versions, restores focus, and cancels a pending confirmation when the session-scoped tree unmounts. Existing API requests, cache scoping, credentials, prices, optimistic versions, and idempotency handling remain application-owned.

## Verification

Run `npm run verify` for contract drift, lint, types, unit tests, and production build. Use `UI_TEST_DIST_DIR` to isolate a build from an existing development server.

`tests/e2e/ui-migration.spec.ts` checks the UI with synthetic API responses. Start this app on port 3011 or set `UI_MIGRATION_ORIGIN` to its local URL, then run `npx playwright test tests/e2e/ui-migration.spec.ts --workers=1`. `UI_SMOKE_CHROMIUM_PATH` can select an installed Chromium browser. These fixtures verify UI behavior, not backend authorization or tenant isolation.

The existing smoke and appearance tests exercise the Go backend and need their disposable-tenant configuration, including `UI_SMOKE_PLATFORM_TOKEN`. Run them with `npx playwright test tests/e2e/smoke.spec.ts tests/e2e/appearance.spec.ts` when that environment is available. The historical automated-test waiver for task 022 remains unchanged; migration tests are separate evidence.

## Migration evidence

On 2026-10-07, `npm run verify` passed contract drift, lint, TypeScript, all 12 unit tests, and the production build using `UI_TEST_DIST_DIR=.next-shadcn-build`. Lint retains three existing next/no-img-element warnings for merchant/catalog/payment images. The separate migration browser suite passed all four checks against that production build with installed Chrome and synthetic API responses: address search and form submission, confirmation cancellation/version handling, theme preview and responsive layout, and payment radio submission/disabled fieldsets.

The backend smoke and appearance suites were not run because UI_SMOKE_PLATFORM_TOKEN was unavailable. Full npm audit reports five high-severity findings in the existing eslint-config-next/fast-glob/micromatch/braces development dependency chain; braces 3.0.3 is also present in the pre-migration lockfile. The audit proposes a Next ESLint configuration downgrade rather than a compatible patch, so that unrelated change was not applied. `npm audit --omit=dev` passed with zero runtime dependency vulnerabilities.

Rendered synthetic-store previews: [mobile](previews/shadcn/appearance-375.png), [tablet](previews/shadcn/appearance-768.png), and [desktop](previews/shadcn/appearance-1440.png).
