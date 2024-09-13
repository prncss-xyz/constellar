import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [dts({ include: ['src'] })],
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.test.{js,ts,jsx,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'clover', 'lcov'],
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
			external: [
				'jotai',
				'react',
				'@constellar/core/machines',
				'@constellar/core/optics',
				'@constellar/core/utils',
			],
		},
	},
})
