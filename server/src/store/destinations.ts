/**
 * Catálogo de destinos (ciudades) derivado del módulo Mapping de T10.
 *
 * Por qué existe: el desplegable del buscador no puede depender de una lista
 * escrita a mano en .env — T10 publica 800+ hoteles en 200+ ciudades y ese
 * catálogo cambia. `server/scripts/sync-mapping.ts` descarga getAllHotels
 * (paginado) y vuelca aquí las ciudades con su número de hoteles; la API sirve
 * esta tabla. Es el "Mapping 静态数据的定时同步任务与本地存储" del README.
 */
import type { DatabaseSync } from 'node:sqlite';
import { openDb } from './db.js';

export interface DestinationRecord {
  code: string;          // cityCode de T10 (p. ej. ES00634)
  name: string;          // nombre de la ciudad (p. ej. Torremolinos)
  countryCode: string;   // ES, PT…
  hotelCount: number;    // hoteles del catálogo en esa ciudad
  updatedAt: string;
}

export class DestinationStore {
  private readonly db: DatabaseSync;

  constructor(dataDir = './server/data') {
    this.db = openDb(dataDir);
  }

  /** Reemplaza el catálogo completo de forma atómica. */
  replaceAll(items: Omit<DestinationRecord, 'updatedAt'>[]): number {
    const now = new Date().toISOString();
    this.db.exec('BEGIN');
    try {
      this.db.exec('DELETE FROM destinations');
      const insert = this.db.prepare(
        'INSERT INTO destinations (code, name, countryCode, hotelCount, updatedAt) VALUES (?, ?, ?, ?, ?)');
      for (const d of items) {
        insert.run(d.code, d.name, d.countryCode, d.hotelCount, now);
      }
      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
    return items.length;
  }

  /** Destinos ordenados por país y luego por nº de hoteles (los más surtidos primero). */
  list(countryCode?: string): DestinationRecord[] {
    const sql = countryCode
      ? 'SELECT * FROM destinations WHERE countryCode = ? ORDER BY hotelCount DESC, name ASC'
      : 'SELECT * FROM destinations ORDER BY countryCode ASC, hotelCount DESC, name ASC';
    const rows = countryCode
      ? this.db.prepare(sql).all(countryCode)
      : this.db.prepare(sql).all();
    return rows as unknown as DestinationRecord[];
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS n FROM destinations').get() as any;
    return Number(row?.n ?? 0);
  }

  lastSync(): string | undefined {
    const row = this.db.prepare('SELECT MAX(updatedAt) AS t FROM destinations').get() as any;
    return row?.t ?? undefined;
  }
}
