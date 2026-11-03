import { COMPONENTS, type ComponentConfig } from '../site.config.ts';

export interface Component extends Omit<ComponentConfig, 'version'> {
	/** Version read from the component's source at build time. */
	versionText?: string;
}

const versions: Record<string, string> = __EULIX_VERSIONS__;

export const components: Component[] = COMPONENTS.map(({ version: _source, ...rest }) => ({
	...rest,
	versionText: versions[rest.name],
}));

export function getComponent(name: string): Component | undefined {
	return components.find((c) => c.name === name);
}

/** `v0.8.4`, or an empty string when the version is unknown. */
export function versionOf(name: string): string {
	const v = versions[name];
	return v ? `v${v}` : '';
}
