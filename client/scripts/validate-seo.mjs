import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appServerDir = path.join(__dirname, '../.next/server/app');

console.log('🔍 Starting Automated SEO & Indexability Verification...\n');

const checks = [];

function check(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`✅ [PASS] ${name}`);
      checks.push({ name, pass: true });
    } else {
      console.log(`❌ [FAIL] ${name}: ${result}`);
      checks.push({ name, pass: false, error: result });
    }
  } catch (err) {
    console.log(`❌ [FAIL] ${name}: ${err.message}`);
    checks.push({ name, pass: false, error: err.message });
  }
}

// 1. Check generated index.html has real content (not just splash)
check('Homepage contains semantic H1 tag', () => {
  const html = fs.readFileSync(path.join(appServerDir, 'index.html'), 'utf-8');
  if (!html.includes('<h1')) return 'Missing <h1> in index.html';
  if (!html.includes('SpiderChat')) return 'Missing "SpiderChat" brand text in <h1>';
});

check('Homepage contains rich content sections (not blank splash screen)', () => {
  const html = fs.readFileSync(path.join(appServerDir, 'index.html'), 'utf-8');
  if (!html.includes('MULTIVERSE') || !html.includes('FAQ')) {
    return 'Homepage does not contain prerendered FAQ / Multiverse sections';
  }
  if (!html.includes('Footer') && !html.includes('SPIDERCHAT')) {
    return 'Homepage missing footer content';
  }
});

check('Homepage includes valid JSON-LD structured data', () => {
  const html = fs.readFileSync(path.join(appServerDir, 'index.html'), 'utf-8');
  if (!html.includes('application/ld+json')) return 'Missing application/ld+json';
  if (!html.includes('WebSite') || !html.includes('Organization')) {
    return 'Missing WebSite or Organization schema';
  }
});

// 2. Check public pages have H1 and title
const publicPages = [
  'terms.html',
  'privacy-policy.html',
  'security.html',
  'status.html',
  'support.html',
  'feedback.html',
  'join.html',
  'login.html',
  'signup.html'
];

for (const page of publicPages) {
  check(`Public page ${page} has <title> and <h1>`, () => {
    const filePath = path.join(appServerDir, page);
    if (!fs.existsSync(filePath)) return `File does not exist: ${page}`;
    const html = fs.readFileSync(filePath, 'utf-8');
    if (!html.includes('<title>')) return `Missing <title> in ${page}`;
    if (!html.includes('<h1')) return `Missing <h1> in ${page}`;
  });
}

// 3. Check robots.txt and sitemap.xml outputs
check('Robots and Sitemap endpoints defined', () => {
  const robotsPath = path.join(__dirname, '../src/app/robots.ts');
  const sitemapPath = path.join(__dirname, '../src/app/sitemap.ts');
  if (!fs.existsSync(robotsPath)) return 'robots.ts missing';
  if (!fs.existsSync(sitemapPath)) return 'sitemap.ts missing';
  
  const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  if (!robotsContent.includes('sitemap.xml')) return 'robots.ts missing sitemap pointer';
  if (!robotsContent.includes('/dashboard/')) return 'robots.ts missing dashboard disallow';
});

console.log(`\n========================================`);
const passed = checks.filter(c => c.pass).length;
console.log(`Verification Complete: ${passed}/${checks.length} Passed`);
console.log(`========================================\n`);

if (passed !== checks.length) {
  process.exit(1);
}

