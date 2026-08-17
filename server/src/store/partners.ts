/**
 * Cuentas de partner y sesiones del portal.
 *
 * Modelo de acceso decidido por Andrés (nota del 17/08): las cuentas NO se
 * autorregistran — operaciones da de alta al cliente y le entrega la clave.
 * Por eso no hay verificación de email ni recuperación autónoma: si un
 * partner pierde la clave, operaciones se la restablece desde el panel.
 *
 * Contraseñas con scrypt (node:crypto, sin dependencias). Las sesiones se
 * guardan HASHEADAS: robar la base de datos no da tokens utilizables.
 */
import { randomUUID, randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { openDb } from './db.js';

export interface PartnerRecord {
  id: string;
  companyName: string;
  contactName?: string;
  email: string;
  status: 'ACTIVE' | 'DISABLED';
  notes?: string;
  createdAt: string;
  lastLoginAt?: string;
}

const SESSION_DAYS = 30;

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [algo, saltHex, hashHex] = stored.split(':');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

/** Clave temporal legible para entregar al cliente (sin 0/O/1/l) */
export function generarClave(): string {
  const abc = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(14);
  let out = '';
  for (const b of bytes) out += abc[b % abc.length];
  return out;
}

const pub = (row: any): PartnerRecord => ({
  id: row.id, companyName: row.companyName,
  contactName: row.contactName ?? undefined,
  email: row.email, status: row.status,
  notes: row.notes ?? undefined,
  createdAt: row.createdAt, lastLoginAt: row.lastLoginAt ?? undefined,
});

export class PartnerStore {
  private readonly db: DatabaseSync;

  constructor(dataDir = process.env.DATA_DIR ?? './server/data') {
    this.db = openDb(dataDir);
  }

  create(fields: { companyName: string; contactName?: string; email: string; notes?: string }, password: string): PartnerRecord {
    const record = {
      id: randomUUID(),
      companyName: fields.companyName,
      contactName: fields.contactName ?? null,
      email: fields.email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      status: 'ACTIVE',
      notes: fields.notes ?? null,
      createdAt: new Date().toISOString(),
    };
    this.db.prepare(`INSERT INTO partners (id, companyName, contactName, email, passwordHash, status, notes, createdAt)
      VALUES (:id, :companyName, :contactName, :email, :passwordHash, :status, :notes, :createdAt)`).run(record as any);
    return pub(record);
  }

  list(): PartnerRecord[] {
    return (this.db.prepare('SELECT * FROM partners ORDER BY createdAt DESC').all() as any[]).map(pub);
  }

  get(id: string): PartnerRecord | undefined {
    const row = this.db.prepare('SELECT * FROM partners WHERE id = ?').get(id);
    return row ? pub(row) : undefined;
  }

  findByEmail(email: string): PartnerRecord | undefined {
    const row = this.db.prepare('SELECT * FROM partners WHERE email = ?').get(email.trim().toLowerCase());
    return row ? pub(row) : undefined;
  }

  setStatus(id: string, status: 'ACTIVE' | 'DISABLED'): boolean {
    const r = this.db.prepare('UPDATE partners SET status = ? WHERE id = ?').run(status, id);
    if (status === 'DISABLED') this.revokeSessions(id);
    return r.changes > 0;
  }

  resetPassword(id: string, password: string): boolean {
    const r = this.db.prepare('UPDATE partners SET passwordHash = ? WHERE id = ?')
      .run(hashPassword(password), id);
    this.revokeSessions(id);
    return r.changes > 0;
  }

  /* ── sesiones ── */

  /** Devuelve el partner si las credenciales son válidas y está activo */
  authenticate(email: string, password: string): PartnerRecord | undefined {
    const row: any = this.db.prepare('SELECT * FROM partners WHERE email = ?').get(email.trim().toLowerCase());
    if (!row) {
      // Coste equivalente aunque el email no exista: sin oráculo de usuarios
      verifyPassword(password, 'scrypt:00:00');
      return undefined;
    }
    if (!verifyPassword(password, row.passwordHash) || row.status !== 'ACTIVE') return undefined;
    this.db.prepare('UPDATE partners SET lastLoginAt = ? WHERE id = ?')
      .run(new Date().toISOString(), row.id);
    return pub(row);
  }

  createSession(partnerId: string): { token: string; expiresAt: string } {
    const token = randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DAYS * 86_400_000).toISOString();
    this.db.prepare(`INSERT INTO portal_sessions (tokenHash, partnerId, createdAt, expiresAt)
      VALUES (?, ?, ?, ?)`).run(tokenHash(token), partnerId, now.toISOString(), expiresAt);
    return { token, expiresAt };
  }

  /** Partner de un token de sesión válido (y limpia sesiones caducadas) */
  sessionPartner(token: string): PartnerRecord | undefined {
    this.db.prepare('DELETE FROM portal_sessions WHERE expiresAt < ?').run(new Date().toISOString());
    const row: any = this.db.prepare('SELECT partnerId FROM portal_sessions WHERE tokenHash = ?')
      .get(tokenHash(token));
    if (!row) return undefined;
    const partner = this.get(row.partnerId);
    return partner?.status === 'ACTIVE' ? partner : undefined;
  }

  destroySession(token: string): void {
    this.db.prepare('DELETE FROM portal_sessions WHERE tokenHash = ?').run(tokenHash(token));
  }

  private revokeSessions(partnerId: string): void {
    this.db.prepare('DELETE FROM portal_sessions WHERE partnerId = ?').run(partnerId);
  }
}
