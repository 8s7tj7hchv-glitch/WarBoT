import fs from 'node:fs';
import path from 'node:path';

function clone(value) {
  return structuredClone(value);
}

export class JsonManager {
  static ensureDirectory(directoryPath) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  static ensureFile(filePath, defaultValue) {
    this.ensureDirectory(path.dirname(filePath));

    if (!fs.existsSync(filePath)) {
      this.save(filePath, clone(defaultValue));
    }
  }

  static load(filePath, defaultValue) {
    this.ensureFile(filePath, defaultValue);

    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return clone(defaultValue);
    }
  }

  static save(filePath, data) {
    this.ensureDirectory(path.dirname(filePath));

    const temporaryPath = `${filePath}.tmp`;
    const json = JSON.stringify(data, null, 4);

    fs.writeFileSync(temporaryPath, json, 'utf8');
    fs.renameSync(temporaryPath, filePath);
  }

  static update(filePath, defaultValue, key, value) {
    const data = this.load(filePath, defaultValue);

    if (data === null || Array.isArray(data) || typeof data !== 'object') {
      throw new TypeError('JsonManager.update requer um JSON do tipo objeto.');
    }

    data[key] = value;
    this.save(filePath, data);
    return data;
  }

  static remove(filePath, defaultValue, key) {
    const data = this.load(filePath, defaultValue);

    if (data === null || Array.isArray(data) || typeof data !== 'object') {
      return false;
    }

    if (!(key in data)) {
      return false;
    }

    delete data[key];
    this.save(filePath, data);
    return true;
  }

  static contains(filePath, defaultValue, key) {
    const data = this.load(filePath, defaultValue);

    if (data === null || Array.isArray(data) || typeof data !== 'object') {
      return false;
    }

    return key in data;
  }
}
