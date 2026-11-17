# Eulix website

The landing page and documentation site for [Eulix](https://github.com/Nurysso/eulix), built with [Astro](https://astro.build) 7.

This repo ([Nurysso/eulix-site](https://github.com/Nurysso/eulix-site)) only holds the website. The Eulix code and its docs live in [Nurysso/eulix](https://github.com/Nurysso/eulix); the docs are pulled in at build time (see below).

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
- **Order** inside a group: `PINNED_DOCS` first, then the folder's `README.md` or `Overview.md`, then file name (numeric-aware, so `02-…` before `10-…`).
- **Left out:** ids in `EXCLUDED_DOCS` (the Sphinx-only `index.md`) and docs with `draft: true`.
- **Search titles** are `<title> · <section> · Eulix docs`. When a doc's first heading makes a poor search result (`# 3 Methodology`), override its title or description in `DOC_SEO` in `src/site.config.ts`; the heading on the page stays as written.
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
| `src/components/SEO.astro` | Title, description, canonical, Open Graph, Twitter card, robots and JSON-LD for every page |
| `src/lib/seo.ts` | JSON-LD builders (WebSite, SoftwareApplication, TechArticle, BreadcrumbList, author) |
| `src/data/hubs.ts` | Content of `/prism/`, `/etiya/` and `/ehnas/`, and which docs each links to |
| `public/og/` | 1200×630 social preview images: `eulix.png` for most pages, one per hub page |
| `src/lib/markdown/plugins.ts` | Markdown plugins: link rewriting, alerts, Mermaid, tables |
| `src/lib/markdown/shiki-theme.ts` | Code highlighting theme in the CLI palette |
| `src/lib/docs.ts` | Titles, descriptions, sidebar order, prev/next |

## Deploying under a sub-path

The site is served from GitHub Pages at `https://nurysso.github.io/eulix-site/`, a sub-path named after this repo. CI sets the base path for you; to reproduce that build locally:

```bash
SITE_URL=https://nurysso.github.io SITE_BASE=/eulix-site/ pnpm build
```

`SITE_BASE` must match the repo name, or links and assets break. `SITE_URL` is the site's public origin, used for canonical and `og:url` tags, the sitemap and JSON-LD; it falls back to `SITE.url` in `src/site.config.ts`.

## SEO

- `@astrojs/sitemap` writes `sitemap-index.xml` on every build (the 404 page is left out).
- Crawlers only read `robots.txt` at the domain root, so the rules that count are in the `robots.txt` of the `Nurysso/nurysso.github.io` repo, which lists this site's sitemap. `public/robots.txt` here is served at `/eulix-site/robots.txt`; it states the same intent but crawlers don't read it.
- `public/googlef01f55c07bef7f05.html` verifies the site in Google Search Console. Keep it.
- Links to docs written in components go through `docUrl()` in `src/lib/docs.ts`, which fails the build if the doc no longer exists. Use it instead of hand-built `docs/...` paths, so a reorganisation of the eulix docs can't leave dead links.

## Credits

Display type (headings, the Eulix wordmark, key lines) is set in [Redaction](https://www.redaction.us/), designed by Jeremy Mickel (MCKL) for the Redaction project. It is free under the SIL Open Font License 1.1 / LGPL 2.1; the license is in `src/fonts/redaction/OFL.txt`.
