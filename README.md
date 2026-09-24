# ui2api-registry

Community **site-as-API packages** for [UI2API](https://github.com/MeRezaRezaei/ui2api).

Each package under `packages/<site-id>/` is the real per-site capability package: the map between a
site and the functions UI2API exposes for it — its capabilities, transport, selectors, recipes and
session requirements. Each package's `metadata.json` may carry a machine-checkable `verified` record
(`since`, `evidence`, `via`) proving a real recorded live round-trip — absent or `false` means the
site is **not** verified, and a bare `true` is refused. `index.json` lists every site with its current version.

```
packages/gemini/          packages/kimi/            packages/chatgpt/   …33 sites
  metadata.json             metadata.json
  manifest.json             manifest.json
  profile.json              profile.json
  recipes/                  recipes/
  CAPABILITIES.md           CAPABILITIES.md
  session.lock.json         session.lock.json
```

## Using the registry

Install the platform once, then pull a site package from this catalog:

```bash
npm i -g ui2api                # the UI2API platform
ui2api install --catalog       # list the catalog: site id, version, trust
ui2api install <site-id>       # fetch packages/<site-id>/ into the packages root
```

`ui2api install --catalog` reads this repo's `index.json`; `ui2api install
<site-id>` fetches `packages/<site-id>/` (metadata, manifest, profile, recipes,
session requirements) from the repository and materializes it under
`capabilities/<site-id>/` — the packages root the daemon serves. Installed
packages are served by `ui2api promptd` as `<site>_<capability>` tools on
`GET /registry`; unreviewed packages keep `trust: "unreviewed"` until a
maintainer reviews them (nothing auto-trusts an install).

`ui2api hub` starts the local package hub (registry server); `ui2api hub run
<site-id>` serves a registered package, `ui2api hub publish <site-id>` builds
and publishes one.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Every package is validated by CI
(`scripts/validate-registry.mjs`): authorized-use statement required, `metadata.siteId` must match
the folder, capabilities must reference existing recipe files, and evasion phrases are rejected.

## Authorized use

Only automate sites you are authorized to use, respect each site's terms of service, and comply
with applicable law. Use at your own risk.
