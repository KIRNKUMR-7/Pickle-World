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

// 2. Bundle server worker into Edge Function
const workerFiles = fs.readdirSync(path.join(distServer, 'assets'))
  .filter(f => f.startsWith('worker-entry') && f.endsWith('.js'));
const workerFile = workerFiles[0];
const workerSrc = fs.readFileSync(
  path.join(distServer, 'assets', workerFile), 'utf8'
);
const serverIndex = fs.readFileSync(path.join(distServer, 'index.js'), 'utf8');

// Write bundled edge function
fs.writeFileSync(
  path.join(out, 'functions', 'index.func', 'index.js'),
  workerSrc + '\n' + serverIndex,
  'utf8'
);

// 3. Edge function config
fs.writeFileSync(
  path.join(out, 'functions', 'index.func', '.vc-config.json'),
  JSON.stringify({ runtime: 'edge', entrypoint: 'index.js' }, null, 2)
);

// 4. Vercel output config — static assets first, SSR everything else
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

console.log('✅ Vercel output built successfully');
console.log('   Static:', distClient);
console.log('   Edge fn: worker-entry via', workerFile);
