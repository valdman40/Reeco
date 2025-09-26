import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.join(process.cwd(), 'data', 'app.db');
const schemaPath = path.join(process.cwd(), 'data', 'schema.sql');

export const db = new Database(dbPath);

const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

export default db;
