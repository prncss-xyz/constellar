import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [dts({ include: ['src'] })],
	test: {
		include: ['src/**/*.test.{js,ts,jsx,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'clover', 'lcov'],
		},
		globals: true,
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
	build: {
		copyPublicDir: false,
		sourcemap: true,
		emptyOutDir: true,
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			fileName: 'index',
			formats: ['es'],
		},
		rollupOptions: {
			external: ['@constellar/utils'],
		},
	},
})
