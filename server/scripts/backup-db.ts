/**
 * Copia de seguridad diaria de la base de datos.
 *
 * En cuanto haya pedidos reales, wanli.db es el libro de cuentas de la
 * empresa: perderlo significa no saber qué reservas existen ni qué facturará
 * Tour10. Un volumen persistente protege contra redespliegues, no contra
 * corrupción ni borrados — para eso están las copias.
 *
 * Se usa `VACUUM INTO`, que produce una copia consistente aunque la base esté
 * en uso (con WAL, copiar el fichero a pelo puede dar una copia corrupta).
 * Se conservan los últimos RETENTION días; el resto se borra.
 *
 * Uso:  npm run backup           (cron diario en Railway, o a mano)
 * Restaurar: parar el servidor y copiar el fichero sobre wanli.db.
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readdirSync, unlinkSync, statSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR ?? './server/data';
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const RETENTION = Number(process.env.BACKUP_RETENTION_DAYS ?? 14);

const db = path.join(DATA_DIR, 'wanli.db');
mkdirSync(BACKUP_DIR, { recursive: true });

const stamp = new Date().toISOString().slice(0, 10);
const destino = path.join(BACKUP_DIR, `wanli-${stamp}.db`);

const conn = new DatabaseSync(db, { readOnly: true });
try {
  // Si ya existe la copia de hoy (cron re-ejecutado), se rehace desde cero
  try { unlinkSync(destino); } catch { /* no existía */ }
  conn.exec(`VACUUM INTO '${destino.replace(/'/g, "''")}'`);
  console.log(`[backup] escrito ${destino} (${(statSync(destino).size / 1024).toFixed(0)} KB)`);
} finally {
  conn.close();
}

// Rotación: borrar copias más viejas que RETENTION días
const limite = Date.now() - RETENTION * 86_400_000;
for (const f of readdirSync(BACKUP_DIR)) {
  const m = /^wanli-(\d{4}-\d{2}-\d{2})\.db$/.exec(f);
  if (!m) continue;
  if (new Date(m[1]).getTime() < limite) {
    unlinkSync(path.join(BACKUP_DIR, f));
    console.log(`[backup] rotada copia antigua ${f}`);
  }
}
