export const PROFESSIONS = Object.freeze({
  miner: {
    id: 'miner',
    name: 'Minerador',
    emoji: '⛏️',
    description: 'Extrai minérios, minerais e matérias-primas do mundo.'
  },

  blacksmith: {
    id: 'blacksmith',
    name: 'Ferreiro',
    emoji: '🔨',
    description: 'Refina metais e fabrica componentes industriais.'
  },

  builder: {
    id: 'builder',
    name: 'Construtor',
    emoji: '🏗️',
    description: 'Constrói armazéns, fábricas e infraestrutura.'
  },

  trucker: {
    id: 'trucker',
    name: 'Caminhoneiro',
    emoji: '🚚',
    description: 'Transporta recursos, produtos e cargas entre locais.'
  },

  mechanic: {
    id: 'mechanic',
    name: 'Mecânico',
    emoji: '🔧',
    description: 'Mantém, repara e melhora máquinas e veículos.'
  },

  merchant: {
    id: 'merchant',
    name: 'Comerciante',
    emoji: '🏪',
    description: 'Compra, vende e negocia mercadorias.'
  }
});

export const getProfession = (id) =>
  PROFESSIONS[id]
    ? structuredClone(PROFESSIONS[id])
    : null;

export const listProfessions = () =>
  Object.values(PROFESSIONS).map((profession) =>
    structuredClone(profession)
  );

export const professionExists = (id) =>
  Object.hasOwn(PROFESSIONS, id);