// Shared rules for turning a file in the repo's `docs/` folder into a URL.
//
// Used by the content collection (to generate entry ids) and by the Markdown
// link plugin (to rewrite `[x](./other.md)` into `/docs/other/`), so both sides
// always agree on where a document lives.

/** Section key for documents that sit directly in `docs/`. */
export const ROOT_SECTION = '';

/**
 * `architecture/01-system-overview.md` → `architecture/01-system-overview`
 * `eulix-parser/PRISMv2.md`            → `eulix-parser/prismv2`
 * `architecture/README.md`             → `architecture` (the folder's index page)
 */
export function docIdFromPath(relativePath: string): string {
	const segments = relativePath
		.replace(/\\/g, '/')
		.replace(/\.mdx?$/i, '')
		.split('/')
		.filter(Boolean)
		.map(slugifySegment);

	if (segments.length > 1 && segments.at(-1) === 'readme') segments.pop();
	return segments.join('/');
}

function slugifySegment(segment: string): string {
	return segment
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9._-]/g, '');
}

/** First folder of a doc id, or ROOT_SECTION for top-level documents. */
export function sectionOf(relativePath: string): string {
	const parts = relativePath.replace(/\\/g, '/').split('/');
	return parts.length > 1 ? parts[0] : ROOT_SECTION;
}

/** Joins a site-relative path onto the configured base (`/` or `/eulix-site/`). */
export function withBase(base: string, path: string): string {
	const trimmedBase = base.endsWith('/') ? base : `${base}/`;
	return `${trimmedBase}${path.replace(/^\/+/, '')}`;
}
