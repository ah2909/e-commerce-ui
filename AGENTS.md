# Instructions for Codex in e-commerce-ui

## Project context

This is the frontend folder for the sibling e-commerce Go backend. The storefront foundation record is in tasks/020-commerce-ui-foundation.md; the original Penpot handoff is unavailable in this checkout. The reusable storefront and appearance editor are documented in docs/store-customization.md. The backend is the authority for implemented behavior.

Before implementation, read these sibling files:
- ../e-commerce/AGENTS.md
- ../e-commerce/docs/product-requirements.md
- ../e-commerce/docs/architecture.md
- ../e-commerce/TASKS.md
- ../e-commerce/docs/testing-strategy.md
- tasks/README.md and the applicable canonical task record; read sibling backend tasks only when they are relevant dependencies
- ../e-commerce/api/openapi.json

Keep frontend-owned task records in this folder's tasks/ directory only. Backend-owned tasks remain in ../e-commerce/TASKS.md. Mixed work has one canonical record in the repository owning the primary outcome; record sibling dependencies there and link it instead of copying it. Task numbers are local to each repository.

Do not apply the delivery workflow automatically. Invoke the sibling project's delivery skills only when the user explicitly requests them. Each ec-* stage stops at its boundary; continue preserves that boundary. Only an explicit $ecommerce-delivery or full-workflow request selects the complete sequence. Read ../e-commerce/docs/development-workflow.md when it is explicitly selected.

## Frontend boundaries

- Keep frontend source in this folder and the OpenAPI contract in the backend folder.
- Generate TypeScript API types from ../e-commerce/api/openapi.json. Check contract drift during frontend verification.
- The backend selects the store from the validated request hostname. Never use a user supplied store ID as tenant authority.
- Public catalog and product pages use the shared store theme and components described in docs/store-customization.md. Implement only behavior supported by the current OpenAPI contract.
- Show VND amounts from integer minor units using vi-VN formatting. The backend is authoritative for prices, stock, permissions, order and payment status.
- Keep user, guest, and order credentials out of client readable persistent storage and logs. Scope private caches by store and session and clear them when the session changes.
- Preserve idempotency keys across retries of the same checkout or payment action. Handle optimistic version conflicts and problem responses from the API.
- For local and deployed browser integration, use same-origin API routing that preserves the validated tenant host. Route provider callbacks directly to the Go API.
- Keep code comments short and only explain a non-obvious reason. Do not add TODO or FIXME comments without a user request.

## Current state

The frontend is a Next.js, TypeScript, TanStack Query, and OpenAPI-based app with storefront, checkout, account, order, and store-admin flows. [Task 021](tasks/021-storefront-customization.md) adds store-scoped appearance settings, three shared theme presets, Radix interaction primitives, and self-hosted Be Vietnam Pro typography. Read its task record and the customization guide for verification and migration requirements. [Task 022](tasks/022-vietnamese-address-entry.md) owns the address-entry outcome and records its backend migration dependency.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
