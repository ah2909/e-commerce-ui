# Task 022: Vietnamese address entry

## Ownership

Frontend: e-commerce-ui. This is the sole canonical record, including the backend dependencies below.

## Context

[Address guide](../docs/vietnamese-addresses.md)

## Outcome

Status: complete; accepted by the user on 2026-10-22. No delivery workflow was selected.

Searchable province and ward entry, manual legacy-address fallback, and shared checkout/saved-address forms.

## Backend dependencies

[Migration 15](../../e-commerce/migrations/00015_optional_address_district.sql), optional district validation in Customers/Orders, and the [OpenAPI contract](../../e-commerce/api/openapi.json). Keep their dependency evidence in this canonical frontend task.

## Evidence and limitations

The guide, address-form preview, and backend optional-district implementation exist. The guide records a historical user waiver of automated tests for the original task; that waiver is preserved. Historical independent-review reports remain unavailable.

Ownership record reconstructed from existing artifacts on 2026-10-07. No workflow stage is active from this reconstruction. The user selects delivery stages manually.

## Completion evidence

The user explicitly accepted completion on 2026-10-22. Later customer-page work passed the existing address-picker and archive-confirmation browser regressions, edit/version checks, mobile checks, and frontend verification. These later checks do not rewrite the original waiver or imply that missing historical independent reviews occurred.
