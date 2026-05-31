import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low, JSONFile } from 'lowdb';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dataDir = join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const file = join(dataDir, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

export async function initDb() {
  await db.read();
  db.data = db.data || { users: [], files: [] };
  await db.write();
}

export { db };
