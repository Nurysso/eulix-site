// Code highlighting theme built from the eulix-cli palette
// (eulix-cli/internal/utils/theme.go). Mostly greys, with the CLI's violet for
// keywords, teal for strings and gold for literals.

const c = {
	bg: '#0E1015',
	text: '#C9CED8',
	bright: '#E7E9EE', // TextColor
	muted: '#7C8798', // MutedColor
	quote: '#8B95A8', // QuoteColor
	dim: '#5B6478', // ReasoningColor
	teal: '#5EEAD4', // PrimaryColor
	violet: '#A78BFA', // SecondaryColor
	lilac: '#C4B5FD', // HighlightColor
	gold: '#F9E2AF', // CodeColor
	coral: '#F87171', // ErrorColor
	emerald: '#34D399', // SuccessColor
};

export const eulixShikiTheme = {
	name: 'eulix-mono',
	type: 'dark' as const,
	colors: {
		'editor.background': c.bg,
		'editor.foreground': c.text,
	},
	tokenColors: [
		{ settings: { foreground: c.text } },
		{
			scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
			settings: { foreground: c.dim, fontStyle: 'italic' },
		},
		{
			scope: ['keyword', 'keyword.control', 'storage', 'storage.type', 'storage.modifier', 'entity.name.tag'],
			settings: { foreground: c.violet },
		},
		{
			scope: ['keyword.operator', 'punctuation', 'meta.brace', 'punctuation.separator', 'punctuation.terminator'],
			settings: { foreground: c.muted },
		},
		{
			scope: ['string', 'string.quoted', 'string.template', 'string.unquoted', 'markup.inline.raw'],
			settings: { foreground: c.teal },
		},
		{
			scope: ['constant.numeric', 'constant.language', 'constant.character', 'constant.other', 'support.constant'],
			settings: { foreground: c.gold },
		},
		{
			scope: ['entity.name.function', 'support.function', 'meta.function-call.generic', 'variable.function'],
			settings: { foreground: c.bright },
		},
		{
			scope: [
				'entity.name.type',
				'entity.name.class',
				'entity.name.namespace',
				'support.type',
				'support.class',
				'entity.other.inherited-class',
			],
			settings: { foreground: c.lilac },
		},
		{
			scope: ['support.type.property-name', 'meta.object-literal.key', 'entity.name.tag.yaml', 'entity.name.tag.toml', 'support.type.property-name.toml'],
			settings: { foreground: c.lilac },
		},
		{ scope: ['entity.other.attribute-name'], settings: { foreground: c.teal } },
		{ scope: ['variable', 'variable.other', 'variable.parameter'], settings: { foreground: c.text } },
		{ scope: ['variable.language', 'variable.other.constant'], settings: { foreground: c.gold } },
		{ scope: ['markup.heading', 'entity.name.section'], settings: { foreground: c.violet, fontStyle: 'bold' } },
		{ scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
		{ scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
		{ scope: ['markup.inserted', 'meta.diff.header.to-file'], settings: { foreground: c.emerald } },
		{ scope: ['markup.deleted', 'meta.diff.header.from-file', 'invalid'], settings: { foreground: c.coral } },
		{ scope: ['markup.quote'], settings: { foreground: c.quote } },
	],
};
