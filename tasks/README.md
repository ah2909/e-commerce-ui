# Frontend tasks

Keep frontend-owned tasks only in this directory. [Backend tasks](../../e-commerce/TASKS.md) remain in the backend repository. Mixed work has one canonical record in the repository owning the primary outcome; document sibling dependencies there without copying the record. Numbers are local to each repository, so frontend 020 and backend 020 identify different tasks.

| Task | Owner | Current evidence |
| --- | --- | --- |
| [020 Commerce UI foundation](020-commerce-ui-foundation.md) | Frontend | Complete; user accepted on 2026-10-22; historical evidence limitations retained |
| [021 Storefront customization](021-storefront-customization.md) | Frontend, with backend dependency | Complete; user accepted on 2026-10-22; historical review limitations retained |
| [022 Vietnamese address entry](022-vietnamese-address-entry.md) | Frontend, with backend dependency | Complete; user accepted on 2026-10-22; original automated-test waiver retained |
| [023 Shopping journey refinements](023-shopping-journey-refinements.md) | Frontend | Complete: product details, checkout, and order/payment tracking; 33 browser checks passed |

Tasks 020–022 reconstructed ownership on 2026-10-07 and were explicitly accepted as complete by the user on 2026-10-22. Their records preserve missing historical evidence and the original address-task waiver. Current acceptance does not establish retrospective independent reviews or production readiness.

The delivery workflow is manual: explicitly invoke the desired ec-* stage. Ordinary requests and continue do not activate it. Use [TEMPLATE.md](TEMPLATE.md) for new records when requested or when an explicitly invoked workflow requires one.
