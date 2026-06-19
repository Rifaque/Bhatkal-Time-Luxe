/**
 * Cloudinary Migration Rollback
 *
 * Restores MongoDB product images[] and brand logo fields to their
 * pre-migration state using the backup created by migrate-catalog-to-cloudinary.mjs.
 *
 * Usage:
 *   node scripts/rollback-cloudinary-migration.mjs --dry-run   # preview rollback
 *   node scripts/rollback-cloudinary-migration.mjs --apply     # execute rollback
 *
 * IMPORTANT: This restores DB references only. It does NOT delete Cloudinary assets.
 * After rollback, images will serve from apibtl.hubzero.in again (legacy server).
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const PROJECT    = resolve(__dirname, '..');

const BACKUP_FILE = resolve(PROJECT, 'migration-backups', 'cloudinary-migration-backup.json');
const ENV_FILE    = resolve(PROJECT, '.env');

// Parse .env
for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
  const eq = line.indexOf('=');
  if (eq < 1) continue;
  const k = line.slice(0, eq).trim();
  const v = line.slice(eq + 1).trim();
  if (k && v && !process.env[k]) process.env[k] = v;
}

const isDryRun = process.argv.includes('--dry-run');
const isApply  = process.argv.includes('--apply');

if (!isDryRun && !isApply) {
  console.error('Usage: node scripts/rollback-cloudinary-migration.mjs [--dry-run | --apply]');
  process.exit(1);
}

if (!existsSync(BACKUP_FILE)) {
  console.error(`❌  Backup file not found: ${BACKUP_FILE}`);
  console.error('    Cannot rollback without backup.');
  process.exit(1);
}

const backup = JSON.parse(readFileSync(BACKUP_FILE, 'utf8'));

console.log(`\n${'═'.repeat(60)}`);
console.log('  Cloudinary Migration — ROLLBACK');
console.log(`  Mode: ${isDryRun ? 'DRY RUN' : 'APPLY'}`);
console.log(`  Backup created: ${backup.createdAt}`);
console.log(`${'═'.repeat(60)}\n`);

console.log(`  Products in backup: ${backup.products.length}`);
console.log(`  Brands in backup:   ${backup.brands.length}\n`);

if (isDryRun) {
  console.log('  Rollback preview (first 10 products):');
  backup.products.slice(0, 10).forEach(p =>
    console.log(`    ${p.name}: images → [${p.originalImages?.[0] || '(none)'}]`)
  );
  console.log('\n  Run with --apply to execute rollback.\n');
  process.exit(0);
}

await mongoose.connect(process.env.MONGO_URI);

const Product = mongoose.model('Product', new mongoose.Schema({ images: [String], image: String }));
const Brand   = mongoose.model('Brand',   new mongoose.Schema({ logo: String }));

let prodOk = 0, prodFail = 0, brandOk = 0, brandFail = 0;

for (const p of backup.products) {
  try {
    await Product.updateOne(
      { _id: p._id },
      { $set: { images: p.originalImages || [], image: p.originalImage || undefined } }
    );
    prodOk++;
  } catch (err) {
    console.error(`  ✗ Product ${p.name}: ${err.message}`);
    prodFail++;
  }
}

for (const b of backup.brands) {
  try {
    await Brand.updateOne({ _id: b._id }, { $set: { logo: b.originalLogo || '' } });
    brandOk++;
  } catch (err) {
    console.error(`  ✗ Brand ${b.name}: ${err.message}`);
    brandFail++;
  }
}

console.log(`  Products restored: ${prodOk}  (${prodFail} failed)`);
console.log(`  Brands restored:   ${brandOk}  (${brandFail} failed)`);

if (prodFail === 0 && brandFail === 0) {
  console.log('\n  ✅  Rollback complete. All catalog images now point to legacy server.\n');
} else {
  console.log('\n  ⚠  Rollback partial. Check errors above.\n');
}

await mongoose.disconnect();
