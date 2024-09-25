import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'clover', 'lcov'],
		},
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.test.{js,ts,jsx,tsx}'],
	},
})
