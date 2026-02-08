import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

dotenv.config()

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	base: '/itGuru',
	server: {
		port: 3000,
		open: true
	},
	resolve: {
		alias: {
			'@app': path.resolve(__dirname, './src/app'),
			'@pages': path.resolve(__dirname, './src/pages'),
			'@widgets': path.resolve(__dirname, './src/widgets'),
			'@features': path.resolve(__dirname, './src/features'),
			'@entities': path.resolve(__dirname, './src/entities'),
			'@shared': path.resolve(__dirname, './src/shared')
		}
	},
	build: {
		sourcemap: false,
		minify: 'esbuild',
		outDir: 'dist',
		target: 'esnext'
	}
})
