import fs from 'node:fs/promises';
import path from 'node:path';

const projectName = 'macro-tightening-atlas';
const browserDir = path.resolve(process.cwd(), 'dist', projectName, 'browser');
const indexPath = path.resolve(browserDir, 'index.html');
const fallbackPath = path.resolve(browserDir, '404.html');
const nojekyllPath = path.resolve(browserDir, '.nojekyll');

await fs.copyFile(indexPath, fallbackPath);
await fs.writeFile(nojekyllPath, '', 'utf8');

console.log(`GitHub Pages post-build artifacts updated at: ${browserDir}`);