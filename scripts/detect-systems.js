import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const MANIFESTS = path.join(SRC, 'systems', 'manifests');

const KNOWN = [
  { id: 'tickets', name: 'Tickets', emoji: '🎫', hints: ['tickets', 'ticket'] },
  { id: 'worldWar', name: 'Guerra Mundial', emoji: '🌍', hints: ['worldwar', 'world-war', 'guerra', 'game'] },
  { id: 'giveaways', name: 'Sorteios', emoji: '🎉', hints: ['giveaways', 'giveaway', 'sorteios', 'sorteio'] },
  { id: 'moderation', name: 'Moderação', emoji: '🛡️', hints: ['moderation', 'moderacao', 'moderação'] },
  { id: 'automod', name: 'AutoMod', emoji: '🤖', hints: ['automod', 'auto-mod'] },
  { id: 'rules', name: 'Regras', emoji: '📜', hints: ['rules', 'regras'] },
  { id: 'reactionRoles', name: 'Reaction Roles', emoji: '🎭', hints: ['reactionroles', 'reaction-roles', 'reaction_roles'] }
];

function normalize(v) {
  return v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function walk(dir, depth = 0, found = []) {
  if (!fs.existsSync(dir) || depth > 4) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'systems', 'data'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    found.push(normalize(path.relative(SRC, full)));
    if (entry.isDirectory()) walk(full, depth + 1, found);
  }
  return found;
}

function existsByHints(paths, hints) {
  return paths.some(p => hints.some(h => {
    const n = normalize(h);
    return p.split(/[\\/]/).some(part =>
      part === n || part.startsWith(n + '.') || part.startsWith(n + '-') || part.startsWith(n + '_')
    );
  }));
}

function createManifest(system) {
  const file = path.join(MANIFESTS, `${system.id}.system.js`);
  if (fs.existsSync(file)) {
    console.log(`✅ Já existe: ${path.relative(ROOT, file)}`);
    return 'existing';
  }
  const content =
`export default {
  id: '${system.id}',
  name: '${system.name}',
  emoji: '${system.emoji}'
};
`;
  fs.writeFileSync(file, content, 'utf8');
  console.log(`🆕 Criado: ${path.relative(ROOT, file)}`);
  return 'created';
}

if (!fs.existsSync(SRC)) {
  console.error('❌ Pasta src/ não encontrada. Execute este script na raiz do projeto.');
  process.exit(1);
}

fs.mkdirSync(MANIFESTS, { recursive: true });

console.log('==========================================');
console.log('🧩 DETECTOR DE SISTEMAS');
console.log('==========================================');

const paths = walk(SRC);
let detected = 0, created = 0, existing = 0;

for (const system of KNOWN) {
  if (!existsByHints(paths, system.hints)) continue;
  detected++;
  const result = createManifest(system);
  if (result === 'created') created++;
  else existing++;
}

console.log('');
console.log('==========================================');
console.log(`🔎 Sistemas detectados: ${detected}`);
console.log(`🆕 Manifestos criados: ${created}`);
console.log(`✅ Já existentes: ${existing}`);
console.log('==========================================');

if (!detected) {
  console.log('⚠️ Nenhum sistema conhecido foi detectado automaticamente.');
  console.log('Use create-system-manifest.js para registrar um sistema com nome diferente.');
}
