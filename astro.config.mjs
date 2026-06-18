// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://gauravagarwalgarg.github.io',
	base: '/Blog',
	integrations: [mdx(), sitemap()],
	markdown: {
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
		},
	},
	image: {
		service: { entrypoint: 'astro/assets/services/sharp' },
	},
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'viewport',
	},
});
