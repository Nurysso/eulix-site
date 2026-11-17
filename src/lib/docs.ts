import { posix } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { DOC_SECTIONS, DOC_SEO, EXCLUDED_DOCS, PINNED_DOCS, SITE } from '../site.config.ts';
import { getComponent, type Component } from './components.ts';
import { ROOT_SECTION, sectionOf, withBase } from './doc-paths.ts';
import { extractMarkdownMeta, stripEmoji, titleFromFileName, truncate } from './markdown/meta.ts';

export type DocEntry = CollectionEntry<'docs'>;

export interface Doc {
	id: string;
	entry: DocEntry;
	/** Full title, used for the page <title> and the H1 when the doc has none. */
	title: string;
	/** Shorter label for the sidebar. */
	navLabel: string;
	description?: string;
	/** Title for the <title> tag and search results, when it should differ from `title`. */
	seoTitle?: string;
	/** Whether the Markdown already starts with its own `# H1`. */
	hasH1: boolean;
	section: string;
	/** Path of the source file from the repo root, e.g. `docs/architecture/README.md`. */
	repoPath: string;
	href: string;
	editUrl: string;
	order: number;
	fileName: string;
}

export interface DocSection {
	key: string;
	label: string;
	docs: Doc[];
	/** The Eulix component this section documents, for its stable/beta label. */
	component?: Component;
}

const base = import.meta.env.BASE_URL;

export function docHref(id: string): string {
	return withBase(base, `docs/${id}/`);
}

function normalize(text: string): string {
	return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function sectionLabel(key: string): string {
	return DOC_SECTIONS[key]?.label ?? titleFromFileName(key);
}

/** "Architecture: Cache System" in the Architecture section → "Cache System". */
function shortenForNav(title: string, section: string): string {
	const prefixes = [section, sectionLabel(section)].filter(Boolean).map(normalize);
	const match = title.match(/^(.+?)\s*(?::|—|–|\s-\s)\s*(.+)$/);
	if (match && prefixes.includes(normalize(match[1]))) return match[2];
	return title;
}

function toDoc(entry: DocEntry): Doc {
	const filePath = entry.filePath ?? '';
	const relativeToDocs = posix.relative(SITE.docsDir, filePath);
	const repoPath = posix.join('docs', relativeToDocs);
	const fileName = posix.basename(relativeToDocs);
	const section = sectionOf(relativeToDocs);
	const meta = extractMarkdownMeta(entry.body ?? '');

	const rawTitle =
		entry.data.title ?? meta.h1 ?? meta.leadingHeading ?? (/^readme\.md$/i.test(fileName)
			? sectionLabel(section)
			: titleFromFileName(fileName));
	const title = stripEmoji(rawTitle);
	const description =
		entry.data.description ??
		(meta.firstParagraph
			? // 155 + the ellipsis keeps it inside the ~160 characters search results show.
					truncate(meta.firstParagraph.replace(/^(Purpose|Context|Summary|Overview):\s*/i, ''), 155)
			: undefined);

	const pinned = PINNED_DOCS.indexOf(entry.id);
	// A folder's README.md or Overview.md is its landing page.
	const isIndex = /^(readme|overview)\.md$/i.test(fileName);
	const order = entry.data.order ?? (pinned >= 0 ? pinned - 1000 : isIndex ? -500 : 0);

	return {
		id: entry.id,
		entry,
		title,
		navLabel: entry.data.sidebarLabel ?? (isIndex ? 'Overview' : shortenForNav(title, section)),
		description: DOC_SEO[entry.id]?.description ?? description,
		seoTitle: DOC_SEO[entry.id]?.title,
		hasH1: Boolean(meta.h1) && !entry.data.title,
		section,
		repoPath,
		href: docHref(entry.id),
		editUrl: `${SITE.repoUrl}/edit/${SITE.branch}/${repoPath}`,
		order,
		fileName,
	};
}

function compareDocs(a: Doc, b: Doc): number {
	if (a.order !== b.order) return a.order - b.order;
	return a.fileName.localeCompare(b.fileName, 'en', { numeric: true, sensitivity: 'base' });
}

let cache: Promise<DocSection[]> | undefined;

/** All docs, grouped by section, in sidebar order. */
export function getDocSections(): Promise<DocSection[]> {
	cache ??= (async () => {
		const entries = await getCollection(
			'docs',
			(entry) => entry.data.draft !== true && !EXCLUDED_DOCS.includes(entry.id),
		);
		const bySection = new Map<string, Doc[]>();
		for (const doc of entries.map(toDoc)) {
			const list = bySection.get(doc.section) ?? [];
			list.push(doc);
			bySection.set(doc.section, list);
		}
		return [...bySection.entries()]
			.map(([key, docs]) => {
				const componentName = DOC_SECTIONS[key]?.component;
				return {
					key,
					label: sectionLabel(key),
					docs: docs.sort(compareDocs),
					component: componentName ? getComponent(componentName) : undefined,
				};
			})
			.sort((a, b) => {
				const ao = DOC_SECTIONS[a.key]?.order ?? 100;
				const bo = DOC_SECTIONS[b.key]?.order ?? 100;
				return ao !== bo ? ao - bo : a.label.localeCompare(b.label);
			});
	})();
	return cache;
}

export async function getAllDocs(): Promise<Doc[]> {
	return (await getDocSections()).flatMap((section) => section.docs);
}

/**
 * URL of a doc, for links written by hand in components. Fails the build when
 * the doc no longer exists, so a docs reorganisation in the eulix repo can't
 * leave dead links behind.
 */
export async function docUrl(id: string, hash = ''): Promise<string> {
	const doc = (await getAllDocs()).find((d) => d.id === id);
	if (!doc) throw new Error(`Link to missing doc "${id}". Update the link, or the doc moved in the eulix repo.`);
	return doc.href + hash;
}

export async function getNeighbours(id: string): Promise<{ prev?: Doc; next?: Doc }> {
	const all = await getAllDocs();
	const index = all.findIndex((doc) => doc.id === id);
	return { prev: all[index - 1], next: all[index + 1] };
}

export { ROOT_SECTION };
