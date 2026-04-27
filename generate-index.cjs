const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'dist', 'client');
const assetsDir = path.join(clientDir, 'assets');

// Find CSS and JS entry files from assets
const files = fs.readdirSync(assetsDir);
const cssFile = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));
const jsFiles = files.filter(f => f.endsWith('.js'));

// The main entry JS is the largest one (vendor + app bundle)
const jsWithSizes = jsFiles.map(f => ({
  name: f,
  size: fs.statSync(path.join(assetsDir, f)).size
})).sort((a, b) => b.size - a.size);

// Pick the largest JS file as the main entry
const mainJs = jsWithSizes[0]?.name;

if (!cssFile || !mainJs) {
  console.error('Could not find CSS or JS entry files in dist/client/assets/');
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pickle World — Handmade Non-Veg Pickles</title>
    <meta name="description" content="Authentic handmade non-veg pickles &amp; podis from Tamil Nadu. Chicken, Fish, Prawn, Mutton and more — pure, preservative-free, made in small batches." />
    <link rel="stylesheet" href="/assets/${cssFile}" />
  </head>
  <body>
    <script type="module" src="/assets/${mainJs}"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(clientDir, 'index.html'), html, 'utf8');
console.log(`✅ Generated dist/client/index.html (CSS: ${cssFile}, JS: ${mainJs})`);
