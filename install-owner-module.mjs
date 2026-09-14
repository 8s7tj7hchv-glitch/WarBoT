import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const MODULE_ROOT = path.dirname(__filename);
const targetArg = process.argv[2];

if (!targetArg) {
  console.error('Uso: node install-owner-module.mjs /caminho/BoTNT-NodeJS-Fase9.2');
  process.exit(1);
}

const target = path.resolve(targetArg);
const required = [
  'src/config/settings.js',
  'src/events/interactionCreate.js',
  'src/warfare/BattleResolver.js',
  'src/commands'
];

for (const rel of required) {
  if (!fs.existsSync(path.join(target, rel))) {
    console.error(`❌ Projeto incompatível ou caminho incorreto. Ausente: ${rel}`);
    process.exit(1);
  }
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function copyFile(relSource, relTarget, { overwrite = true } = {}) {
  const source = path.join(MODULE_ROOT, relSource);
  const destination = path.join(target, relTarget);
  ensureDir(destination);
  if (!overwrite && fs.existsSync(destination)) return false;
  fs.copyFileSync(source, destination);
  return true;
}

function copyDirectory(relSource, relTarget) {
  const source = path.join(MODULE_ROOT, relSource);
  const destination = path.join(target, relTarget);
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const src = path.join(source, entry.name);
    const dst = path.join(destination, entry.name);
    if (entry.isDirectory()) fs.cpSync(src, dst, { recursive: true, force: true });
    else fs.copyFileSync(src, dst);
  }
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(target, 'backups', `fase9.3-owner-${stamp}`);
fs.mkdirSync(backupDir, { recursive: true });

for (const rel of ['src/events/interactionCreate.js', 'src/warfare/BattleResolver.js']) {
  const source = path.join(target, rel);
  const backup = path.join(backupDir, rel);
  ensureDir(backup);
  fs.copyFileSync(source, backup);
}

copyDirectory('src/owner', 'src/owner');
copyFile('src/commands/owner.js', 'src/commands/owner.js');
copyFile('src/ui/OwnerPanel.js', 'src/ui/OwnerPanel.js');
copyFile('src/ui/OwnerUiRouter.js', 'src/ui/OwnerUiRouter.js');
copyFile('patches/interactionCreate.js', 'src/events/interactionCreate.js');
copyFile('patches/BattleResolver.js', 'src/warfare/BattleResolver.js');
copyFile('scripts/validate-phase9-3.js', 'scripts/validate-phase9-3.js');

for (const name of ['owner_config.json', 'pro_players.json', 'exclusive_forces.json', 'exclusive_force_catalog.json']) {
  copyFile(`data/owner/${name}`, `data/owner/${name}`, { overwrite: false });
}

console.log('✅ Fase 9.3 Owner/VIP implantada.');
console.log(`🛟 Backup dos arquivos alterados: ${backupDir}`);
console.log('⚠️ Adicione BOT_OWNER_ID=SEU_ID_DO_DISCORD ao .env antes de iniciar o bot.');
console.log('🎮 Novo comando público: /owner (somente o ID configurado consegue usar).');
