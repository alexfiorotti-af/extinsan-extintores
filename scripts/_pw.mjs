// Carrega o Playwright do projeto ou, na falta, da instalação global.
import { execSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
export async function loadPlaywright() {
  try { return await import('playwright'); } catch {}
  const root = execSync('npm root -g').toString().trim();
  return import(pathToFileURL(path.join(root, 'playwright', 'index.mjs')).href);
}

export async function loadGlobal(name) {
  try { return await import(name); } catch {}
  const root = execSync('npm root -g').toString().trim();
  const { createRequire } = await import('node:module');
  return createRequire(path.join(root, 'noop.js'))(name);
}
