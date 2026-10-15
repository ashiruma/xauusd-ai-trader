import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const staticDir = path.join(rootDir, 'dashboard', 'static');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy everything from dashboard/static into dist
fs.cpSync(staticDir, distDir, {
  recursive: true,
  filter: (src) => !src.endsWith('.bak') && !src.includes('_bak')
});

console.log('Successfully prepared dist/ with all Velarion static assets and ThreeUI bundles.');
