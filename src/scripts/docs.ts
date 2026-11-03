// Docs page behaviours: mobile menu, code copy buttons, heading anchors,
// table-of-contents highlighting, and Mermaid diagrams.

import checkSvg from '@phosphor-icons/core/assets/regular/check.svg?raw';
import copySvg from '@phosphor-icons/core/assets/regular/copy.svg?raw';
import expandSvg from '@phosphor-icons/core/assets/regular/corners-out.svg?raw';
import closeSvg from '@phosphor-icons/core/assets/regular/x.svg?raw';

function setupMenu() {
	const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
	const sidebar = document.getElementById('docs-sidebar');
	if (!toggle || !sidebar) return;
	toggle.addEventListener('click', () => {
		const open = toggle.getAttribute('aria-expanded') !== 'true';
		toggle.setAttribute('aria-expanded', String(open));
		sidebar.dataset.open = String(open);
	});
}

const icon = (svg: string, className: string) =>
	svg.replace('<svg ', `<svg class="${className}" width="16" height="16" aria-hidden="true" `);
const COPY_ICON = icon(copySvg, 'icon-copy');
const CHECK_ICON = icon(checkSvg, 'icon-check');

function setupCodeBlocks() {
	document.querySelectorAll<HTMLPreElement>('.prose pre:not(.mermaid)').forEach((pre) => {
		if (pre.parentElement?.classList.contains('code-block')) return;
		const wrapper = document.createElement('div');
		wrapper.className = 'code-block';
		const lang = pre.dataset.language;
		if (lang && lang !== 'plaintext' && lang !== 'text') wrapper.dataset.lang = lang;
		pre.replaceWith(wrapper);
		wrapper.append(pre);

		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'copy-btn code-copy';
		button.setAttribute('aria-label', 'Copy code');
		button.dataset.copy = pre.innerText.replace(/\n$/, '');
		button.innerHTML = COPY_ICON + CHECK_ICON;
		wrapper.append(button);
	});
}

function setupAnchors() {
	document.querySelectorAll<HTMLHeadingElement>('.prose :is(h2, h3, h4)[id]').forEach((heading) => {
		const link = document.createElement('a');
		link.className = 'heading-anchor';
		link.href = `#${heading.id}`;
		link.setAttribute('aria-label', `Link to “${heading.textContent?.trim() ?? 'this section'}”`);
		link.textContent = '#';
		heading.append(link);
	});
}

function setupTocSpy() {
	const links = new Map<string, HTMLAnchorElement>();
	document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]').forEach((a) => {
		links.set(a.dataset.tocLink!, a);
	});
	if (!links.size) return;
	const headings = [...links.keys()]
		.map((id) => document.getElementById(id))
		.filter((el): el is HTMLElement => el !== null);

	let active: HTMLAnchorElement | undefined;
	const update = () => {
		const offset = 120;
		let current = headings[0];
		for (const heading of headings) {
			if (heading.getBoundingClientRect().top - offset <= 0) current = heading;
			else break;
		}
		const next = current ? links.get(current.id) : undefined;
		if (next === active) return;
		active?.classList.remove('is-active');
		next?.classList.add('is-active');
		active = next;
	};
	let queued = false;
	window.addEventListener(
		'scroll',
		() => {
			if (queued) return;
			queued = true;
			requestAnimationFrame(() => {
				queued = false;
				update();
			});
		},
		{ passive: true },
	);
	update();
}

async function setupMermaid() {
	const blocks = document.querySelectorAll<HTMLElement>('pre.mermaid');
	if (!blocks.length) return;
	const { default: mermaid } = await import('mermaid');
	mermaid.initialize({
		startOnLoad: false,
		securityLevel: 'strict',
		theme: 'base',
		fontFamily: "'Geist Mono Variable', ui-monospace, monospace",
		themeVariables: {
			darkMode: true,
			fontSize: '13px',
			background: '#0e1015',
			primaryColor: '#13161c',
			primaryTextColor: '#e7e9ee',
			primaryBorderColor: '#2a3142',
			secondaryColor: '#161a22',
			secondaryTextColor: '#e7e9ee',
			secondaryBorderColor: '#2a3142',
			tertiaryColor: '#0f1116',
			tertiaryTextColor: '#b4bac6',
			tertiaryBorderColor: '#2a3142',
			lineColor: '#7c8798',
			textColor: '#b4bac6',
			mainBkg: '#13161c',
			nodeBorder: '#2a3142',
			clusterBkg: '#0f1116',
			clusterBorder: '#2a3142',
			titleColor: '#a78bfa',
			edgeLabelBackground: '#0e1015',
			noteBkgColor: '#1e1b4b',
			noteTextColor: '#e7e9ee',
			noteBorderColor: '#a78bfa',
			actorBkg: '#13161c',
			actorBorder: '#5eead4',
			actorTextColor: '#e7e9ee',
			actorLineColor: '#5b6478',
			signalColor: '#b4bac6',
			signalTextColor: '#e7e9ee',
			labelBoxBkgColor: '#13161c',
			labelBoxBorderColor: '#2a3142',
			labelTextColor: '#e7e9ee',
			loopTextColor: '#b4bac6',
			activationBkgColor: '#1e1b4b',
			activationBorderColor: '#a78bfa',
			sequenceNumberColor: '#0a0b0e',
		},
	});
	try {
		await mermaid.run({ nodes: [...blocks], suppressErrors: true });
	} catch (error) {
		console.warn('Mermaid could not render a diagram', error);
	}
	blocks.forEach((block) => {
		const figure = block.closest<HTMLElement>('.diagram');
		if (!figure) return;
		figure.classList.add('is-rendered');
		const svg = block.querySelector('svg');
		if (svg) addExpandButton(figure, svg);
	});
}

/** Wide diagrams are shrunk to fit the column; this opens one at full size. */
function addExpandButton(figure: HTMLElement, svg: SVGSVGElement) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'diagram-expand';
	button.innerHTML = `${icon(expandSvg, 'icon')}<span>Expand</span>`;
	button.setAttribute('aria-label', 'Open diagram at full size');
	figure.append(button);

	button.addEventListener('click', () => {
		const dialog = document.createElement('dialog');
		dialog.className = 'diagram-dialog';
		dialog.setAttribute('aria-label', 'Diagram');

		const close = document.createElement('button');
		close.type = 'button';
		close.className = 'diagram-close';
		close.setAttribute('aria-label', 'Close diagram');
		close.innerHTML = icon(closeSvg, 'icon');
		close.addEventListener('click', () => dialog.close());

		const body = document.createElement('div');
		body.className = 'diagram-dialog-body';
		const copy = svg.cloneNode(true) as SVGSVGElement;
		const naturalWidth = Number.parseFloat(svg.style.maxWidth) || svg.viewBox.baseVal.width;
		copy.style.maxWidth = 'none';
		if (naturalWidth) copy.setAttribute('width', String(Math.max(naturalWidth, 960)));
		copy.removeAttribute('height');
		body.append(copy);

		dialog.append(close, body);
		dialog.addEventListener('click', (event) => {
			if (event.target === dialog) dialog.close();
		});
		dialog.addEventListener('close', () => {
			dialog.remove();
			button.focus();
		});
		document.body.append(dialog);
		dialog.showModal();
	});
}

setupMenu();
setupCodeBlocks();
setupAnchors();
setupTocSpy();
void setupMermaid();
