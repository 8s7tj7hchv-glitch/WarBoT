export const INDUSTRIAL_RESOURCES = Object.freeze({
 alloy_fictional:{id:'alloy_fictional',name:'Liga Industrial Fictícia',emoji:'🧱'},
 composite_fictional:{id:'composite_fictional',name:'Compósito Fictício',emoji:'🧩'},
 electronics_fictional:{id:'electronics_fictional',name:'Eletrônica Fictícia',emoji:'📡'},
 energy_cell:{id:'energy_cell',name:'Célula de Energia do Jogo',emoji:'⚡'},
 industrial_parts:{id:'industrial_parts',name:'Peças Industriais',emoji:'⚙️'},
 logistics_kit:{id:'logistics_kit',name:'Kit Logístico',emoji:'📦'},
 research_data:{id:'research_data',name:'Dados de Pesquisa',emoji:'🔬'},
 strategic_token:{id:'strategic_token',name:'Token Estratégico Fictício',emoji:'🔷'}
});
export function getIndustrialResource(id){ return INDUSTRIAL_RESOURCES[id]??null; }
