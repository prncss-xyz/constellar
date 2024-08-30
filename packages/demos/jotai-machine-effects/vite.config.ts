import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	test: {
		include: ['src/**/*.test.{js,ts,jsx,tsx}'],
		coverage: {
			reporter: ['text', 'json', 'clover', 'lcov'],
		},
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
})
