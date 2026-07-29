const fs = require('fs');
const path = require('path');

// 1. Update index.html
const indexHtmlPath = 'd:/Devugo-Tech-Websites/frontend/public/index.html';
if (fs.existsSync(indexHtmlPath)) {
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  if (!html.includes('js-enabled')) {
    html = html.replace('<head>', "<head>\n    <script>document.documentElement.classList.add('js-enabled');</script>");
    fs.writeFileSync(indexHtmlPath, html);
    console.log('Updated: ' + indexHtmlPath);
  }
}

// 2. Process CSS and JSX files
const targets = [
  'd:/Devugo-Tech-Websites/frontend/src/pages',
];

function processFile(p) {
  if (!fs.existsSync(p)) return;
  if (fs.statSync(p).isDirectory()) {
    fs.readdirSync(p).forEach(f => processFile(path.join(p, f)));
    return;
  }
  if (!p.endsWith('.jsx') && !p.endsWith('.js') && !p.endsWith('.css')) return;
  
  let orig = fs.readFileSync(p, 'utf8');
  let c = orig;
  
  if (p.endsWith('.jsx') || p.endsWith('.js')) {
    // Remove the will-reveal logic we added previously
    if (c.includes("classList.add('will-reveal')")) {
       c = c.replace(/els\.forEach\(\$1 => \{ \$1\.classList\.add\("will-reveal"\); io\.observe\(\$1\); \}\)/g, 'els.forEach($1 => io.observe($1))');
       c = c.replace(/els\.forEach\((el|e)\s*=>\s*\{\s*(el|e)\.classList\.add\((['"])will-reveal(['"])\);\s*(io\.observe\((el|e)\)|observer\.observe\((el|e)\));?\s*\}\)/g, 'els.forEach($1 => $6)');
    }
  }

  if (p.endsWith('.css')) {
     if (c.includes('.reveal.will-reveal:not(.show)')) {
        c = c.replace(/\.reveal\.will-reveal:not\(\.show\)\s*\{\s*opacity:\s*0\s*;\s*transform:\s*(translateY\([^)]+\)\s*scale\([^)]+\));?\s*\}/g, 
           'html.js-enabled .reveal:not(.show) { opacity: 0; transform: $1; }');
     }
     if (c.includes('.sol-module.reveal.will-reveal:not(.show)')) {
        c = c.replace(/\.sol-module\.reveal\.will-reveal:not\(\.show\)\s*\{\s*opacity:\s*0\s*;\s*transform:\s*(translateY\([^)]+\)\s*scale\([^)]+\));?\s*\}/g, 
           'html.js-enabled .sol-module.reveal:not(.show) { opacity: 0; transform: $1; }');
     }
  }
  
  if (c !== orig) {
    fs.writeFileSync(p, c);
    console.log('Updated: ' + p);
  }
}

targets.forEach(processFile);
