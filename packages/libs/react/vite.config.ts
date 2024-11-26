import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		copyPublicDir: false,
		emptyOutDir: true,
		lib: {
			entry: 'src/index.ts',
			fileName: 'index',
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			external: ['react', '@constellar/core'],
		},
		sourcemap: true,
	},
	plugins: [dts({ include: ['src'], rollupTypes: true })],
	test: {
		coverage: {
			exclude: ['src/index.ts', 'src/**/*.test.{js,ts,jsx,tsx}'],
			include: ['src/**/*.{js,ts,jsx,tsx}'],
			provider: 'v8',
			reporter: ['text', 'json', 'clover', 'lcov'],
		},
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.test.{js,ts,jsx,tsx}'],
	},
})
