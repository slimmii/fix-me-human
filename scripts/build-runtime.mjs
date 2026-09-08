import { build } from 'esbuild';
await build({entryPoints:['src/sandbox/runtime.tsx'],bundle:true,format:'iife',minify:true,outfile:'src/sandbox/runtime.generated.js',define:{'process.env.NODE_ENV':'"production"'}});
