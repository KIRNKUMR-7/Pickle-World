const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'dist', 'client');
const serverDir = path.join(__dirname, 'dist', 'server');
const clientAssets = path.join(clientDir, 'assets');
const serverAssets = path.join(serverDir, 'assets');

// 1. Copy the TanStack Start manifest from server → client assets
//    (the client JS requests this file at runtime)
const manifestFile = fs.readdirSync(serverAssets)
  .find(f => f.startsWith('_tanstack-start-manifest') && f.endsWith('.js'));

if (manifestFile) {
  fs.copyFileSync(
    path.join(serverAssets, manifestFile),
    path.join(clientAssets, manifestFile)
  );
  console.log('✅ Copied manifest:', manifestFile);
} else {
  console.warn('⚠️  No _tanstack-start-manifest file found in dist/server/assets/');
}

// 2. Find the correct entry JS — the SMALLEST index-*.js
//    (the large one is the vendor bundle, the small one is the app entry)
const jsFiles = fs.readdirSync(clientAssets)
  .filter(f => f.startsWith('index-') && f.endsWith('.js'));

const jsWithSizes = jsFiles.map(f => ({
  name: f,
  size: fs.statSync(path.join(clientAssets, f)).size
})).sort((a, b) => a.size - b.size); // smallest first = entry point

const entryJs = jsWithSizes[0]?.name;

// 3. Find CSS
const cssFile = fs.readdirSync(clientAssets)
  .find(f => f.startsWith('styles-') && f.endsWith('.css'));

if (!cssFile || !entryJs) {
  console.error('❌ Could not find CSS or JS entry file');
  process.exit(1);
}

// 4. Generate index.html with proper meta + correct entry script
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pickle World — Handmade Non-Veg Pickles</title>
    <meta name="description" content="Authentic handmade non-veg pickles &amp; podis from Tamil Nadu. Chicken, Fish, Prawn, Mutton — pure, preservative-free." />
    <link rel="stylesheet" href="/assets/${cssFile}" />
  </head>
  <body>
    <script type="module" src="/assets/${entryJs}"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(clientDir, 'index.html'), html, 'utf8');
console.log('✅ Generated index.html');
console.log('   CSS:', cssFile);
console.log('   JS entry:', entryJs, '(smallest index-*.js = app bootstrap)');
