import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const legacyDir = path.resolve(__dirname, '../legacy_commands');
const cache = new Map();

async function loadLegacy(name) {
  if (cache.has(name)) return cache.get(name);
  const mod = await import(pathToFileURL(path.join(legacyDir, `${name}.js`)).href);
  const command = mod.default ?? ((mod.data && mod.execute) ? {data:mod.data, execute:mod.execute} : null);
  if (!command) throw new Error(`Ação legada não encontrada: ${name}`);
  cache.set(name, command);
  return command;
}

function getSchema(command, subcommand = null) {
  const json = command.data.toJSON();
  let options = json.options ?? [];
  if (subcommand) {
    const sub = options.find(o => o.name === subcommand);
    options = sub?.options ?? [];
  }
  return options.filter(o => ![1,2].includes(o.type));
}

function fieldId(name) { return `f_${name}`.slice(0, 100); }

export async function openLegacyAction(interaction, action) {
  const [name, subcommand = null] = String(action).split('/');
  const command = await loadLegacy(name);
  const options = getSchema(command, subcommand);
  if (!options.length) return executeLegacyAction(interaction, action, {});
  if (options.length > 5) throw new Error('Esta ação possui mais de 5 campos e precisa de uma tela dedicada.');
  const modal = new ModalBuilder().setCustomId(`hub:legacy:${name}:${subcommand ?? '-'}`).setTitle(`Ação: ${name}`.slice(0,45));
  for (const option of options) {
    const required = Boolean(option.required);
    const choiceHint = option.choices?.length ? `Opções: ${option.choices.map(c => c.value).join(', ')}` : '';
    const input = new TextInputBuilder().setCustomId(fieldId(option.name)).setLabel(String(option.description || option.name).slice(0,45)).setStyle(TextInputStyle.Short).setRequired(required);
    if (choiceHint) input.setPlaceholder(choiceHint.slice(0,100));
    modal.addComponents(new ActionRowBuilder().addComponents(input));
  }
  return interaction.showModal(modal);
}

function makeOptions(values, subcommand) {
  const raw = name => values[name] ?? null;
  return {
    getSubcommand: () => subcommand,
    getString: (name, required=false) => { const v=raw(name); if(required && !v) throw new Error(`Campo obrigatório: ${name}`); return v == null || v === '' ? null : String(v); },
    getNumber: (name, required=false) => { const v=raw(name); if((v==null||v==='') && required) throw new Error(`Campo obrigatório: ${name}`); return v==null||v==='' ? null : Number(v); },
    getInteger: (name, required=false) => { const v=raw(name); if((v==null||v==='') && required) throw new Error(`Campo obrigatório: ${name}`); return v==null||v==='' ? null : Math.trunc(Number(v)); },
    getBoolean: (name, required=false) => { const v=raw(name); if((v==null||v==='') && required) throw new Error(`Campo obrigatório: ${name}`); if(v==null||v==='') return null; return ['1','true','sim','yes','on'].includes(String(v).toLowerCase()); },
    getUser: (name, required=false) => { const v=String(raw(name)??'').replace(/\D/g,''); if(required&&!v) throw new Error(`ID obrigatório: ${name}`); return v ? { id:v, username:v, bot:false, toString(){return `<@${v}>`;} } : null; },
    getChannel: (name, required=false) => { const v=String(raw(name)??'').replace(/\D/g,''); if(required&&!v) throw new Error(`ID obrigatório: ${name}`); return v ? { id:v, toString(){return `<#${v}>`;} } : null; },
    getRole: (name, required=false) => { const v=String(raw(name)??'').replace(/\D/g,''); if(required&&!v) throw new Error(`ID obrigatório: ${name}`); return v ? { id:v, toString(){return `<@&${v}>`;} } : null; },
    getMentionable: (name, required=false) => { const v=String(raw(name)??'').replace(/\D/g,''); if(required&&!v) throw new Error(`ID obrigatório: ${name}`); return v ? { id:v } : null; }
  };
}

export async function executeLegacyAction(interaction, action, values) {
  const [name, subcommand = null] = String(action).split('/');
  const command = await loadLegacy(name);
  const proxy = new Proxy(interaction, {
    get(target, prop) {
      if (prop === 'options') return makeOptions(values, subcommand);
      if (prop === 'commandName') return name;
      const value = target[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    }
  });
  return command.execute(proxy);
}

export async function submitLegacyModal(interaction) {
  if (!interaction.customId.startsWith('hub:legacy:')) return false;
  const [, , name, rawSub] = interaction.customId.split(':');
  const subcommand = rawSub === '-' ? null : rawSub;
  const command = await loadLegacy(name);
  const schema = getSchema(command, subcommand);
  const values = {};
  for (const option of schema) values[option.name] = interaction.fields.getTextInputValue(fieldId(option.name));
  await executeLegacyAction(interaction, subcommand ? `${name}/${subcommand}` : name, values);
  return true;
}
