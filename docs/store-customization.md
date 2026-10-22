# Customize a small-store storefront

Open **Quản lý cửa hàng → Giao diện** as an owner or administrator. Choose Nhà & đời sống, Thời trang, or Thể thao, then enter the shop name, tagline, homepage title/text, and optional announcement. Presets change the palette, heading style, corners, and decorative composition; the shopping components and API behavior remain shared.

Use **Dùng lời giới thiệu mẫu** only when you want to replace the hero copy with that preset's sample text. Preset selection itself preserves merchant content. Add public HTTPS image URLs for a logo and hero. Images are loaded directly by the browser with no referrer; choose a trusted image host, and use compressed images around 1200 pixels wide for hero artwork. The server does not fetch merchant URLs. The shop's typographic artwork remains the fallback when neither merchant artwork nor catalog photos are available. No catalog products or promotional claims are invented.

On the live homepage, available catalog photographs take the place of the typographic artwork when no merchant hero image is configured. The editor's neutral preview remains available before products exist. See [storefront discovery](storefront-discovery.md) for the home collections and store introduction.

Use **Xem toàn màn hình** for a keyboard-accessible preview and **Lưu giao diện** to publish settings to this store. The dialog supports Escape, focus trapping, and focus restoration. A version conflict preserves the draft; inspect the latest version before explicitly discarding your draft. If a network failure makes the result uncertain, check the current version before attempting further changes.

Settings belong to the store resolved from the request hostname. Owner/admin writes use store.manage; staff, shoppers, and anonymous visitors cannot edit. Public GET returns only display fields. Credentials never enter these settings. Every save is versioned and audited in the same transaction.

## UI foundation

The app uses app-owned shadcn/ui components backed by Radix, with Tailwind CSS 4 and semantic CSS variables for store-specific presentation. Home, fashion, and sport keep their shared commerce components, Vietnamese typography, and independent palettes and corner sizes. See the [shadcn migration guide](shadcn-ui.md) for component ownership and verification.

Theme tokens live in `src/app/globals.css`; public/editor shared hero and image fallback components live in `src/components/appearance.tsx`; the preview dialog uses `src/components/ui/dialog.tsx`. Shared inputs, native selects, checkboxes, radio groups, cards, alerts, tables, and buttons live under `src/components/ui/`. The address picker composes shadcn Popover and Command. Native form names, constraints, and FormData submission remain supported.

A new preset requires a backend allowlist update, OpenAPI regeneration, frontend tokens/copy, and browser checks. Arbitrary CSS/HTML and unrestricted colors are intentionally not accepted.

## Deployment and verification

Apply backend migration 14 before deploying the new API, then deploy this UI. Until migration 14, the API does not register appearance routes. Existing stores need no data backfill; they start with their resolved store name and the neutral home preset. Keep the migration and settings when rolling back the application; schema repairs go forward. The audit constraint extension validates existing records, so schedule the migration with attention to audit-table size and lock duration.

The contract is `GET /api/v1/storefront` and `GET`/`PUT /api/v1/admin/storefront`. PUT requires expected_version and bounded plain-text fields. The schema, generated types and route allowlist must be updated together. Regional defaults remain Vietnamese/VND; digital products, arbitrary page building, and multilingual setup are outside this task.

Run `npm run verify` and `npm run test:e2e`. The browser suite uses disposable tenant fixtures. `UI_SMOKE_API_ORIGIN`, `UI_SMOKE_UI_PORT`, and `UI_SMOKE_CHROMIUM_PATH` select local test services/browser. `UI_TEST_DIST_DIR=.next-ui021` allows a separate dev cache when another dev server is running. `UI_SMOKE_CLIENT_IP` can supply a synthetic trusted ingress header when testing a production-like local setup; never trust that header from direct public clients. Production cookie tests require HTTPS.

Store metadata follows the saved name and tagline. The pre-existing noindex policy stays enabled pending a separate release decision. Customization alone does not establish production launch readiness.

## Vietnamese typography

Be Vietnam Pro is self-hosted through the pinned @fontsource package. Normal weights 400/500/600/700/800 are bundled with Unicode ranges so browsers fetch the required Latin/Vietnamese subsets on demand; CSS font-display: swap keeps text readable during loading. The same family covers navigation, forms, body text and headings, avoiding mismatched accent glyphs from fallback fonts. Headings use at least 1.25 line height and restrained tracking for Vietnamese accents. Font assets ship with the app and do not require requests to Google Fonts at runtime or build time. The package includes the SIL Open Font License.

## Verified previews

The screenshots use synthetic test-store content. They are visual examples, not a production catalog.

- [Home preset, desktop](previews/021/home-1440.png)
- [Fashion preset, mobile](previews/021/fashion-375.png)
- [Sport preset, desktop](previews/021/sport-1440.png)
- [Appearance editor](previews/021/appearance-editor.png)
