const fs = require('fs');
const path = require('path');

const root = __dirname;
const distClient = path.join(root, 'dist', 'client');
const distServer = path.join(root, 'dist', 'server');
const out = path.join(root, '.vercel', 'output');

// Clean and create output dirs
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'static'), { recursive: true });
fs.mkdirSync(path.join(out, 'functions', 'index.func'), { recursive: true });

// 1. Copy dist/client/ → .vercel/output/static/
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
copyDir(distClient, path.join(out, 'static'));

// 2. Find the worker-entry file
const serverAssetsDir = path.join(distServer, 'assets');
const workerFile = fs.readdirSync(serverAssetsDir)
  .find(f => f.startsWith('worker-entry') && f.endsWith('.js'));

if (!workerFile) {
  console.error('Could not find worker-entry in dist/server/assets/');
  process.exit(1);
}

const workerSrc = fs.readFileSync(path.join(serverAssetsDir, workerFile), 'utf8');

// 3. Write the Vercel Node.js function — wraps the Cloudflare Worker fetch handler
const funcDir = path.join(out, 'functions', 'index.func');

// The worker-entry exports: export default { fetch(request, env, ctx) {} }
// We wrap it so Vercel Node.js runtime can call it via Web API Request/Response
const funcCode = `
${workerSrc}

// Vercel Node.js handler (Web Request API format)
export default async function handler(request) {
  // The Cloudflare Worker default export has a .fetch() method
  const worker = (typeof module_default !== 'undefined') ? module_default : globalThis.__worker_default__;
  if (worker && typeof worker.fetch === 'function') {
    return worker.fetch(request, {}, { waitUntil: () => {}, passThroughOnException: () => {} });
  }
  return new Response('SSR handler not found', { status: 500 });
}
`;

fs.writeFileSync(path.join(funcDir, 'index.js'), funcCode, 'utf8');

// package.json so Node.js treats this as ESM
fs.writeFileSync(
  path.join(funcDir, 'package.json'),
  JSON.stringify({ type: 'module' }, null, 2)
);

// 4. Node.js runtime config (not edge — supports node:stream)
fs.writeFileSync(
  path.join(funcDir, '.vc-config.json'),
  JSON.stringify({
    runtime: 'nodejs22.x',
    handler: 'index.js',
    maxDuration: 10
  }, null, 2)
);

// 5. Vercel routing config
fs.writeFileSync(
  path.join(out, 'config.json'),
  JSON.stringify({
    version: 3,
    routes: [
      {
        src: '/assets/(.+)',
        headers: { 'cache-control': 'public, max-age=31536000, immutable' },
        dest: '/assets/$1'
      },
      { src: '/(.*)', dest: '/index' }
    ]
  }, null, 2)
);

console.log('✅ Vercel output ready');
console.log('   Runtime: nodejs22.x (supports node:stream)');
console.log('   Worker: ' + workerFile);
