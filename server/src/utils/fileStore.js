import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve relative to the server folder, regardless of where node is started from (handles Windows paths too).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.resolve(ROOT, 'data', 'users');

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function userFile(username) {
  const safe = username.trim().toLowerCase();
  ensureDir(DATA_DIR);
  return path.join(DATA_DIR, `${safe}.json`);
}

export function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    console.error('readJson error', e);
    return null;
  }
}

export function writeJson(filePath, obj) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}
