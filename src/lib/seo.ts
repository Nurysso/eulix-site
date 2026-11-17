// JSON-LD (schema.org) builders for the <SEO> component. Only facts the site
// already states go in here: no ratings, prices or dates we can't back up.

import { SITE } from '../site.config.ts';
import { versionOf } from './components.ts';
import { withBase } from './doc-paths.ts';

type Ld = Record<string, unknown>;

const base = import.meta.env.BASE_URL;
const origin = import.meta.env.SITE ?? SITE.url;

/** Absolute URL for a path relative to the site root (`docs/` → https://…/eulix-site/docs/). */
export function absoluteUrl(path = ''): string {
	return new URL(withBase(base, path), origin).href;
}

const homeUrl = absoluteUrl();
const ids = {
	website: `${homeUrl}#website`,
	author: `${homeUrl}#author`,
	software: `${homeUrl}#software`,
};

/** The author and publisher: Nurysso, a person (not an Organization). */
export function authorLd(): Ld {
	return {
		'@type': 'Person',
		'@id': ids.author,
		name: 'Nurysso',
		url: 'https://github.com/Nurysso',
	};
}

export function websiteLd(): Ld {
	return {
		'@type': 'WebSite',
		'@id': ids.website,
		url: homeUrl,
		name: SITE.name,
		description: SITE.description,
		inLanguage: 'en',
		publisher: { '@id': ids.author },
	};
}

export function softwareLd(): Ld {
	const version = versionOf('eulix-cli').replace(/^v/, '');
	return {
		'@type': 'SoftwareApplication',
		'@id': ids.software,
		name: SITE.name,
		description: SITE.description,
		url: homeUrl,
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Linux, macOS, Windows',
		...(version && { softwareVersion: version }),
		license: `https://spdx.org/licenses/${SITE.license}.html`,
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		author: { '@id': ids.author },
		downloadUrl: `${SITE.repoUrl}/releases`,
		installUrl: absoluteUrl('docs/installation/'),
		sameAs: [SITE.repoUrl, SITE.crateUrl],
	};
}

/** Crumbs in order, home first. The last one is the current page. */
export function breadcrumbLd(crumbs: { name: string; path: string }[]): Ld {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: crumbs.map((c, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: c.name,
			item: absoluteUrl(c.path),
		})),
	};
}

export function techArticleLd(page: {
	headline: string;
	description?: string;
	path: string;
	section?: string;
	/** Names of the Eulix parts the page is about (PRISM, ETIYA, …). */
	about?: string[];
}): Ld {
	return {
		'@type': 'TechArticle',
		headline: page.headline.slice(0, 110),
		...(page.description && { description: page.description }),
		url: absoluteUrl(page.path),
		mainEntityOfPage: absoluteUrl(page.path),
		...(page.section && { articleSection: page.section }),
		inLanguage: 'en',
		author: { '@id': ids.author },
		publisher: { '@id': ids.author },
		isPartOf: { '@id': ids.website },
		about: [{ '@id': ids.software }, ...(page.about ?? []).map((name) => ({ '@type': 'Thing', name }))],
		image: absoluteUrl('og/eulix.png'),
	};
}

/** Wraps nodes in one @graph so `@id` references resolve across them. */
export function graph(nodes: Ld[]): Ld {
	return { '@context': 'https://schema.org', '@graph': nodes };
}
