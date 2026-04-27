const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'dist', 'client');
const serverDir = path.join(__dirname, 'dist', 'server');
const clientAssets = path.join(clientDir, 'assets');
const serverAssets = path.join(serverDir, 'assets');

// 1. Find and read the TanStack Start manifest (in server assets)
const manifestFile = fs.readdirSync(serverAssets)
  .find(f => f.startsWith('_tanstack-start-manifest') && f.endsWith('.js'));

if (!manifestFile) {
  console.error('❌ No _tanstack-start-manifest file found');
  process.exit(1);
}

// Copy manifest to client assets so the client JS can fetch it
fs.copyFileSync(
  path.join(serverAssets, manifestFile),
  path.join(clientAssets, manifestFile)
);
console.log('✅ Copied manifest:', manifestFile);

// 2. Extract clientEntry from manifest content
const manifestContent = fs.readFileSync(path.join(serverAssets, manifestFile), 'utf8');
const clientEntryMatch = manifestContent.match(/clientEntry:\s*["']([^"']+)["']/);
const clientEntry = clientEntryMatch ? clientEntryMatch[1] : null;

if (!clientEntry) {
  console.error('❌ Could not find clientEntry in manifest');
  process.exit(1);
}
console.log('✅ Client entry:', clientEntry);

// 3. Find CSS
const cssFile = fs.readdirSync(clientAssets)
  .find(f => f.startsWith('styles-') && f.endsWith('.css'));

if (!cssFile) {
  console.error('❌ No CSS file found');
  process.exit(1);
}

// 4. Generate index.html with:
//    - Correct clientEntry script
//    - window.__TSR_DEHYDRATED__ injected (required by TanStack Start client)
//    - window.__TSR_MANIFEST__ pointing to the manifest
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pickle World — Handmade Non-Veg Pickles</title>
    <meta name="description" content="Authentic handmade non-veg pickles &amp; podis from Tamil Nadu. Chicken, Fish, Prawn, Mutton — pure, preservative-free." />
    <link rel="stylesheet" href="/assets/${cssFile}" />
    <script>
      // Required by TanStack Start client for CSR mode (no SSR data)
      window.__TSR_DEHYDRATED__ = {
        router: {
          state: {
            dehydratedMatches: []
          }
        }
      };
    </script>
  </head>
  <body>
    <script type="module" src="${clientEntry}"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(clientDir, 'index.html'), html, 'utf8');
console.log('✅ Generated dist/client/index.html');
console.log('   CSS:', cssFile);
console.log('   JS:', clientEntry);
console.log('   __TSR_DEHYDRATED__ injected for CSR mode');
