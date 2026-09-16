import crypto from 'node:crypto';
export function createGiveawayId(){return `gw_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;}
