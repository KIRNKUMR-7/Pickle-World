const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');

// Vite processes index.html at build time and outputs dist/index.html.
// We just need to verify the build succeeded and report asset sizes.

if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.html not found — did the build succeed?');
  process.exit(1);
}

const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const allAssets = fs.readdirSync(assetsDir);
  const jsFiles = allAssets.filter(f => f.endsWith('.js') && !f.endsWith('.map'));
  const cssFiles = allAssets.filter(f => f.endsWith('.css') && !f.endsWith('.map'));

  console.log('✅ Build verified: dist/index.html exists');
  console.log(`   JS bundles: ${jsFiles.length}`);
  console.log(`   CSS files: ${cssFiles.length}`);

  if (jsFiles.length > 0) {
    const largest = jsFiles
      .map(f => ({ name: f, size: fs.statSync(path.join(assetsDir, f)).size }))
      .sort((a, b) => b.size - a.size)[0];
    console.log(`   Main bundle: ${largest.name} (${Math.round(largest.size / 1024)}KB)`);
  }
} else {
  console.log('✅ Build verified: dist/index.html exists (assets inlined)');
}

console.log('✅ Ready for Vercel deployment');
