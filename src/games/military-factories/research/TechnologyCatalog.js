export const TECHNOLOGIES = Object.freeze([
  { id:'ground', emoji:'🛡️', name:'Tecnologia Terrestre', maxLevel:10, baseCost:25, effect:'Eficiência abstrata das linhas terrestres' },
  { id:'air', emoji:'✈️', name:'Tecnologia Aérea', maxLevel:10, baseCost:30, effect:'Eficiência abstrata das linhas aeronáuticas' },
  { id:'naval', emoji:'⚓', name:'Tecnologia Naval', maxLevel:10, baseCost:30, effect:'Eficiência abstrata das linhas navais' },
  { id:'industrial', emoji:'🏭', name:'Tecnologia Industrial', maxLevel:10, baseCost:20, effect:'Capacidade e produtividade industrial do jogo' },
  { id:'strategic', emoji:'🔬', name:'Tecnologia Estratégica Fictícia', maxLevel:10, baseCost:40, effect:'Desbloqueios estratégicos totalmente fictícios' }
]);
export const getTechnology=id=>TECHNOLOGIES.find(x=>x.id===id)??null;
export const technologyCost=(tech,level)=>tech.baseCost + (level*tech.baseCost);
