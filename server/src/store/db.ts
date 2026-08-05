/**
 * Conexión SQLite compartida (node:sqlite, sin dependencias externas).
 *
 * Un fichero por directorio de datos (server/data/wanli.db, gitignored).
 * WAL activado para escrituras concurrentes seguras. Cada Store abre su
 * propia conexión sobre el mismo fichero — SQLite lo gestiona sin problema.
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

export function openDb(dataDir: string): DatabaseSync {
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'wanli.db'));
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id              TEXT PRIMARY KEY,
      clientLocalizer TEXT NOT NULL,
      locator         TEXT,
      status          TEXT NOT NULL,
      hotelCode       TEXT,
      checkIn         TEXT,
      checkOut        TEXT,
      valuedNeto      TEXT,
      confirmedNeto   TEXT,
      currencyCode    TEXT,
      priceChanged    INTEGER,
      createdAt       TEXT NOT NULL,
      updatedAt       TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_clientLocalizer ON orders(clientLocalizer);
    CREATE INDEX IF NOT EXISTS idx_orders_locator ON orders(locator);
    CREATE TABLE IF NOT EXISTS destinations (
      code        TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      countryCode TEXT NOT NULL,
      hotelCount  INTEGER NOT NULL DEFAULT 0,
      updatedAt   TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_destinations_country ON destinations(countryCode);
    CREATE TABLE IF NOT EXISTS inquiries (
      id           TEXT PRIMARY KEY,
      type         TEXT NOT NULL,
      companyName  TEXT NOT NULL,
      businessType TEXT,
      workEmail    TEXT NOT NULL,
      region       TEXT,
      monthlyPax   TEXT,
      message      TEXT,
      routeCode    TEXT,
      language     TEXT,
      consentAt    TEXT NOT NULL,
      createdAt    TEXT NOT NULL,
      handled      INTEGER NOT NULL DEFAULT 0
    );
  `);
  return db;
}
