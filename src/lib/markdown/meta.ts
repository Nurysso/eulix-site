// Pulls a title and a one-line description out of a raw Markdown body.
// The docs folder has no frontmatter, so pages are named after their first
// heading and described by their first paragraph.

export interface MarkdownMeta {
	/** Text of the first `# heading`, if the document has one. */
	h1?: string;
	/** A heading of any level on the document's first content line. */
	leadingHeading?: string;
	/** First prose paragraph, flattened to plain text. */
	firstParagraph?: string;
}

const FENCE = /^\s*(`{3,}|~{3,})/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;

export function extractMarkdownMeta(body: string): MarkdownMeta {
	const lines = body.replace(/\r\n?/g, '\n').split('\n');
	const meta: MarkdownMeta = {};
	let fence: string | null = null;
	let sawContent = false;
	let paragraph: string[] = [];
	let collecting = false;

	const finishParagraph = () => {
		if (paragraph.length && !meta.firstParagraph) {
			const text = toPlainText(paragraph.join(' '));
			if (text.length >= 24) meta.firstParagraph = text;
		}
		paragraph = [];
		collecting = false;
	};

	for (const line of lines) {
		const fenceMatch = line.match(FENCE);
		if (fence) {
			if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = null;
			continue;
		}
		if (fenceMatch) {
			finishParagraph();
			fence = fenceMatch[1];
			sawContent = true;
			continue;
		}

		const heading = line.match(HEADING);
		if (heading) {
			finishParagraph();
			const text = toPlainText(heading[2]);
			if (!sawContent) meta.leadingHeading = text;
			if (heading[1].length === 1 && !meta.h1) meta.h1 = text;
			sawContent = true;
			continue;
		}

		const trimmed = line.trim();
		if (!trimmed) {
			if (collecting) finishParagraph();
			continue;
		}
		sawContent = true;

		if (meta.firstParagraph) continue;

		// Things that are not prose: tables, rules, HTML, list items, alert markers.
		const unquoted = trimmed.replace(/^(>\s?)+/, '').trim();
		if (
			/^\|/.test(unquoted) ||
			/^([-*_])(\s*\1){2,}$/.test(unquoted) ||
			/^</.test(unquoted) ||
			/^([-*+]|\d+[.)])\s/.test(unquoted) ||
			/^\[![A-Z]+\]$/i.test(unquoted) ||
			/^\[[^\]]+\]:\s/.test(unquoted)
		) {
			if (collecting) finishParagraph();
			continue;
		}
		if (!unquoted) continue;
		paragraph.push(unquoted);
		collecting = true;
	}
	finishParagraph();
	return meta;
}

/** Strips inline Markdown so a heading or paragraph can be used as plain text. */
export function toPlainText(markdown: string): string {
	return markdown
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/(\*\*|__)(.+?)\1/g, '$2')
		.replace(/(^|[\s(])\*(\S[^*]*?)\*(?=[\s).,:;!?]|$)/g, '$1$2')
		.replace(/<[^>]+>/g, '')
		.replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Removes emoji so titles read cleanly in navigation. */
export function stripEmoji(text: string): string {
	return text
		.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
		.replace(/\s{2,}/g, ' ')
		.trim();
}

/** Cuts text at a word boundary, adding an ellipsis when it was shortened. */
export function truncate(text: string, max = 180): string {
	if (text.length <= max) return text;
	const cut = text.slice(0, max);
	const lastSpace = cut.lastIndexOf(' ');
	return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).replace(/[\s,;:.–—-]+$/, '')}…`;
}

/** `perfNote` → `Perf note`, `ehnas-retrieval-fixes` → `Ehnas retrieval fixes`. */
export function titleFromFileName(name: string): string {
	const words = name
		.replace(/\.mdx?$/i, '')
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/[-_]+/g, ' ')
		.trim()
		.toLowerCase();
	return words.charAt(0).toUpperCase() + words.slice(1);
}
