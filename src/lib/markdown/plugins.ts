// Sätteri hast plugins for rendering the repo's `docs/` folder.
//
// Astro 7 renders Markdown with Sätteri. Its plugins are visitor objects
// (similar to rehype plugins, same hast node shapes). Astro runs syntax
// highlighting first, then these plugins, then assigns heading ids.

import { existsSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Element, ElementContent } from 'hast';
import type { HastPluginDefinition, HastPluginEntry } from 'satteri';
import { docIdFromPath, withBase } from '../doc-paths.ts';

export interface DocsLinkOptions {
	/** Absolute path of the repo's `docs/` folder. */
	docsDir: string;
	/** Absolute path of the repository root. */
	repoRoot: string;
	/** e.g. `https://github.com/Nurysso/eulix` */
	repoUrl: string;
	branch: string;
	/** Astro `base`, so links keep working when the site is served from a sub-path. */
	base: string;
}

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function isInside(parent: string, child: string): boolean {
	const rel = relative(parent, child);
	return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

/**
 * Rewrites relative links inside docs so they work on the website:
 *  - `./02-data-pipeline.md#x` → `/docs/architecture/02-data-pipeline/#x`
 *  - `../../libeulix/src/foo.rs` → `https://github.com/<repo>/blob/<branch>/libeulix/src/foo.rs`
 * Absolute URLs, `#anchors`, and site-absolute paths are left alone.
 */
export function docsLinks(options: DocsLinkOptions): HastPluginEntry {
	return (factory) => {
		const file = factory.fileURL ? fileURLToPath(factory.fileURL) : undefined;
		if (!file || !isInside(options.repoRoot, file)) return null;
		const fromDir = dirname(file);

		const plugin: HastPluginDefinition = {
			name: 'eulix-docs-links',
			element: {
				filter: ['a'],
				visit(node, ctx) {
					const href = node.properties?.href;
					if (typeof href !== 'string') return;
					const next = rewriteHref(href, fromDir, options);
					if (next !== undefined && next !== href) ctx.setProperty(node, 'href', next);
				},
			},
		};
		return plugin;
	};
}

function rewriteHref(href: string, fromDir: string, o: DocsLinkOptions): string | undefined {
	if (!href || href.startsWith('#') || href.startsWith('/') || SCHEME.test(href)) return undefined;

	const match = href.match(/^([^?#]*)(.*)$/);
	if (!match || !match[1]) return undefined;
	const [, rawPath, suffix] = match;

	let target: string;
	try {
		target = resolve(fromDir, decodeURI(rawPath));
	} catch {
		return undefined;
	}

	if (isInside(o.docsDir, target) && /\.mdx?$/i.test(target)) {
		const id = docIdFromPath(relative(o.docsDir, target));
		return withBase(o.base, `docs/${id}/`) + suffix;
	}

	if (isInside(o.repoRoot, target)) {
		const repoPath = relative(o.repoRoot, target).split(sep).join('/');
		const isDir = existsSync(target) && statSync(target).isDirectory();
		return `${o.repoUrl}/${isDir ? 'tree' : 'blob'}/${o.branch}/${repoPath}${suffix}`;
	}

	return undefined;
}

/**
 * ```mermaid blocks are skipped by the highlighter (see `excludeLangs`), so they
 * arrive as <pre><code class="language-mermaid">. Turn them into
 * <figure class="diagram"><pre class="mermaid"> for the client-side renderer.
 */
export const mermaidBlocks: HastPluginDefinition = {
	name: 'eulix-mermaid',
	element: {
		filter: ['pre'],
		visit(node, ctx) {
			const code = node.children?.find(
				(child): child is Element => child.type === 'element' && child.tagName === 'code',
			);
			if (!code) return;
			const className = code.properties?.className;
			const isMermaid =
				(Array.isArray(className) && className.includes('language-mermaid')) ||
				(code.data as { lang?: string } | undefined)?.lang === 'mermaid';
			if (!isMermaid) return;

			ctx.replaceNode(node, {
				type: 'element',
				tagName: 'figure',
				properties: { className: ['diagram'] },
				children: [
					{
						type: 'element',
						tagName: 'pre',
						properties: { className: ['mermaid'] },
						children: [{ type: 'text', value: ctx.textContent(code) }],
					},
				],
			});
		},
	},
};

const ALERT_TITLES: Record<string, string> = {
	NOTE: 'Note',
	TIP: 'Tip',
	IMPORTANT: 'Important',
	WARNING: 'Warning',
	CAUTION: 'Caution',
};

const ALERT_MARKER = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\r?\n)?/i;

/** GitHub alert syntax: `> [!NOTE]` → <aside class="callout callout-note">. */
export const githubAlerts: HastPluginDefinition = {
	name: 'eulix-github-alerts',
	element: {
		filter: ['blockquote'],
		visit(node, ctx) {
			const children = node.children ?? [];
			const pIndex = children.findIndex(
				(child) => child.type === 'element' && child.tagName === 'p',
			);
			if (pIndex === -1) return;
			const p = children[pIndex] as Element;
			const first = p.children?.[0];
			if (!first || first.type !== 'text') return;
			const marker = first.value.match(ALERT_MARKER);
			if (!marker) return;

			const kind = marker[1].toUpperCase();
			const remainder = first.value.slice(marker[0].length);
			const pChildren: ElementContent[] = [
				...(remainder.trim() ? [{ type: 'text' as const, value: remainder }] : []),
				...p.children.slice(1),
			];
			// Drop a hard break that GitHub authors sometimes put right after the marker.
			while (pChildren[0]?.type === 'element' && pChildren[0].tagName === 'br') pChildren.shift();

			const hasText = pChildren.some((c) => c.type !== 'text' || c.value.trim() !== '');
			const body: ElementContent[] = [
				...children.slice(0, pIndex),
				...(hasText
					? [{ type: 'element' as const, tagName: 'p', properties: {}, children: pChildren }]
					: []),
				...children.slice(pIndex + 1),
			];

			ctx.replaceNode(node, {
				type: 'element',
				tagName: 'aside',
				properties: { className: ['callout', `callout-${kind.toLowerCase()}`] },
				children: [
					{
						type: 'element',
						tagName: 'p',
						properties: { className: ['callout-title'] },
						children: [{ type: 'text', value: ALERT_TITLES[kind] }],
					},
					...body,
				],
			});
		},
	},
};

/** Wide tables scroll inside their own box instead of stretching the page. */
export const scrollableTables: HastPluginDefinition = {
	name: 'eulix-scrollable-tables',
	element: {
		filter: ['table'],
		visit(node, ctx) {
			ctx.wrapNode(node, {
				type: 'element',
				tagName: 'div',
				properties: { className: ['table-wrap'] },
				children: [],
			});
		},
	},
};
