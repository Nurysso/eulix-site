import { fileURLToPath } from 'node:url';
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';
import { docsLinks, githubAlerts, mermaidBlocks, scrollableTables } from './src/lib/markdown/plugins.ts';
import { eulixShikiTheme } from './src/lib/markdown/shiki-theme.ts';
import { readVersions } from './src/lib/read-versions.ts';
import { COMPONENTS, SITE } from './src/site.config.ts';

// Serving from a sub-path (e.g. GitHub Pages at /eulix-site/)? Build with SITE_BASE=/eulix-site/.
const base = process.env.SITE_BASE ?? '/';

const here = new URL('./', import.meta.url);
const repoRoot = fileURLToPath(new URL(`${SITE.repoDir.replace(/\/$/, '')}/`, here));
const docsDir = fileURLToPath(new URL(`${SITE.docsDir}/`, here));
const versions = readVersions(repoRoot, COMPONENTS);

export default defineConfig({
	site: process.env.SITE_URL,
	base,
	trailingSlash: 'ignore',
	markdown: {
		processor: satteri({
			hastPlugins: [
				docsLinks({ docsDir, repoRoot, repoUrl: SITE.repoUrl, branch: SITE.branch, base }),
				mermaidBlocks,
				githubAlerts,
				scrollableTables,
			],
		}),
		// Mermaid blocks are left raw and drawn in the browser (src/scripts/docs.ts).
		syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid', 'math'] },
		shikiConfig: { theme: eulixShikiTheme },
	},
	vite: {
		define: {
			__EULIX_VERSIONS__: JSON.stringify(versions),
		},
		build: {
			// Mermaid's diagram engines (elk, cytoscape, katex) are large, but they are
			// split out and only fetched on docs pages that contain a diagram.
			chunkSizeWarningLimit: 1600,
		},
	},
});
