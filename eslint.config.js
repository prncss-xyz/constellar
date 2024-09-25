import cspellPlugin from '@cspell/eslint-plugin'
import js from '@eslint/js'
import perfectionist from 'eslint-plugin-perfectionist'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const perf = ['warn', { type: 'natural' }]

export default tseslint.config({
	extends: [js.configs.recommended, ...tseslint.configs.recommended],
	files: ['**/*.{js,jsx,ts,tsx}'],
	ignores: ['**/dist/**', '**/coverage/**'],
	languageOptions: {
		ecmaVersion: 2022,
		globals: globals.browser,
	},
	plugins: {
		'@cspell': cspellPlugin,
		perfectionist,
		'react-hooks': reactHooks,
		'react-refresh': reactRefresh,
	},
	rules: {
		...reactHooks.configs.recommended.rules,
		'@cspell/spellchecker': [
			'warn',
			{
				cspell: {
					words: [
						'constellar',
						'elems',
						'fixstate',
						'Lamarche',
						'multistate',
						'prncss',
						'rambda',
						'removables',
						'substate',
						'tseslint',
					],
				},
			},
		],
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				argsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			},
		],
		'no-console': 'warn',
		'no-constant-condition': 'off',
		'no-else-return': 'warn',
		'no-empty': 'warn',
		'perfectionist/sort-array-includes': perf,
		'perfectionist/sort-classes': perf,
		'perfectionist/sort-enums': perf,
		'perfectionist/sort-exports': perf,
		'perfectionist/sort-imports': perf,
		'perfectionist/sort-interfaces': perf,
		'perfectionist/sort-intersection-types': perf,
		'perfectionist/sort-jsx-props': perf,
		'perfectionist/sort-maps': perf,
		'perfectionist/sort-named-exports': perf,
		'perfectionist/sort-named-imports': perf,
		'perfectionist/sort-object-types': perf,
		'perfectionist/sort-objects': perf,
		'perfectionist/sort-sets': perf,
		'perfectionist/sort-switch-case': perf,
		'perfectionist/sort-union-types': perf,
		'perfectionist/sort-variable-declarations': perf,
		'prefer-const': 'warn',
		'react-refresh/only-export-components': [
			'warn',
			{ allowConstantExport: true },
		],
	},
})
