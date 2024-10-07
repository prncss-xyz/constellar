import type * as Preset from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'

import { themes as prismThemes } from 'prism-react-renderer'

const config: Config = {
	baseUrl: '/constellar/',
	favicon: 'img/favicon.ico',
	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
	},
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'prncss-xyz', // Usually your GitHub org/user name.
	presets: [
		[
			'classic',
			{
				blog: false,
				docs: {
					sidebarPath: './sidebars.ts',
				},
				theme: {
					customCss: './src/css/custom.css',
				},
			} satisfies Preset.Options,
		],
	],

	projectName: 'constellar', // Usually your repo name.
	tagline: 'State Manipulation Primitives as Pure Functions',

	themeConfig: {
		footer: {
			copyright: `Copyright © ${new Date().getFullYear()} Juliette Lamarche. Built with Docusaurus.`,
			links: [
				{
					items: [
						{
							label: 'Docs',
							to: '/docs/concepts',
						},
						{
							label: 'About Me',
							to: 'https://prncss-xyz.github.io/portefolio/about',
						},
						{
							href: 'https://github.com/prncss-xyz/constellar',
							label: 'GitHub',
						},
						{
							href: 'https://www.npmjs.com/search?q=%40constellar',
							label: 'NPM',
						},
					],
				},
			],
			style: 'dark',
		},
		// Replace with your project's social card
		image: 'img/docusaurus-social-card.jpg',
		navbar: {
			items: [
				{
					label: 'Docs',
					position: 'left',
					sidebarId: 'tutorialSidebar',
					type: 'docSidebar',
				},
				{
					href: 'https://github.com/prncss-xyz/constellar',
					label: 'GitHub',
					position: 'right',
				},
			],
			title: 'Constellar',
		},
		prism: {
			darkTheme: prismThemes.dracula,
			theme: prismThemes.github,
		},
	} satisfies Preset.ThemeConfig,

	title: 'Constellar',

	url: 'https://prncss-xyz.github.io',
}

export default config
