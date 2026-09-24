const BASE={alloy_fictional:4,composite_fictional:2,electronics_fictional:2,energy_cell:3,industrial_parts:3};
const SPECIAL={
 components:{industrial_parts:5,electronics_fictional:3}, electronics:{electronics_fictional:6,research_data:1},
 logistics:{logistics_kit:4,industrial_parts:2}, 'heavy-equipment':{alloy_fictional:6,industrial_parts:5},
 maintenance:{industrial_parts:4,logistics_kit:2}, research:{research_data:5,energy_cell:2},
 'missile-systems':{strategic_token:2,electronics_fictional:4}, strategic:{strategic_token:4,research_data:3}
};
export function productionCost(factoryId,quantity=1){const src=SPECIAL[factoryId]||BASE;return Object.fromEntries(Object.entries(src).map(([k,v])=>[k,v*quantity]));}
