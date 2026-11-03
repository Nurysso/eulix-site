// Site-wide settings. Everything the landing page and docs need to know about
// the project lives here, so a version bump or a repo move is a one-line change.

export const SITE = {
  name: 'Eulix',
  tagline: 'Local-first retrieval for AI agents',
  description:
    'Eulix answers code lookups directly from a structural index and returns ranked, token-budgeted context to your MCP client. Runs locally; no embeddings or GPU required with the EHNAS engine.',
  repoUrl: 'https://github.com/Nurysso/eulix',
  branch: 'main',
  crateUrl: 'https://crates.io/crates/libeulix',
  deepWikiUrl: 'https://deepwiki.com/Nurysso/eulix',
  license: 'Apache-2.0',
  author: 'Dawood K. (Nurysso)',
  install: {
    linux: 'bash <(curl -fsSL https://raw.githubusercontent.com/Nurysso/eulix/main/install.sh)',
    windows: 'irm https://raw.githubusercontent.com/Nurysso/eulix/main/install.ps1 | iex',
  },
  /**
   * A checkout of the eulix repo (docs + the files versions are read from),
   * relative to this project. `scripts/fetch-docs.sh` fills it; override with EULIX_REPO_DIR.
   */
  repoDir: process.env.EULIX_REPO_DIR ?? '.eulix-repo',
  /** The docs folder inside `repoDir`. The site renders every `.md` in it. */
  get docsDir() {
    return `${this.repoDir.replace(/\/$/, '')}/docs`;
  },
} as const;

export type ComponentStatus = 'stable' | 'beta';

export interface ComponentConfig {
  /** Folder name in the repo, also the display name. */
  name: string;
  language: 'Go' | 'Rust' | 'Python' | 'HTML/JS';
  status: ComponentStatus;
  role: string;
  /**
   * Where the version is read from at build time (see src/lib/read-versions.ts).
   * `fallback` is shown when the component has no version in its source.
   */
  version?: { file: string; pattern: RegExp } | { fallback: string };
}

/**
 * The subprojects of Eulix, with their current state. Change `status` here
 * when something leaves beta; versions update themselves from the source.
 */
export const COMPONENTS: ComponentConfig[] = [
  {
    name: 'eulix-cli',
    language: 'Go',
    status: 'stable',
    role: 'The eulix command: routing, retrieval, context building, the LLM layer and the MCP server',
    version: {
      file: 'eulix-cli/internal/utils/constansts.go',
      pattern: /AppVersion\s*=\s*"v?([^"]+)"/,
    },
  },
  {
    name: 'libeulix',
    language: 'Rust',
    status: 'stable',
    role: 'Analysis engine on Tree-sitter: symbols, PRISM call graphs, indexes, metrics',
    version: { file: 'libeulix/Cargo.toml', pattern: /^version\s*=\s*"([^"]+)"/m },
  },
  {
    name: 'eulix-parser',
    language: 'Rust',
    status: 'stable',
    role: 'Parser front end to libeulix; writes the knowledge base to .eulix/',
    version: { file: 'eulix-parser/Cargo.toml', pattern: /^version\s*=\s*"([^"]+)"/m },
  },
  {
    name: 'eulix-embed',
    language: 'Python',
    status: 'stable',
    role: 'Streaming embedding pipeline: PyTorch or ONNX, CPU or GPU, SQ8 quantization',
    // No version constant in the package; this is the one docs/eulix-embed/architecture.md states.
    version: { fallback: '0.4.2' },
  },
  {
    name: 'eulix-lsp',
    language: 'Rust',
    status: 'beta',
    role: 'Language server built on libeulix',
    version: { file: 'eulix-lsp/Cargo.toml', pattern: /^version\s*=\s*"([^"]+)"/m },
  },
  {
    name: 'vizEulize',
    language: 'HTML/JS',
    status: 'stable',
    role: 'Single-file call-graph explorer, served locally by eulix vizEulize',
  },
];

/** `eulix mcp` ships inside eulix-cli but is still in beta. */
export const MCP_STATUS: ComponentStatus = 'beta';

export interface DocSectionConfig {
  label: string;
  order: number;
  /** Show this component's status next to the section in the docs. */
  component?: string;
}

/**
 * Sidebar groups, keyed by the first folder under `docs/` ('' = files directly
 * in `docs/`). A folder that is not listed here still shows up: it gets a label
 * made from its name and is sorted after the listed ones.
 */
export const DOC_SECTIONS: Record<string, DocSectionConfig> = {
  '': { label: 'General', order: 0 },
  architecture: { label: 'Architecture', order: 1 },
  'eulix-parser': { label: 'Parser', order: 2, component: 'eulix-parser' },
  'eulix-embed': { label: 'Embedder', order: 3, component: 'eulix-embed' },
};

/**
 * Doc ids that should lead their section, in this order. Everything else is
 * sorted by file name (numeric-aware, so `02-…` comes before `10-…`).
 * A doc can also set `order: <number>` in its frontmatter.
 */
export const PINNED_DOCS = [
  'about-eulix',
  'installation',
  'models-to-use',
  'query-package',
  'known-issues',
];

/** The doc the "Docs" entry points open first. */
export const FIRST_DOC = 'about-eulix';
