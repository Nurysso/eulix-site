// Reads each component's version from its own source files at build time, so
// the site never shows a stale version. Runs in astro.config.ts (Node), and the
// result reaches pages through Vite's `define` as __EULIX_VERSIONS__.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ComponentConfig } from '../site.config.ts';

export function readVersions(repoRoot: string, components: ComponentConfig[]): Record<string, string> {
	const versions: Record<string, string> = {};
	for (const component of components) {
		const source = component.version;
		if (!source) continue;
		if ('fallback' in source) {
			versions[component.name] = source.fallback;
			continue;
		}
		try {
			const match = readFileSync(join(repoRoot, source.file), 'utf8').match(source.pattern);
			if (match?.[1]) versions[component.name] = match[1];
		} catch {
			// File moved or missing: show the component without a version.
		}
	}
	return versions;
}
