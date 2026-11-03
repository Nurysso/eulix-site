// A slice of Eulix's own call graph, used in the hero.
//
// Taken from `.eulix/kb_call_graph.json` after running `eulix analyze` on this
// repository (index of 2026-10-31): the parser's analysis pipeline, with its one
// caller and seven callees. Line numbers point at the definitions in the source.

export interface GraphNode {
	name: string;
	file: string;
	line: number;
	tag?: string;
}

export const heroGraph: { focus: GraphNode; callers: GraphNode[]; callees: GraphNode[] } = {
	focus: { name: 'analyze_and_build', file: 'eulix-parser/src/analysis_pipeline.rs', line: 7 },
	callers: [{ name: 'main', file: 'eulix-parser/src/main.rs', line: 168 }],
	callees: [
		{ name: 'find_entry_points', file: 'libeulix/src/analyze/entry_points.rs', line: 13 },
		{ name: 'detect_patterns', file: 'libeulix/src/analyze/patterns.rs', line: 12 },
		{ name: 'build_call_graph', file: 'libeulix/src/analyze/call_graph/prism_v1.rs', line: 74, tag: 'v1' },
		{ name: 'resolve_call_locations', file: 'libeulix/src/analyze/call_graph/prism_v1.rs', line: 356, tag: 'v1' },
		{ name: 'populate_called_by', file: 'libeulix/src/analyze/call_graph/prism_v1.rs', line: 420, tag: 'v1' },
		{ name: 'build_call_graph_v2', file: 'libeulix/src/analyze/call_graph/prism_v2.rs', line: 823, tag: 'v2' },
		{ name: 'populate_called_by_from_graph', file: 'libeulix/src/analyze/call_graph/prism_v2.rs', line: 1274, tag: 'v2' },
	],
};

/** Questions the hero cycles through. Each one is answered without an LLM. */
export const heroQueries = [
	{ key: 'location', query: 'Where is analyze_and_build?', route: 'location' },
	{ key: 'callers', query: 'Who calls analyze_and_build?', route: 'call graph' },
	{ key: 'callees', query: 'Callees of analyze_and_build', route: 'call graph' },
] as const;
