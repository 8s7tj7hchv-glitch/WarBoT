export class ConstructionQuality{calculate(level){return Math.max(1,Math.min(100,50+Math.floor(Math.max(1,Number(level)||1)/10)))}}
