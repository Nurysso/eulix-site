// Small, page-wide behaviours: scroll reveals and copy-to-clipboard buttons.

function setupReveal() {
	const items = document.querySelectorAll<HTMLElement>('.reveal');
	if (!items.length) return;
	if (!('IntersectionObserver' in window)) {
		items.forEach((el) => el.classList.add('is-visible'));
		return;
	}
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		},
		{ rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
	);
	items.forEach((el) => observer.observe(el));
}

async function writeClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}

function setupCopy() {
	document.addEventListener('click', async (event) => {
		const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy]');
		if (!button) return;
		const text = button.dataset.copy ?? '';
		if (!(await writeClipboard(text))) return;
		const original = button.getAttribute('aria-label') ?? 'Copy';
		button.dataset.copied = 'true';
		button.setAttribute('aria-label', 'Copied');
		window.setTimeout(() => {
			button.dataset.copied = 'false';
			button.setAttribute('aria-label', original);
		}, 1600);
	});
}

setupReveal();
setupCopy();
