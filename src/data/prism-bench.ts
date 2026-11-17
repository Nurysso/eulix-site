// PRISM v1 vs v2 call-graph accuracy, from `uv run bench/callgraph/cg_eval.py`
// in the eulix repo. Each edge is checked against the language's own tooling
// (go/types, javac, jedi, rust-analyzer, the TS checker, libclang).

export type Lang = 'go' | 'java' | 'python' | 'rust' | 'ts' | 'js' | 'c' | 'cpp';

export const langLabel: Record<Lang, string> = {
	go: 'Go',
	java: 'Java',
	python: 'Python',
	rust: 'Rust',
	ts: 'TypeScript',
	js: 'JavaScript',
	c: 'C',
	cpp: 'C++',
};

/** Headline set: one project per language, as quoted in the eulix README. */
export const headline = {
	precisionV2: 98.6,
	precisionV1: 54.6,
	edgesV2: 6355,
	wrongV2: 87,
	edgesV1: 11153,
	wrongV1: 5060,
	projects: 8,
};

/** Pooled per language across all 24 corpora (3 per language). */
export const byLanguage: { lang: Lang; v1: { p: number; r: number }; v2: { p: number; r: number } }[] = [
	{ lang: 'java', v1: { p: 62.3, r: 48.0 }, v2: { p: 99.7, r: 94.2 } },
	{ lang: 'go', v1: { p: 67.5, r: 81.4 }, v2: { p: 100.0, r: 72.6 } },
	{ lang: 'python', v1: { p: 68.7, r: 67.1 }, v2: { p: 99.5, r: 79.5 } },
	{ lang: 'rust', v1: { p: 39.5, r: 41.4 }, v2: { p: 99.1, r: 38.3 } },
	{ lang: 'ts', v1: { p: 93.7, r: 95.3 }, v2: { p: 100.0, r: 82.7 } },
	{ lang: 'c', v1: { p: 99.8, r: 84.4 }, v2: { p: 99.8, r: 84.9 } },
	{ lang: 'js', v1: { p: 95.4, r: 55.6 }, v2: { p: 92.7, r: 66.9 } },
	{ lang: 'cpp', v1: { p: 64.6, r: 31.5 }, v2: { p: 75.3, r: 56.1 } },
];

type Row = { name: string; lang: Lang; tp: number; fp: number; p: number; r: number; f1: number };

/** Every corpus, PRISM v2. */
export const corpora: Row[] = [
	{ name: 'gin', lang: 'go', tp: 1603, fp: 0, p: 100.0, r: 66.3, f1: 79.8 },
	{ name: 'chi', lang: 'go', tp: 511, fp: 0, p: 100.0, r: 57.3, f1: 72.9 },
	{ name: 'cobra', lang: 'go', tp: 1396, fp: 0, p: 100.0, r: 91.4, f1: 95.5 },
	{ name: 'gson', lang: 'java', tp: 1059, fp: 0, p: 100.0, r: 97.3, f1: 98.7 },
	{ name: 'jsoup', lang: 'java', tp: 3441, fp: 14, p: 99.6, r: 93.9, f1: 96.7 },
	{ name: 'commons-cli', lang: 'java', tp: 575, fp: 0, p: 100.0, r: 90.8, f1: 95.2 },
	{ name: 'flask', lang: 'python', tp: 165, fp: 3, p: 98.2, r: 74.0, f1: 84.4 },
	{ name: 'click', lang: 'python', tp: 406, fp: 1, p: 99.8, r: 76.5, f1: 86.6 },
	{ name: 'requests', lang: 'python', tp: 227, fp: 0, p: 100.0, r: 90.8, f1: 95.2 },
	{ name: 'ripgrep', lang: 'rust', tp: 1645, fp: 20, p: 98.8, r: 34.3, f1: 50.9 },
	{ name: 'serde_json', lang: 'rust', tp: 571, fp: 2, p: 99.7, r: 49.0, f1: 65.7 },
	{ name: 'fd', lang: 'rust', tp: 282, fp: 0, p: 100.0, r: 50.5, f1: 67.1 },
	{ name: 'class-validator', lang: 'ts', tp: 364, fp: 0, p: 100.0, r: 90.3, f1: 94.9 },
	{ name: 'class-transformer', lang: 'ts', tp: 27, fp: 0, p: 100.0, r: 39.1, f1: 56.2 },
	{ name: 'immer', lang: 'ts', tp: 154, fp: 0, p: 100.0, r: 82.3, f1: 90.3 },
	{ name: 'axios', lang: 'js', tp: 270, fp: 25, p: 91.5, r: 82.8, f1: 87.0 },
	{ name: 'markdown-it', lang: 'js', tp: 62, fp: 0, p: 100.0, r: 88.6, f1: 93.9 },
	{ name: 'mocha', lang: 'js', tp: 189, fp: 16, p: 92.2, r: 49.4, f1: 64.3 },
	{ name: 'cJSON', lang: 'c', tp: 812, fp: 0, p: 100.0, r: 99.8, f1: 99.9 },
	{ name: 'zlib', lang: 'c', tp: 283, fp: 7, p: 97.6, r: 86.8, f1: 91.9 },
	{ name: 'lua', lang: 'c', tp: 2744, fp: 0, p: 100.0, r: 81.1, f1: 89.6 },
	{ name: 'tinyxml2', lang: 'cpp', tp: 350, fp: 39, p: 90.0, r: 56.0, f1: 69.0 },
	{ name: 'pugixml', lang: 'cpp', tp: 86, fp: 0, p: 100.0, r: 54.8, f1: 70.8 },
	{ name: 'yaml-cpp', lang: 'cpp', tp: 562, fp: 288, p: 66.1, r: 56.4, f1: 60.9 },
];

export const corpusTotals = corpora.reduce(
	(acc, c) => ({ tp: acc.tp + c.tp, fp: acc.fp + c.fp }),
	{ tp: 0, fp: 0 },
);
