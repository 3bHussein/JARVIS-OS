import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins:[{name:'jarvis-asset-allowlist',generateBundle(_options,bundle){this.emitFile({type:'asset',fileName:'jarvis-assets.json',source:JSON.stringify(Object.keys(bundle).filter(name=>/^assets\/[A-Za-z0-9_-]+-[A-Za-z0-9_-]{6,}\.(?:js|css)$/.test(name)))});}}],
  root: fileURLToPath(new URL('.', import.meta.url)),
  server: { port: 5173, strictPort: true, fs:{deny:['.env','.env.*','*.{crt,pem}','**/.git/**','**/.jarvis-data/**']}, proxy: { '/api': 'http://127.0.0.1:4310' } },
  build: { outDir: 'dist', emptyOutDir: true },
});
