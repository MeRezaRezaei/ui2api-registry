# Normalizations applied during initial migration

Structural field fixes only — no data loss. Registry key = directory name.

- blackbox: manifest.site was missing -> "www.blackbox.ai" (from url)
- blackbox: manifest.version was missing -> "0.1.0"
- chatglm: manifest.site derived from hosts[0].site -> "chatglm.cn"
- chatglm: manifest.url derived from hosts[0].url -> "https://chatglm.cn"
- chatgpt: manifest.site was missing -> "chatgpt.com" (from url)
- chatgpt: manifest.version was missing -> "0.1.0"
- conol: manifest.site was missing -> "conol.ai" (from url)
- copilot: manifest.site was missing -> "copilot.microsoft.com" (from url)
- copilot: manifest.version was missing -> "0.1.0"
- copilot-m365: manifest.site was missing -> "copilot.cloud.microsoft" (from url)
- copilot-m365: manifest.version was missing -> "0.1.0"
- doubao: manifest.id was missing -> "doubao"
- doubao: manifest.site was missing -> "www.doubao.com" (from url)
- duckduckgo: manifest.site was missing -> "duck.ai" (from url)
- gemini: manifest.site was missing -> "gemini.google.com" (from url)
- gemini: manifest.version was missing -> "0.1.0"
- google-ai-search: manifest.site was missing -> "www.google.com" (from url)
- google-ai-search: manifest.version was missing -> "0.1.0"
- huggingchat: manifest.site was missing -> "huggingface.co" (from url)
- huggingchat: manifest.version was missing -> "0.1.0"
- hunyuan: folded hunyuan-yuanbao/CAPABILITIES.md (raw bundle analysis, same site) -> ANALYSIS.md
- manus: manifest.id was missing -> "manus"
- manus: manifest.name was missing -> "Manus (manus.im)" (from siteName)
- notion: manifest.site was missing -> "www.notion.so" (from url)
- notion: manifest.version was missing -> "0.1.0"
- tinycms: manifest.version was missing -> "0.1.0"
- v0: manifest.site was missing -> "v0.app" (from url)
- v0: manifest.version was missing -> "0.1.0"
- xiaomimimo: manifest.site was missing -> "aistudio.xiaomimimo.com" (from url)
- xiaomimimo: manifest.version was missing -> "0.1.0"
- zenmux: manifest.site was missing -> "zenmux.com" (from url)
