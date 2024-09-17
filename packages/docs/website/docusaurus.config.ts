import type * as Preset from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'
import { themes as prismThemes } from 'prism-react-renderer'

const config: Config = {
	title: 'Constellar',
	tagline: 'State Manipulation Primitives as Pure Functions',
	favicon: 'img/favicon.ico',
	url: 'https://prncss-xyz.github.io',
	baseUrl: '/constellar/',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'prncss-xyz', // Usually your GitHub org/user name.
	projectName: 'constellar', // Usually your repo name.

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
	},

	presets: [
		[
			'classic',
			{
				docs: {
					sidebarPath: './sidebars.ts',
				},
				blog: false,
				theme: {
					customCss: './src/css/custom.css',
				},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		// Replace with your project's social card
		image: 'img/docusaurus-social-card.jpg',
		navbar: {
			title: 'Constellar',
			items: [
				{
					type: 'docSidebar',
					sidebarId: 'tutorialSidebar',
					position: 'left',
					label: 'Docs',
				},
				{
					href: 'https://github.com/prncss-xyz/constellar',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		footer: {
			style: 'dark',
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
							label: 'GitHub',
							href: 'https://github.com/prncss-xyz/constellar',
						},
						{
							label: 'NPM',
							href: 'https://www.npmjs.com/search?q=%40constellar',
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} Juliette Lamarche. Built with Docusaurus.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
}

export default config
