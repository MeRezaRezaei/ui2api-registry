# UI2API Community Registry

Community site-as-API packages for [UI2API](https://github.com/MeRezaRezaei/ui2api).

A **package** is a folder per site under `packages/<site-id>/` — the real per-site capability
package, so the registry is the map between a site and its functions:

```
packages/<site-id>/
  metadata.json     registry-level: siteId, site, name, url, siteVersion, version,
                    status, author, authorizedUse, license, ui2api, trust, publishedAt
  manifest.json     capability package manifest (capabilities[], transport, auth)
  profile.json      (optional) selectors / login requirements
  recipes/*.json    (optional) per-capability recipes
  CAPABILITIES.md   (optional) human doc
  ANALYSIS.md       (optional) raw analysis notes
  session.lock.json (optional) session requirements
```

`index.json` at the root lists every package with its current version (`ui2api registry` reads it).

## Submit or update a package

1. Produce the capability package for the site locally:

   ```bash
   ui2api analyse https://example.com --out ./my-sites
   # then capture/verify selectors, recipes, capabilities (see ui2api docs)
   ```

2. Pack the site folder into the v2 layout (migration script included for existing ui2api
   capability packages — it normalizes ids and derives missing registry fields, nothing is
   dropped):

   ```bash
   node scripts/migrate-local.mts /abs/path/to/ui2api/capabilities
   ```

3. Copy `packages/<site-id>/` into this repo (or edit the existing folder) and open a
   Pull Request. CI (`scripts/validate-registry.mjs`) validates every changed package.

## Review rules

- Every submission is checked by CI. It is rejected if it lacks an authorized-use statement,
  fails schema validation (siteId must match the folder, capabilities must reference existing
  recipes, no orphan recipes), or contains forbidden evasion phrases.
- Packages are merged by a maintainer after human review. Until reviewed, `trust` is
  `unreviewed` and `ui2api serve` still requires `--trust` for unreviewed packages.
- `status` drives behavior: `active` (live capabilities), `awaiting-capture`, `analyzed`,
  `probed`, `inventory`, `grounded`, or `dead-end` (no live product — kept as a record).

### Verified records

Set `verified` on a package's `metadata.json` **only** after a real, recorded live round-trip
through the site with proof (a captured session replay, an attached real browser, or a probe whose
output you can cite). It is how consumers tell a live-verified site from a scaffolded one, so it
must never be claimed from wire-mapping or DOM inspection alone.

Shape — a record, exactly:

```json
"verified": {
  "since": "2026-09-19",
  "evidence": "live chat + web search round-trip via session-locked vault replay, proof PASS deepseek 11462",
  "via": "session-locked vault replay (localStorage userToken Bearer + AWS WAF/PoW page path)",
  "scope": "optional; what was verified"
}
```

`since`, `evidence` and `via` must all be non-empty strings; `scope` is optional (non-empty when
present). Absent or `false` is the honest default — leave it off until you have the live proof.
A bare `true` is **refused** by the validator: keep the field off rather than true it. The record
counts as verified only while the package's `status` is `active`.

## Authorized use

**You are responsible for how you use these packages.** Only automate sites you are authorized
to use, respect each site's terms of service, and comply with applicable law. Submissions that
attempt to bypass bot-detection, captchas, paywalls, or access sites without authorization will
be rejected and the contributor blocked.