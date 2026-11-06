import fs from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
const source = await fs.readFile(new URL('../src/data.ts', import.meta.url), 'utf8');
const js = stripTypeScriptTypes(source, { mode: 'strip' });
const { defaultContent } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
await fs.mkdir(new URL('../content/', import.meta.url), { recursive: true });
await fs.writeFile(new URL('../content/initial-content.json', import.meta.url), JSON.stringify(defaultContent, null, 2) + '\n');
console.log('Exported content/initial-content.json');
