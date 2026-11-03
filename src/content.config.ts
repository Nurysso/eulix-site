import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docIdFromPath } from './lib/doc-paths.ts';
import { SITE } from './site.config.ts';

// Every Markdown file in the repo's `docs/` folder becomes a page under /docs/.
// Frontmatter is optional: without it, the title comes from the first heading
// and the description from the first paragraph (see src/lib/docs.ts).
const docs = defineCollection({
	loader: glob({
		pattern: '**/*.md',
		base: SITE.docsDir,
		generateId: ({ entry }) => docIdFromPath(entry),
	}),
	schema: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		/** Shorter label for the sidebar. */
		sidebarLabel: z.string().optional(),
		/** Lower numbers come first within a section. */
		order: z.number().optional(),
		/** `draft: true` keeps a doc off the site. */
		draft: z.boolean().optional(),
	}),
});

export const collections = { docs };
