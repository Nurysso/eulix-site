// Data for the routing demo. Every value comes from Eulix's own repository:
//
//  - Direct answers: what the router's handlers read from `.eulix/` after
//    `eulix analyze` on this repo (kb_index.json, kb_call_graph.json,
//    kb_metrics.json). The four callers below match a grep of the source.
//  - Context windows: the chunks the etiya engine returned for these exact
//    questions in the eval baseline (eulix-cli/eitya_eval_results_baseline.json,
//    `scripts/eval_mcp.py` through `eulix mcp`). The expected file ranked first
//    in both runs.
//  - Budgets: allocateBudget (query/retrieval/intent.go) with max_tokens 8192:
//    8192 − 130 system − (query/4 + 10) − 2048 response reserve.
//  - Token totals are estimates at 4 characters per token, Eulix's own
//    estimator, over the returned line ranges.

export type Route = 'location' | 'usage' | 'callgraph' | 'metrics' | 'llm';

interface Base {
	key: string;
	query: string;
	route: Route;
	/** What the classifier decided, in plain words. */
	decision: string;
}

export interface DirectExample extends Base {
	route: Exclude<Route, 'llm'>;
	source: string;
	title: string;
	lines: { label?: string; value: string; mono?: boolean }[];
}

export interface ContextExample extends Base {
	route: 'llm';
	engine: 'etiya';
	budget: number;
	estTokens: number;
	chunkCount: number;
	chunkCap: number;
	fileCount: number;
	/** Top of the ranked context window, as returned. */
	chunks: { file: string; lines: [number, number] }[];
	note: string;
}

export type DemoExample = DirectExample | ContextExample;

const FOCUS = 'extractExplicitAnchors';
const FOCUS_FILE = 'eulix-cli/internal/query/retrieval/search.go';

export const routingExamples: DemoExample[] = [
	{
		key: 'location',
		query: `Where is ${FOCUS}?`,
		route: 'location',
		decision: 'location lookup',
		source: 'kb_index.json · functions_by_name',
		title: `Function '${FOCUS}' defined at`,
		lines: [{ value: `${FOCUS_FILE}:1211`, mono: true }],
	},
	{
		key: 'usage',
		query: `What uses ${FOCUS}?`,
		route: 'usage',
		decision: 'usage lookup',
		source: 'kb_index.json + signature read from source',
		title: `Usage of '${FOCUS}'`,
		lines: [
			{ value: `${FOCUS_FILE}:1211`, mono: true },
			{ value: `func ${FOCUS}(query string) []ExplicitAnchor`, mono: true },
		],
	},
	{
		key: 'callgraph',
		query: `Who calls ${FOCUS}?`,
		route: 'callgraph',
		decision: 'call-graph lookup',
		source: 'kb_call_graph.json',
		title: `Call graph: ${FOCUS} · fan-in 4 · fan-out 0`,
		lines: [
			{ label: '←', value: 'buildContextInternal  builder.go:91', mono: true },
			{ label: '←', value: 'multiStrategySearch   search.go:131', mono: true },
			{ label: '←', value: 'EhnasSearch           ehnas_search.go:42', mono: true },
			{ label: '←', value: 'extractAnchorEntities anchors.go:87', mono: true },
			{ label: '→', value: 'calls nothing (leaf function)' },
		],
	},
	{
		key: 'metrics',
		query: 'What are the project metrics?',
		route: 'metrics',
		decision: 'metrics lookup',
		source: 'kb_metrics.json',
		title: 'Project metrics: EulixClaude',
		lines: [
			{ label: 'Files', value: '214' },
			{ label: 'Total LOC', value: '70,775' },
			{ label: 'Functions', value: '1,163' },
			{ label: 'Languages', value: 'go, rust, python' },
			{ label: 'Most complex', value: 'auto_tag_function · python.rs · 99', mono: true },
		],
	},
	{
		key: 'mcp-idle',
		query: 'How does the MCP server release the context builder after being idle',
		route: 'llm',
		decision: 'needs reasoning',
		engine: 'etiya',
		budget: 5987,
		estTokens: 5819,
		chunkCount: 30,
		chunkCap: 30,
		fileCount: 13,
		chunks: [
			{ file: 'eulix-cli/internal/mcp/strategy_memory.go', lines: [28, 41] },
			{ file: 'eulix-cli/internal/mcp/server.go', lines: [179, 269] },
			{ file: 'eulix-cli/internal/mcp/strategy.go', lines: [144, 181] },
			{ file: 'eulix-cli/internal/mcp/strategy_lexical.go', lines: [48, 54] },
			{ file: 'eulix-cli/internal/mcp/helpers.go', lines: [107, 176] },
			{ file: 'eulix-cli/internal/mcp/server.go', lines: [53, 77] },
		],
		note: 'Filled to the token budget.',
	},
	{
		key: 'parser-spill',
		query: 'How does the parser spill intermediate results to disk',
		route: 'llm',
		decision: 'needs reasoning',
		engine: 'etiya',
		budget: 5991,
		estTokens: 2769,
		chunkCount: 30,
		chunkCap: 30,
		fileCount: 22,
		chunks: [
			{ file: 'eulix-parser/src/spill.rs', lines: [36, 39] },
			{ file: 'eulix-parser/src/parse/directory.rs', lines: [20, 23] },
			{ file: 'eulix-parser/src/memory.rs', lines: [4, 13] },
			{ file: 'eulix-parser/src/spill.rs', lines: [16, 20] },
			{ file: 'eulix-parser/src/views.rs', lines: [15, 15] },
			{ file: 'eulix-parser/src/views.rs', lines: [135, 137] },
		],
		note: 'Stopped at the chunk cap before the token budget.',
	},
];

/** etiya's LLM-path stages, lit in order by the demo. */
export const etiyaSteps = ['embed query', 'semantic + lexical channels', 'call-graph expansion', 'query MMR + budget'];
