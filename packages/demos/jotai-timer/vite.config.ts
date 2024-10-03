import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
	test: {
		coverage: {
			reporter: ['text', 'json', 'clover', 'lcov'],
		},
		include: ['src/**/*.test.{js,ts,jsx,tsx}'],
	},
})
