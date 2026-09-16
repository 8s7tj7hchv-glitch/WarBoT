import fs from 'node:fs';
import path from 'node:path';

const [id, name, emoji = '⚙️'] = process.argv.slice(2);
if (!id || !name) {
  console.log('Uso: node scripts/create-system-manifest.js <id> "<nome>" "<emoji>"');
  process.exit(1);
}

if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) {
  console.error('❌ ID inválido. Use letras, números, _ ou - e comece com uma letra.');
  process.exit(1);
}

const dir = path.resolve('src/systems/manifests');
const file = path.join(dir, `${id}.system.js`);
fs.mkdirSync(dir, { recursive: true });

if (fs.existsSync(file)) {
  console.log(`⚠️ Manifesto já existe: ${path.relative(process.cwd(), file)}`);
  process.exit(0);
}

const safeName = name.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
const safeEmoji = emoji.replaceAll('\\', '\\\\').replaceAll("'", "\\'");

fs.writeFileSync(file,
`export default {
  id: '${id}',
  name: '${safeName}',
  emoji: '${safeEmoji}'
};
`, 'utf8');

console.log(`✅ Criado: ${path.relative(process.cwd(), file)}`);
