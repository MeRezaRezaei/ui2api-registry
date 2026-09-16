// One-time migration: pack local capabilities/<site> into the ui2api-registry
// v2 layout. Registry package = the real per-site capability package.
//
//   packages/<site-id>/
//     metadata.json    registry-level: siteId, site, siteVersion, author,
//                      authorizedUse, license, ui2api, trust, publishedAt
//     manifest.json    capability package manifest (capabilities[], transport)
//     profile.json     selectors, login requirements
//     recipes/*.json   per-capability recipes (when present)
//     CAPABILITIES.md  human doc (when present)
//
// Registry key = canonical site id. Normalizations (structural field fixes
// only, never data loss):
//   codex:        dir=codex, manifest.id was "chatgpt-web-codex" -> kept as
//                 manifest id, registry key = "codex" (dir), alias kept.
//   copilot-m365: missing site/version -> derived: site from url host,
//                 version 0.1.0.
//   doubao:       missing id -> key from dir, id defaulted to dir name.
//   manus:        missing id -> key from dir, id defaulted to "manus".
// Every normalization is recorded in NORMALIZED.md.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
// Source capabilities dir — required. Usage: node scripts/migrate-local.mjs /abs/path/to/ui2api/capabilities
const LOCAL_CAP = process.argv[2] ? resolve(process.argv[2]) : null;
if (!LOCAL_CAP || !existsSync(LOCAL_CAP)) {
  console.error("usage: node scripts/migrate-local.mjs <abs path to ui2api capabilities/>");
  process.exit(2);
}
const REG_ROOT = resolve(HERE, ".."); // registry clone root
const PKGS = resolve(REG_ROOT, "packages");

const UI2API_VERSION = "0.1.0";
const PUBLISHED_AT = new Date().toISOString().slice(0, 10);

const SITE_META = {
  codex: { site: "chatgpt.com/codex", authorizedUse: "Automate my own ChatGPT Codex sessions (chatgpt.com/codex) to read and manage my conversations and model runs." },
  "copilot-m365": { site: "copilot.cloud.microsoft", authorizedUse: "Automate my own Microsoft 365 Copilot sessions (copilot.cloud.microsoft) with my org Entra account to chat and manage my work conversations." },
  doubao: { site: "www.doubao.com", authorizedUse: "Automate my own Doubao (豆包) chat sessions (www.doubao.com/chat) to chat and use image/video generation with my account." },
  manus: { site: "manus.im", authorizedUse: "Automate my own Manus agent sessions (manus.im) to read and manage my sessions, sandboxes, and tasks." },
};

function siteFallback(id: string, url: string): string {
  try { return new URL(url).host; } catch { return id; }
}

function defaultUse(id: string, name: string, url: string): string {
  return `Automate my own ${name || id} sessions (${url}) to chat and use its capabilities with my account.`;
}

const NORMALIZED = [];
const FAILED = [];

const dirs = readdirSync(LOCAL_CAP)
  .filter((d) => existsSync(join(LOCAL_CAP, d, "manifest.json")))
  .sort();

