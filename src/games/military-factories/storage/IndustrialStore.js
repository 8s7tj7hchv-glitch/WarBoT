import fs from 'node:fs';
import path from 'node:path';

const root = process.env.TNT_DATA_DIR || './data';
const file = path.join(
  root,
  'military-factories',
  'industrial.json'
);

function ensure() {
  fs.mkdirSync(path.dirname(file), { recursive: true });

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '{}\n');
  }
}

// ==========================================
// 📥 CARREGAR ESTADO INDUSTRIAL
// ==========================================

export function loadIndustrialState() {
  ensure();

  try {
    return JSON.parse(
      fs.readFileSync(file, 'utf8')
    );
  } catch {
    return {};
  }
}

// ==========================================
// 💾 SALVAR ESTADO INDUSTRIAL
// ==========================================

export function saveIndustrialState(value) {
  ensure();

  const temp = `${file}.tmp`;

  fs.writeFileSync(
    temp,
    JSON.stringify(value, null, 2)
  );

  fs.renameSync(temp, file);
}

// ==========================================
// 🏭 INDUSTRIAL STORE — FASE 30
// ==========================================

export const industrialStore = {

  getState() {
    return loadIndustrialState();
  },

  saveState(state) {
    saveIndustrialState(state);
    return state;
  },

  get(key, fallback = null) {
    const state = loadIndustrialState();

    return state[key] ?? fallback;
  },

  set(key, value) {
    const state = loadIndustrialState();

    state[key] = value;

    saveIndustrialState(state);

    return value;
  },

  has(key) {
    const state = loadIndustrialState();

    return Object.prototype.hasOwnProperty.call(
      state,
      key
    );
  },

  delete(key) {
    const state = loadIndustrialState();

    if (!Object.prototype.hasOwnProperty.call(state, key)) {
      return false;
    }

    delete state[key];

    saveIndustrialState(state);

    return true;
  }
};