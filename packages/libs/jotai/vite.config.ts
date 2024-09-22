import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [dts({ include: ['src'], rollupTypes: true })],
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.test.{js,ts,jsx,tsx}'],
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
		rollupOptions: {
			external: ['jotai', 'react', '@constellar/core'],
		},
	},
})
