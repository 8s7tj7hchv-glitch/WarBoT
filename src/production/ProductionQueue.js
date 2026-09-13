import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { PRODUCTION_DATA_DIR } from '../config/settings.js';
const QUEUE_FILE = path.join(PRODUCTION_DATA_DIR, 'production_queue.json');
export class ProductionQueue {
  constructor(filePath = QUEUE_FILE) { this.path = filePath; JsonManager.ensureFile(this.path, []); }
  load() { const data = JsonManager.load(this.path, []); return Array.isArray(data) ? data : []; }
  save(data) { JsonManager.save(this.path, data); }
  add(userId, recipeId, quantity, durationSeconds) {
    const data = this.load(); const now = new Date();
    const job = { id: randomUUID().replaceAll('-', ''), user_id: String(userId), recipe_id: String(recipeId), quantity: Math.trunc(Number(quantity)), status: 'processing', started_at: now.toISOString(), finish_at: new Date(now.getTime() + Math.max(0, Number(durationSeconds) || 0) * 1000).toISOString() };
    data.push(job); this.save(data); return structuredClone(job);
  }
  getUserQueue(userId) { return this.load().filter((job) => String(job.user_id) === String(userId)).map(structuredClone); }
}
