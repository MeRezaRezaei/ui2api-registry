# UI2API Community Registry

This repository holds **community-contributed site packages** for [UI2API](https://github.com/MeRezaRezaei/ui2api).

A *package* is a folder per site under `packages/<host>/` containing:

- `metadata.json` — who published it and why they are authorized to automate the site.
- `action-map.json` — the output of `ui2api analyse` for that site.

## Submit a package

1. Analyze the site locally:

   ```bash
   ui2api analyse https://example.com --out ./my-sites
   ```

2. Bundle it into a package:

   ```bash
   ui2api package example.com \
     --author "Your Name" \
     --use "I automate my own example.com account to read my data"
   ```

   This creates `my-sites/packages/example.com/{metadata.json,action-map.json}`.

3. Copy that folder into `packages/example.com/` here and open a Pull Request.

## Review rules

- Every submission is checked by CI (`scripts/validate-registry.mjs`). It is rejected if it lacks an
  authorized-use statement, fails schema validation, or contains forbidden evasion terms.
- Packages are merged by a maintainer after human review. Until reviewed, `trust` is `unreviewed`
  and `ui2api serve` still requires `--trust` for unreviewed maps.
- **You are responsible for how you use these packages.** Only automate sites you are authorized to
  use, respect each site's terms of service, and comply with applicable law. Use at your own risk.

Submissions that attempt to bypass bot-detection, captchas, paywalls, or access sites without
authorization will be rejected and the contributor blocked.
