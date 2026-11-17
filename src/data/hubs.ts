// Landing pages for the named parts of Eulix: /prism/, /etiya/, /ehnas/.
// The docs for each live in the eulix repo under their component's folder;
// these pages give each name its own URL and link out to those docs.
// Every claim here comes from the docs linked in `docs`.

import { headline } from './prism-bench.ts';

export type HubSlug = 'prism' | 'etiya' | 'ehnas';

export interface HubSection {
	heading: string;
	paragraphs?: string[];
	list?: { term: string; text: string }[];
	ordered?: string[];
}

export interface Hub {
	slug: HubSlug;
	name: string;
	expansion: string;
	/** Whole <title>; includes "Eulix" so "prism eulix" style searches match. */
	seoTitle: string;
	description: string;
	h1: string;
	lead: string;
	facts: { label: string; value: string }[];
	sections: HubSection[];
	config?: string;
	/** Doc ids, in reading order. Checked at build time. */
	docs: { id: string; label: string; note: string }[];
	/** Where this part shows up on the home page. */
	homeAnchor: string;
}

export const HUBS: Hub[] = [
	{
		slug: 'prism',
		name: 'PRISM',
		expansion: 'Polyglot Resolution via Inverted Symbol Map',
		seoTitle: 'PRISM: polyglot call graphs in Eulix (libeulix)',
		description:
			'PRISM builds the call graph in Eulix. It links each call to the definition it most likely means from scopes and imports, with no type checker, across languages.',
		h1: 'PRISM, the call-graph builder in Eulix',
		lead: 'PRISM is the part of libeulix that decides, for every call in your code, which function it calls. It works from syntax alone, with no build step and no type checker, so it runs on large repositories that mix languages.',
		facts: [
			{ label: 'Full name', value: 'Polyglot Resolution via Inverted Symbol Map' },
			{ label: 'Part of', value: 'libeulix (Rust)' },
			{ label: 'Versions', value: 'v2, scope-aware and the default; v1, name-only and fastest' },
			{
				label: 'Checked against',
				value: 'go/types, javac, jedi, rust-analyzer, the TypeScript checker and libclang',
			},
		],
		sections: [
			{
				heading: 'What PRISM does',
				paragraphs: [
					'A call graph records which function calls which. Eulix uses it to answer caller and callee questions straight from the index, and to pull related code into retrieval.',
					'Getting every edge right usually takes a full type checker for each language, which is slow and often unavailable. PRISM keeps an index from every name to its definitions instead (the inverted symbol map) and resolves each call with a lookup.',
				],
			},
			{
				heading: 'How PRISM v2 picks a target',
				paragraphs: ['For a call to a name, v2 looks for a definition in this order and stops at the first match:'],
				ordered: [
					'the same file;',
					'the files that file imports;',
					'the same directory;',
					'the whole project, but only when few definitions share the name.',
				],
			},
			{
				heading: 'Methods, and when it declines to guess',
				paragraphs: [
					'For a method call such as self.validate(), v2 starts at the method’s own class and walks up through its parent classes.',
					'When a name is shared by too many definitions to guess responsibly, PRISM draws no edge at all. A missing edge misleads retrieval less than a wrong one.',
				],
			},
			{
				heading: 'v1 and v2',
				paragraphs: [
					'PRISM v1 links every call to the first definition with that name. It is the fastest option and uses little memory on very large repositories, at the cost of wrong edges on common names like run or handle. v2 adds scope, imports and class hierarchy, and is the default.',
				],
			},
			{
				heading: 'How accurate it is',
				paragraphs: [
					`On eight projects, one per language, ${headline.precisionV2}% of the edges PRISM v2 drew were correct, against ${headline.precisionV1}% for v1. Each edge was checked against the call sites the language’s own compiler tooling resolves.`,
					'Recall is the trade-off: v2 skips calls whose receiver type isn’t written in the source, so Rust and C++ miss more edges than they get wrong.',
				],
			},
		],
		docs: [
			{ id: 'libeulix/prism-v2', label: 'PRISM v2', note: 'The default resolver: the scope ladder, receivers and PHP rules.' },
			{ id: 'libeulix/prism-v1', label: 'PRISM v1', note: 'The name-only resolver and when it is the right choice.' },
			{
				id: 'libeulix/call-graph-accuracy',
				label: 'Call-graph accuracy',
				note: 'Precision and recall per language, and how they were measured.',
			},
			{
				id: 'libeulix/research/prism-v2-methodology',
				label: 'PRISM v2 methodology',
				note: 'The formal write-up, with the full maths.',
			},
			{ id: 'known-issues/parser-and-prism', label: 'Parser and PRISM issues', note: 'Open problems and workarounds.' },
			{ id: 'libeulix/overview', label: 'libeulix overview', note: 'The Rust analysis engine PRISM is part of.' },
		],
		homeAnchor: '#prism',
	},
	{
		slug: 'etiya',
		name: 'ETIYA',
		expansion: 'Embedding-aware Topological Indexing for Your Architecture',
		seoTitle: 'ETIYA: the semantic retrieval engine in Eulix',
		description:
			'ETIYA is the default retrieval engine in Eulix. It adds embedding search to exact, keyword and call-graph search to find code worded unlike your question.',
		h1: 'ETIYA, the default retrieval engine in Eulix',
		lead: 'ETIYA is one of the two retrieval engines in eulix-cli, and the default. It runs the same exact-match, keyword and call-graph strategies as EHNAS, and adds a search over embeddings so a question can reach code that shares none of its words.',
		facts: [
			{ label: 'Full name', value: 'Embedding-aware Topological Indexing for Your Architecture' },
			{ label: 'Part of', value: 'eulix-cli (Go)' },
			{ label: 'Status', value: 'Beta, and the default engine' },
			{
				label: 'Needs',
				value: 'embeddings.bin and vectors.bin from eulix analyze, and the local embedding helper at query time',
			},
		],
		sections: [
			{
				heading: 'What ETIYA does',
				paragraphs: [
					'Every question first goes through the strategies both engines share: exact symbol matches, partial matches, keywords and the call graph.',
					'ETIYA also embeds the question through the local embedding helper and compares it with the stored chunk vectors by cosine similarity, using an IVF index on large projects. That finds code for questions worded nothing like the code. The semantic step is skipped for callers and callees questions, which the call graph answers exactly.',
				],
			},
			{
				heading: 'How it selects context',
				paragraphs: [
					'Candidates are picked with query-aware MMR (Maximal Marginal Relevance): each pick weighs relevance to the question against overlap with what is already chosen, so the context window isn’t filled with near-duplicates.',
					'If embeddings.bin is missing, ETIYA falls back to keyword-only retrieval and says so in the debug log, because a silent fallback would look exactly like a quality regression.',
				],
			},
			{
				heading: 'ETIYA or EHNAS?',
				paragraphs: [
					'ETIYA is the default, and the engine existing projects were built and tuned with. Pick EHNAS for huge repositories, for machines with no network or embedder, or when you need scores you can recompute exactly. Both read the same chunk store, so switching is one line in eulix.toml.',
				],
			},
		],
		config: '[project]\nengine = "etiya"',
		docs: [
			{
				id: 'eulix-cli/query/retrieval/engines',
				label: 'Retrieval engines: ETIYA and EHNAS',
				note: 'How the two engines differ and how to choose.',
			},
			{
				id: 'eulix-cli/query/retrieval/search-pipeline',
				label: 'Search pipeline',
				note: 'The shared strategies, ETIYA’s semantic search and query-aware MMR.',
			},
			{ id: 'eulix-cli/embeddings', label: 'Embeddings', note: 'The embedding helper ETIYA starts.' },
			{ id: 'eulix-embed/overview', label: 'eulix-embed', note: 'The pipeline that builds the vectors ETIYA searches.' },
			{
				id: 'eulix-cli/query/retrieval/index-loading',
				label: 'Index loading',
				note: 'What each engine loads at start-up.',
			},
			{ id: 'known-issues/embeddings', label: 'Embedding issues', note: 'Known problems and workarounds.' },
		],
		homeAnchor: '#engines',
	},
	{
		slug: 'ehnas',
		name: 'EHNAS',
		expansion: 'Exact · Hierarchical · Node · Structure',
		seoTitle: 'EHNAS: code retrieval without embeddings in Eulix',
		description:
			'EHNAS is the Eulix retrieval engine that needs no embeddings, GPU or network. Twin search, a graph walk and novelty packing find code deterministically.',
		h1: 'EHNAS, retrieval without embeddings in Eulix',
		lead: 'EHNAS is the second retrieval engine in eulix-cli. It meets the same need as vector search, reaching code that shares no words with your question, without running a model at query time. Every score in its core path can be recomputed from source metadata.',
		facts: [
			{ label: 'Full name', value: 'Exact · Hierarchical · Node · Structure' },
			{ label: 'Part of', value: 'eulix-cli (Go)' },
			{ label: 'Status', value: 'Beta' },
			{ label: 'Needs', value: 'No embeddings, no GPU and no outbound calls at query time' },
		],
		sections: [
			{
				heading: 'Why it exists',
				paragraphs: [
					'Vector search is the usual bridge between a question and code that uses different words, but why a chunk ranks high is then a fact about a model’s internals. EHNAS was built to meet the same need deterministically, so “why was this retrieved?” always has an answer you can check.',
				],
			},
			{
				heading: 'Three layers on a deterministic core',
				paragraphs: [
					'The core is deterministic: exact matching, a path gate, subsystem boosting and scope demotion. At the scale of millions of lines, EHNAS adds one layer for each problem the core can’t solve:',
				],
				list: [
					{
						term: 'Twin search',
						text: 'Chunks with the same structural signature in another language are scored together, so logic ported between languages is found even with no shared words.',
					},
					{
						term: 'Monte Carlo walk',
						text: '256 walkers start from the strongest hits and move over symbol, call-graph and word links. Common symbols end walks sooner, and the cost per query stays about the same whatever the repository size.',
					},
					{
						term: 'Novelty packing',
						text: 'As the context window fills, blocks that repeat symbols already picked count for less, so the window isn’t spent on near-duplicate boilerplate.',
					},
				],
			},
			{
				heading: 'How it selects context',
				paragraphs: [
					'EHNAS selects with structural MMR: redundancy is measured from the code itself (shared symbols, nearby lines) rather than from the question. Each layer reports its contribution separately in the debug trace, so the deterministic part of any score can always be recovered.',
				],
			},
			{
				heading: 'When to pick EHNAS',
				paragraphs: [
					'Huge repositories, machines with no network or embedder, and cases where you need reproducible scoring. With EHNAS, chat and mcp start without launching the embedding helper.',
				],
			},
		],
		config: '[project]\nengine = "ehnas"',
		docs: [
			{
				id: 'eulix-cli/query/retrieval/engines',
				label: 'Retrieval engines: ETIYA and EHNAS',
				note: 'How the two engines differ and how to choose.',
			},
			{
				id: 'eulix-cli/query/retrieval/ehnas-augmentation',
				label: 'EHNAS augmentation layers',
				note: 'Twin search, the walk, novelty packing and structural MMR in detail.',
			},
			{
				id: 'eulix-cli/query/retrieval/search-pipeline',
				label: 'Search pipeline',
				note: 'The deterministic core both engines share.',
			},
			{ id: 'eulix-cli/query/retrieval/overview', label: 'Retrieval overview', note: 'The whole retrieval pipeline.' },
			{ id: 'eulix-cli/config', label: 'Config', note: 'The engine setting and per-engine overrides.' },
			{ id: 'known-issues/retrieval-and-query', label: 'Retrieval and query issues', note: 'Known problems and workarounds.' },
		],
		homeAnchor: '#engines',
	},
];

/** Hubs that a doc belongs to, for the "part of" link on doc pages. */
export function hubsForDoc(id: string): Hub[] {
	return HUBS.filter((hub) => hub.docs.some((d) => d.id === id));
}
