# Eulix website

The landing page and documentation site for Eulix, built with [Astro](https://astro.build) 7.

```bash
pnpm install
pnpm dev            # fetch docs from the eulix repo, then http://localhost:4321
pnpm build:fresh    # fetch docs + production build (what CI does)
pnpm docs:fetch     # only refresh .eulix-repo/
pnpm preview        # serve the build
pnpm check          # type-check .astro and .ts files
SKIP_FETCH=1 pnpm dev   # offline: reuse the existing .eulix-repo/
```

Docs are not stored here. `scripts/fetch-docs.sh` does a shallow sparse clone of
[Nurysso/eulix](https://github.com/Nurysso/eulix) into `.eulix-repo/` (gitignored),
pulling `docs/` plus the files component versions are read from. Set `EULIX_REF`
to build from another branch or tag, or `EULIX_REPO_DIR` for another location.
CI (`.github/workflows/deploy.yml`) runs the same script, builds, and deploys to GitHub Pages.

Requires Node 22.23.4 or newer (Astro 7).

## Docs come from the eulix repo's `docs/`

Every Markdown file in the repository's `docs/` folder becomes a page under `/docs/`. You don't need to change anything in this folder to publish a doc: add or edit a `.md` file in `docs/` and it shows up on the next build (or live, under `npm run dev`).

| In `docs/` | On the site |
| --- | --- |
| `installation.md` | `/docs/installation/` |
| `architecture/03-query-pipeline.md` | `/docs/architecture/03-query-pipeline/` |
| `architecture/README.md` | `/docs/architecture/` (the folder's overview) |
| `eulix-parser/PRISMv2.md` | `/docs/eulix-parser/prismv2/` |

- **Sidebar groups** follow the first folder level. Labels and order for known folders are in `DOC_SECTIONS` in `src/site.config.ts`; new folders appear automatically.
- **Titles** come from the first `# heading`, and **descriptions** from the first paragraph. Frontmatter is optional.
- **Order** inside a group: `PINNED_DOCS` first, then `README.md`, then file name (numeric-aware, so `02-…` before `10-…`).
- **Links** between docs (`[x](./other.md#anchor)`) are rewritten to site URLs. Links to source files (`../../libeulix/src/foo.rs`) go to GitHub.
- **GitHub alerts** (`> [!NOTE]`, `> [!WARNING]`, …) render as callouts.
- **Mermaid** code blocks render as diagrams in the browser. Wide ones get an "Expand" button.

Optional frontmatter, if a doc needs to override any of that:

```yaml
---
title: Custom page title
description: One line for search results and the docs index.
sidebarLabel: Short name
order: 1          # lower comes first in its group
draft: true       # leave this doc off the site
---
```

## Component status and versions

`COMPONENTS` in `src/site.config.ts` lists every subproject (eulix-cli, libeulix, eulix-parser, eulix-embed, eulix-lsp, vizEulize) with its state, `stable` or `beta`. Change `status` there when something leaves beta; the labels on the landing page and in the docs sidebar follow it. `MCP_STATUS` covers `eulix mcp`, which ships inside eulix-cli.

Versions are read from source at build time, so they never go stale:

| Component | Read from |
| --- | --- |
| eulix-cli | `AppVersion` in `eulix-cli/internal/utils/constansts.go` |
| libeulix, eulix-parser, eulix-lsp | `version` in their `Cargo.toml` |
| eulix-embed | no version in the package; set as `fallback` in the config |

## Where things live

| Path | What |
| --- | --- |
| `src/site.config.ts` | Component status, repo URL, install commands, sidebar groups |
| `src/data/hero-graph.ts` | The slice of Eulix's own call graph shown in the hero |
| `src/data/routing-demo.ts` | Queries, direct answers and etiya context windows shown in the routing demo, with provenance |
| `src/styles/global.css` | Design tokens (colours from `eulix-cli/internal/utils/theme.go`) |
| `src/components/landing/` | One component per landing-page section |
| `src/lib/markdown/plugins.ts` | Markdown plugins: link rewriting, alerts, Mermaid, tables |
| `src/lib/markdown/shiki-theme.ts` | Code highlighting theme in the CLI palette |
| `src/lib/docs.ts` | Titles, descriptions, sidebar order, prev/next |

## Deploying under a sub-path

For GitHub Pages at `https://<user>.github.io/eulix/`, build with the base path set:

```bash
SITE_URL=https://<user>.github.io SITE_BASE=/eulix/ npm run build
```

`SITE_URL` also enables canonical and Open Graph URLs.
