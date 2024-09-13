import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [dts({ include: ['src'], rollupTypes: true })],
	test: {
		include: ['src/**/*.test.{js,ts,jsx,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'clover', 'lcov'],
		},
		globals: true,
	},
	build: {
		copyPublicDir: false,
		sourcemap: true,
		emptyOutDir: true,
		lib: {
			entry: {
				index: 'src/index.ts',
				machines: 'src/machines/index.ts',
				optics: 'src/optics/index.ts',
				utils: 'src/utils/index.ts',
			},
			formats: ['es'],
		},
	},
})
