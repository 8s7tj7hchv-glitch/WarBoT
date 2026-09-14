import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const mustExist = [
  'src/commands/owner.js',
  'src/owner/OwnerAccess.js',
  'src/owner/VipManager.js',
  'src/owner/ExclusiveForcesManager.js',
  'src/owner/OwnerCombatManager.js',
  'src/ui/OwnerPanel.js',
  'src/ui/OwnerUiRouter.js',
  'data/owner/owner_config.json',
  'data/owner/pro_players.json',
  'data/owner/exclusive_forces.json',
  'data/owner/exclusive_force_catalog.json'
];

for (const rel of mustExist) {
  if (!fs.existsSync(path.join(root, rel))) throw new Error(`Arquivo ausente: ${rel}`);
}

const commandsDir = path.join(root, 'src', 'commands');
const commands = fs.readdirSync(commandsDir).filter(name => name.endsWith('.js')).map(name => name.replace(/\.js$/, '')).sort();
const expected = ['configurar','diplomacia','economia','forcas','game','guerra','industria','inventario','mercado','mundial','owner','pais','producao','profissoes','trocas'].sort();
if (JSON.stringify(commands) !== JSON.stringify(expected)) {
  throw new Error(`Comandos públicos incorretos. Esperado ${expected.join(', ')}; recebido ${commands.join(', ')}`);
}

const cfg = JSON.parse(fs.readFileSync(path.join(root, 'data/owner/owner_config.json'), 'utf8'));
if (Number(cfg.ownerWarMultiplier) !== 100) throw new Error('ownerWarMultiplier deve iniciar em 100.');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data/owner/exclusive_force_catalog.json'), 'utf8'));
if (!Array.isArray(catalog) || catalog.length < 5) throw new Error('Catálogo exclusivo incompleto.');

console.log(`✅ Fase 9.3 válida: ${commands.length} comandos públicos, ${catalog.length} forças exclusivas, multiplicador do dono ${cfg.ownerWarMultiplier}x.`);
