# Task 021: Storefront customization

## Ownership

Frontend: e-commerce-ui. This is the sole canonical record, including the backend dependencies below.

## Context

[Customization guide](../docs/store-customization.md)

## Outcome

Status: complete; accepted by the user on 2026-10-22. No delivery workflow was selected.

Reusable storefront themes, an appearance editor, Radix interaction primitives, and self-hosted Vietnamese typography.

## Backend dependencies

[Migration 14](../../e-commerce/migrations/00014_store_appearance.sql), store appearance domain/application/persistence/HTTP code, and the [OpenAPI contract](../../e-commerce/api/openapi.json). Keep their dependency evidence in this canonical frontend task.

## Evidence and limitations

The guide, previews, and backend appearance implementation exist. Original approval and review/test reports are unavailable. Later frontend verification and real-store previews are documented in [storefront discovery](../docs/storefront-discovery.md).

Ownership record reconstructed from existing artifacts on 2026-10-07. No workflow stage is active from this reconstruction. The user selects delivery stages manually.

## Completion evidence

The user explicitly accepted completion on 2026-10-22. The shared themes, appearance editor, store branding, typography, and catalog-backed homepage are implemented. Recent `npm run verify` passed. Historical missing review reports are not reconstructed or represented as passing; live production acceptance remains separate.
