const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'dist', 'client');
const serverDir = path.join(__dirname, 'dist', 'server');
const clientAssets = path.join(clientDir, 'assets');

// 1. Copy manifest if server build exists (needed for client-side module loading)
const serverAssetsDir = path.join(serverDir, 'assets');
if (fs.existsSync(serverAssetsDir)) {
  const manifestFile = fs.readdirSync(serverAssetsDir)
    .find(f => f.startsWith('_tanstack-start-manifest') && f.endsWith('.js'));

  if (manifestFile) {
    fs.copyFileSync(
      path.join(serverAssetsDir, manifestFile),
      path.join(clientAssets, manifestFile)
    );
    console.log('✅ Copied manifest:', manifestFile);
  }
}

// 2. Find the main client JS bundle — largest .js file
const allClientAssets = fs.readdirSync(clientAssets);
const jsFiles = allClientAssets
  .filter(f => f.endsWith('.js') && !f.endsWith('.map') && !f.startsWith('_tanstack'))
  .map(f => ({
    name: f,
    size: fs.statSync(path.join(clientAssets, f)).size
  }))
  .sort((a, b) => b.size - a.size);

if (jsFiles.length === 0) {
  console.error('❌ No JS files found in dist/client/assets/');
  process.exit(1);
}

const mainEntry = jsFiles[0].name;
console.log('✅ Main client entry (largest JS):', mainEntry, `(${Math.round(jsFiles[0].size / 1024)}KB)`);

// 3. Find CSS (optional — Tailwind v4 may inline CSS into JS)
const cssFile = allClientAssets.find(f => f.endsWith('.css') && !f.endsWith('.map'));
const cssLink = cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : '';
if (cssFile) {
  console.log('✅ CSS file:', cssFile);
} else {
  console.log('ℹ️  No separate CSS — inlined into JS bundle (Tailwind v4)');
}

// 4. Generate index.html
// TanStack Start's client build calls hydrateRoot(document, ...) so it hydrates
// the entire HTML document. We must provide __TSR_DEHYDRATED__ to tell the router
// it's running in CSR mode (no server dehydration), preventing "Invariant failed".
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pickle World — Handmade Non-Veg Pickles</title>
    <meta name="description" content="Authentic handmade non-veg pickles &amp; podis from Tamil Nadu. Chicken, Fish, Prawn, Mutton — pure, preservative-free." />
    <meta property="og:title" content="Pickle World — Handmade Non-Veg Pickles" />
    <meta property="og:description" content="Authentic handmade non-veg pickles &amp; podis from Tamil Nadu. No preservatives. Pure taste." />
    <meta property="og:type" content="website" />
    ${cssLink}
    <script>
      // Tell TanStack Start router to run in CSR mode (no SSR dehydration).
      // Without this, hydrateRoot() fails with "Invariant failed" because it
      // looks for server-rendered router state that doesn't exist in a static deploy.
      window.__TSR_DEHYDRATED__ = { router: { state: { dehydratedMatches: [] } } };
    </script>
  </head>
  <body>
    <script type="module" src="/assets/${mainEntry}"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(clientDir, 'index.html'), html, 'utf8');
console.log('✅ Generated dist/client/index.html');
