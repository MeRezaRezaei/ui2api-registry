# ui2api-registry

Community **site-as-API packages** for [UI2API](https://github.com/MeRezaRezaei/ui2api).

Each package under `packages/<site-id>/` is the real per-site capability package: the map between a
site and the functions UI2API exposes for it — its capabilities, transport, selectors, recipes and
session requirements. Each package's `metadata.json` may carry a machine-checkable `verified` record
(`since`, `evidence`, `via`) proving a real recorded live round-trip — absent or `false` means the
site is **not** verified, and a bare `true` is refused. `index.json` lists every site with its current version.

```
packages/gemini/          packages/kimi/            packages/chatgpt/   …30 sites
  metadata.json             metadata.json
  manifest.json             manifest.json
  profile.json              profile.json
  recipes/                  recipes/
  CAPABILITIES.md           CAPABILITIES.md
  session.lock.json         session.lock.json
```

## Using the registry

```bash
ui2api registry                 # list sites from index.json
ui2api hub pull <site-id>       # fetch a package
```

`ui2api serve` treats unreviewed packages as untrusted — pass `--trust` after reviewing, or wait
for the package's `trust` to become `reviewed`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Every package is validated by CI
(`scripts/validate-registry.mjs`): authorized-use statement required, `metadata.siteId` must match
the folder, capabilities must reference existing recipe files, and evasion phrases are rejected.

## Authorized use

Only automate sites you are authorized to use, respect each site's terms of service, and comply
with applicable law. Use at your own risk.
