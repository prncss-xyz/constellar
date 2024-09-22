import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [dts({ include: ['src'], rollupTypes: true })],
	test: {
		include: ['src/**/*.test.{js,ts,jsx,tsx}'],
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'clover', 'lcov'],
			include: ['src/**/*.{js,ts,jsx,tsx}'],
			exclude: ['src/index.ts', 'src/**/*.test.{js,ts,jsx,tsx}'],
		},
	},
	build: {
		copyPublicDir: false,
		sourcemap: true,
		emptyOutDir: true,
		lib: {
			entry: 'src/index.ts',
			formats: ['es', 'cjs'],
			fileName: 'index',
		},
	},
})