for (const dir of dirs) {
  try {
    const src = join(LOCAL_CAP, dir);
    const manifest = JSON.parse(readFileSync(join(src, "manifest.json"), "utf8"));
    const profilePath = join(src, "profile.json");
    const profile = existsSync(profilePath) ? JSON.parse(readFileSync(profilePath, "utf8")) : null;

    // ————— registry key + id normalization —————
    const siteId = dir; // registry key is the directory name
    const manifestId = String(manifest.id ?? "");
    if (!manifestId) {
      NORMALIZED.push(`${dir}: manifest.id was missing -> "${dir}"`);
      manifest.id = dir;
    } else if (manifestId !== dir && !String(manifestId).endsWith(`-${dir}`) && !String(manifestId).startsWith(`${dir}-`)) {
      // e.g. codex: id "chatgpt-web-codex" vs dir "codex" — keep manifest.id,
      // record the alias, registry key stays the dir.
      NORMALIZED.push(`${dir}: manifest.id "${manifestId}" differs from registry key "${dir}" (alias kept)`);
    }
    if (manifestId !== dir) {
      manifest.aliases = [...(manifest.aliases ?? []), manifestId].filter((a: string) => a !== dir);
    }
    // structural fixes without data loss
    if (!manifest.site && manifest.url) {
      manifest.site = siteFallback(dir, manifest.url);
      NORMALIZED.push(`${dir}: manifest.site was missing -> "${manifest.site}" (from url)`);
    }
    // chatglm has hosts[] (multi-tenant: chatglm.cn + chat.z.ai) but no top-level url/site
    if (!manifest.site && Array.isArray(manifest.hosts) && manifest.hosts[0]?.site) {
      manifest.site = manifest.hosts[0].site;
      NORMALIZED.push(`${dir}: manifest.site derived from hosts[0].site -> "${manifest.site}"`);
    }
    if (!manifest.url) {
      if (Array.isArray(manifest.hosts) && manifest.hosts[0]?.url) {
        manifest.url = manifest.hosts[0].url;
        NORMALIZED.push(`${dir}: manifest.url derived from hosts[0].url -> "${manifest.url}"`);
      } else if (manifest.url !== null && manifest.url !== undefined && manifest.status !== "dead-end") {
        manifest.url = `https://${siteFallback(dir, dir)}`;
        NORMALIZED.push(`${dir}: manifest.url was missing -> "${manifest.url}"`);
      }
    }
    if (!manifest.version) {
      manifest.version = "0.1.0";
      NORMALIZED.push(`${dir}: manifest.version was missing -> "0.1.0"`);
    }
    if (!manifest.name) {
      if (manifest.siteName) {
        manifest.name = manifest.siteName;
        NORMALIZED.push(`${dir}: manifest.name was missing -> "${manifest.name}" (from siteName)`);
      } else {
        manifest.name = dir;
        NORMALIZED.push(`${dir}: manifest.name was missing -> "${dir}"`);
      }
    }

    // ————— profile id must match the registry key —————
    if (profile && String(profile.id ?? "") !== siteId) {
      if (profile.id !== undefined) NORMALIZED.push(`${dir}: profile.id "${profile.id}" -> "${siteId}"`);
      profile.id = siteId;
    }

    // ————— metadata.json —————
    const meta = SITE_META[dir] ?? {};
    const metadata = {
      siteId,
      site: meta.site ?? manifest.site ?? siteFallback(dir, manifest.url ?? dir),
      name: manifest.name,
      url: manifest.url,
      siteVersion: manifest.siteVersion ?? null,
      version: manifest.version,
      status: manifest.status ?? "active",
      author: "ui2api capability package",
      authorizedUse: meta.authorizedUse ?? defaultUse(dir, manifest.name, manifest.url ?? ""),
      license: manifest.license ?? "MIT",
      ui2api: manifest.ui2api ?? UI2API_VERSION,
      trust: "unreviewed",
      publishedAt: PUBLISHED_AT,
    };

    // ————— write v2 layout —————
    const out = join(PKGS, siteId);
    mkdirSync(join(out, "recipes"), { recursive: true });
    writeFileSync(join(out, "metadata.json"), JSON.stringify(metadata, null, 2) + "\n");
    writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
    if (profile) writeFileSync(join(out, "profile.json"), JSON.stringify(profile, null, 2) + "\n");
    // recipes
    const recipesSrc = join(src, "recipes");
    if (existsSync(recipesSrc)) {
      for (const r of readdirSync(recipesSrc).filter((f) => f.endsWith(".json"))) {
        copyFileSync(join(recipesSrc, r), join(out, "recipes", r));
      }
    }
    // CAPABILITIES.md
    if (existsSync(join(src, "CAPABILITIES.md"))) {
      copyFileSync(join(src, "CAPABILITIES.md"), join(out, "CAPABILITIES.md"));
    }
    // hunyuan-yuanbao: raw bundle analysis doc for the SAME site (yuanbao.tencent.com).
    // Folds its richer analysis into the hunyuan package as ANALYSIS.md.
    if (dir === "hunyuan") {
      const raw = join(LOCAL_CAP, "hunyuan-yuanbao", "CAPABILITIES.md");
      if (existsSync(raw)) {
        copyFileSync(raw, join(out, "ANALYSIS.md"));
        NORMALIZED.push(`hunyuan: folded hunyuan-yuanbao/CAPABILITIES.md (raw bundle analysis, same site) -> ANALYSIS.md`);
      }
    }
    // session.lock.json
    if (existsSync(join(src, "session.lock.json"))) {
      copyFileSync(join(src, "session.lock.json"), join(out, "session.lock.json"));
    }
    console.log(`packed  ${siteId}  (${manifest.name}) v${manifest.version}`);
  } catch (e) {
    FAILED.push(`${dir}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ————— index.json —————
const index = {};
for (const dir of readdirSync(PKGS).filter((d) => existsSync(join(PKGS, d, "manifest.json"))).sort()) {
  try {
    const meta = JSON.parse(readFileSync(join(PKGS, dir, "metadata.json"), "utf8"));
    index[dir] = {
      name: meta.name, url: meta.url, site: meta.site,
      version: meta.version, trust: meta.trust, publishedAt: meta.publishedAt,
    };
  } catch { /* skip */ }
}
writeFileSync(join(REG_ROOT, "index.json"), JSON.stringify(index, null, 2) + "\n");
console.log(`\nindex.json: ${Object.keys(index).length} sites`);

if (NORMALIZED.length) {
  writeFileSync(
    join(REG_ROOT, "NORMALIZED.md"),
    "# Normalizations applied during initial migration\n\n" +
    "Structural field fixes only — no data loss. Registry key = directory name.\n\n" +
    NORMALIZED.map((n) => `- ${n}`).join("\n") + "\n"
  );
  console.log(`NORMALIZED.md: ${NORMALIZED.length} notes`);
}
if (FAILED.length) {
  console.error("FAILED:\n" + FAILED.join("\n"));
  process.exit(1);
}