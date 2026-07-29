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

// 2. Process JSX and CSS files
const targets = [
  'd:/Devugo-Tech-Websites/frontend/src/components',
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
    // Fix Framer Motion Viewports
    c = c.replace(/viewport=\{\{\s*once:\s*true\s*,\s*margin:\s*"-[0-9]+px"\s*\}\}/g, 'viewport={{ once: true, amount: 0.1 }}');
    c = c.replace(/viewport=\{\{\s*once:\s*true\s*\}\}/g, 'viewport={{ once: true, amount: 0.1 }}');
    c = c.replace(/viewport=\{\{\s*once:\s*true\s*,\s*amount:\s*0\.[5-9]+\s*\}\}/g, 'viewport={{ once: true, amount: 0.1 }}');
    
    // Fix Intersection Observers
    if (c.includes('IntersectionObserver')) {
      c = c.replace(/threshold:\s*\.?[0-9]+,\s*rootMargin:\s*'[^']+'/g, 'threshold: 0.1, rootMargin: "0px"');
    }
  }

  if (p.endsWith('.css')) {
     if (c.includes('.reveal') && c.includes('opacity:0')) {
        c = c.replace(/\.reveal\s*\{\s*opacity:\s*0\s*;\s*transform:\s*(translateY\([^)]+\)\s*scale\([^)]+\));?/g, 
           'html.js-enabled .reveal:not(.show) { opacity: 0; transform: $1; ');
     }
     if (c.includes('.sol-module.reveal') && c.includes('opacity:0')) {
        c = c.replace(/\.sol-module\.reveal\s*\{\s*opacity:0\s*;\s*transform:\s*(translateY\([^)]+\)\s*scale\([^)]+\));?/g, 
           'html.js-enabled .sol-module.reveal:not(.show) { opacity: 0; transform: $1; ');
     }
  }
  
  if (c !== orig) {
    fs.writeFileSync(p, c);
    console.log('Updated: ' + p);
  }
}

targets.forEach(processFile);
