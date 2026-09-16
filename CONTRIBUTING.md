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

## Authorized use

**You are responsible for how you use these packages.** Only automate sites you are authorized
to use, respect each site's terms of service, and comply with applicable law. Submissions that
attempt to bypass bot-detection, captchas, paywalls, or access sites without authorization will
be rejected and the contributor blocked.