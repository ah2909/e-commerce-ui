# Vietnamese address entry

Guest checkout and saved-address forms share a province/city picker and dependent ward/commune/special-zone picker. Search works with or without accents. Use arrows and Enter to choose, Escape to close, or tap a suggestion. Province changes clear the ward. Enter the house number/street separately; contact and street fields support browser autofill.

**Nhập thủ công** supports older names and locations missing from the reference data. Existing saved addresses open in manual mode so their original values remain unchanged. **Chọn địa chỉ mới từ danh sách** explicitly clears only the location fields, allowing replacement with a current administrative address. Street/contact and optional details stay mounted. Optional line 2, legacy district and postal code appear under **Thông tin bổ sung**. District remains a string in the API; submit an empty string when unnecessary. No district or postal code is inferred.

Registered checkout selects the first available saved address and displays the recipient, phone and full address. Choose a different saved address before submitting when needed. Existing profile and address requirements remain.

[Address form preview](previews/022/address-form.png) shows the empty form opened in the local demo for user inspection.

## Data source and freshness

The MIT-licensed [Vietnamese Provinces Database](https://github.com/thanglequoc/vietnamese-provinces-database) release **v5.2.0**, revision **62b1abdfe39625289c37a58ef6678e9db3d37f84**, provides 34 provincial units and 3,321 wards/communes/special zones. It includes the September 2026 provincial names and commune-type updates, rather than relying only on the July 2025 list. Effective dates for resolutions 388/NQ-UBTVQH16, 39/2026/QH16 and 36/2026/QH16 were compared with the [National Statistics Office register](https://danhmuchanhchinh.nso.gov.vn/NghiDinh.aspx) on 2026-10-07. This checks release chronology; it is not an independent verification of every individual row.

Generated public files live under `public/data/vn-address/v5.2.0/`. The metadata file records source URL, revision, input SHA-256, effective date, counts and attribution. `public/data/vn-address/LICENSE.txt` preserves the upstream MIT notice. Only official code strings, display names and province relationships are used; upstream postal codes and geometry are not imported. The province list is small, and ward lists are fetched only for the selected province. Requests have a 10-second timeout, support cancellation and provide retry/manual fallback. These requests stay on this app's origin; no recipient, phone or street data is sent to any address service.

## Refresh

Run `node scripts/generate-vn-addresses.mjs` to regenerate the pinned files, or pass the downloaded source filename for offline generation. The script enforces the reviewed SHA-256, exact counts, unique codes, ward-parent relationships, supported text lengths and safe names before writing files. It downloads only from a fixed, commit-pinned source URL.

For a newer release, review its effective dates against the official register, inspect upstream changes and license, then update the generator revision/version/hash/count expectations and the UI addressDataVersion together. Generate a new versioned directory and review the diff. Validate leading zeros, province-to-ward relationships and updated names. Keep the preceding dataset directory while older deployed UI bundles may still reference it. Source data may change independently of this app; record the checked date on each refresh.

## Rollout

Apply backend migration **15** before deploying the updated API and UI. It relaxes only district minimum length in Customers and Orders text constraints. Existing values, snapshots, non-null columns, upper limits and tenant keys are retained without a backfill. Goose runs this migration in a transaction: the ACCESS EXCLUSIVE locks acquired when adding the constraints are retained through validation scans of both address tables and commit. This can block reads and writes for the entire migration; schedule an appropriate maintenance window based on table sizes. Schema repair goes forward; no production migration/deployment was performed for this task.

The user explicitly waived automated tests for task 022. The [task record](../tasks/022-vietnamese-address-entry.md) identifies unavailable historical build/static and independent-review evidence; they must not be described as passing behavior or database integration tests.
