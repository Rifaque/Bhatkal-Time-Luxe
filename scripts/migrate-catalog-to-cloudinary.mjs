/**
 * Cloudinary Catalog Migration Script
 *
 * Usage:
 *   node scripts/migrate-catalog-to-cloudinary.mjs --dry-run   # validate + preview, no writes
 *   node scripts/migrate-catalog-to-cloudinary.mjs --apply     # execute migration
 *
 * Safety:
 *   - Pre-flight aborts if ANY local asset is missing
 *   - Backup written before first upload
 *   - Skip rule: Cloudinary URLs are never re-uploaded (safe to re-run after partial failure)
 *   - No frontend, schema, or API changes required
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// ─── Paths ────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const PROJECT    = resolve(__dirname, '..');

const ASSETS_DIR  = resolve(PROJECT, 'migration-assets');
const BACKUPS_DIR = resolve(PROJECT, 'migration-backups');
const BACKUP_FILE = resolve(BACKUPS_DIR, 'cloudinary-migration-backup.json');
const ENV_FILE    = resolve(PROJECT, '.env');

// ─── Parse .env ───────────────────────────────────────────────────────────────

if (!existsSync(ENV_FILE)) {
  console.error(`❌  .env not found at: ${ENV_FILE}`);
  process.exit(1);
}
for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
  const eq = line.indexOf('=');
  if (eq < 1) continue;
  const k = line.slice(0, eq).trim();
  const v = line.slice(eq + 1).trim();
  if (k && v && !process.env[k]) process.env[k] = v;
}

// ─── Args ─────────────────────────────────────────────────────────────────────

const isDryRun = process.argv.includes('--dry-run');
const isApply  = process.argv.includes('--apply');

if (!isDryRun && !isApply) {
  console.error('Usage: node scripts/migrate-catalog-to-cloudinary.mjs [--dry-run | --apply]');
  process.exit(1);
}
if (isDryRun && isApply) {
  console.error('Cannot specify both --dry-run and --apply');
  process.exit(1);
}

const MODE = isDryRun ? 'DRY RUN' : 'APPLY';
console.log(`\n${'═'.repeat(60)}`);
console.log(`  Bhatkal Time Luxe — Cloudinary Catalog Migration`);
console.log(`  Mode: ${MODE}`);
console.log(`${'═'.repeat(60)}\n`);

// ─── Cloudinary ───────────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error('❌  Cloudinary credentials missing in .env');
  process.exit(1);
}

// ─── MongoDB ──────────────────────────────────────────────────────────────────

await mongoose.connect(process.env.MONGO_URI);

const Product = mongoose.model('Product', new mongoose.Schema({
  name:   String,
  images: [String],
  image:  String,
}));

const Brand = mongoose.model('Brand', new mongoose.Schema({
  name: String,
  logo: String,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isCloudinary(url)      { return typeof url === 'string' && url.startsWith('https://res.cloudinary.com'); }
function isLegacyFilename(url)  { return typeof url === 'string' && !url.startsWith('http://') && !url.startsWith('https://') && url.length > 0; }

function uploadBuffer(buffer, folder, resourceType = 'image') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename:  false,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// ─── Load DB state ────────────────────────────────────────────────────────────

const products = await Product.find({}, 'name images image').lean();
const brands   = await Brand.find({}, 'name logo').lean();

// ════════════════════════════════════════════════════════════════════════════════
// PART 1 — PRE-FLIGHT VALIDATION
// ════════════════════════════════════════════════════════════════════════════════

console.log('PART 1 — PRE-FLIGHT VALIDATION\n');

const productQueue  = []; // products that need migration
const brandQueue    = []; // brands that need migration
const missingAssets = [];
let   productsSkipped = 0;
let   brandsSkipped   = 0;

for (const p of products) {
  const img = p.images?.[0] || p.image || null;

  if (!img) {
    console.warn(`  ⚠  ${p.name}: no image field — skipping`);
    productsSkipped++;
    continue;
  }
  if (isCloudinary(img)) {
    productsSkipped++;
    continue;
  }
  if (!isLegacyFilename(img)) {
    console.warn(`  ⚠  ${p.name}: unrecognised URL format "${img}" — skipping`);
    productsSkipped++;
    continue;
  }

  const localPath = resolve(ASSETS_DIR, img);
  const found     = existsSync(localPath);
  if (!found) missingAssets.push({ type: 'product', name: p.name, filename: img });

  productQueue.push({ _id: p._id, name: p.name, filename: img, localPath, found });
}

for (const b of brands) {
  const logo = b.logo || null;

  if (!logo) {
    console.warn(`  ⚠  Brand ${b.name}: no logo field — skipping`);
    brandsSkipped++;
    continue;
  }
  if (isCloudinary(logo)) {
    brandsSkipped++;
    continue;
  }
  if (!isLegacyFilename(logo)) {
    console.warn(`  ⚠  Brand ${b.name}: unrecognised URL format "${logo}" — skipping`);
    brandsSkipped++;
    continue;
  }

  const localPath = resolve(ASSETS_DIR, logo);
  const found     = existsSync(localPath);
  if (!found) missingAssets.push({ type: 'brand', name: b.name, filename: logo });

  brandQueue.push({ _id: b._id, name: b.name, filename: logo, localPath, found });
}

const totalNeeded = productQueue.length + brandQueue.length;
const totalFound  = productQueue.filter(x => x.found).length + brandQueue.filter(x => x.found).length;

console.log(`  Products total:              ${products.length}`);
console.log(`    Already on Cloudinary:     ${productsSkipped}`);
console.log(`    Need migration:            ${productQueue.length}`);
console.log(`    Local files found:         ${productQueue.filter(x => x.found).length}`);
console.log(`    Local files MISSING:       ${productQueue.filter(x => !x.found).length}`);

console.log(`\n  Brands total:                ${brands.length}`);
console.log(`    Already on Cloudinary:     ${brandsSkipped}`);
console.log(`    Need migration:            ${brandQueue.length}`);
console.log(`    Local files found:         ${brandQueue.filter(x => x.found).length}`);
console.log(`    Local files MISSING:       ${brandQueue.filter(x => !x.found).length}`);

console.log(`\n  Assets referenced:           ${totalNeeded}`);
console.log(`  Files found:                 ${totalFound}`);
console.log(`  Files missing:               ${missingAssets.length}`);

if (missingAssets.length > 0) {
  console.log('\n  ❌  MISSING ASSETS:');
  for (const m of missingAssets) {
    console.log(`     [${m.type.padEnd(7)}] ${m.name.padEnd(40)} ${m.filename}`);
  }
  console.log('\n⛔  PRE-FLIGHT FAILED — Migration aborted.');
  console.log('    Resolve missing files in migration-assets/ before proceeding.\n');
  await mongoose.disconnect();
  process.exit(1);
}

console.log('\n  ✅  Pre-flight passed — all referenced assets found.\n');

// ════════════════════════════════════════════════════════════════════════════════
// DRY RUN OUTPUT
// ════════════════════════════════════════════════════════════════════════════════

if (isDryRun) {
  console.log('PART 5 — DRY RUN PLAN\n');
  console.log(`  Products to migrate: ${productQueue.length}`);
  console.log(`  Brands to migrate:   ${brandQueue.length}`);
  console.log(`  Uploads planned:     ${productQueue.length + brandQueue.length}`);
  console.log(`  Missing assets:      0`);

  if (productQueue.length > 0) {
    console.log('\n  Product uploads planned:');
    for (const p of productQueue) {
      console.log(`    ○  ${p.name.padEnd(50)} ${p.filename}`);
    }
  }

  if (brandQueue.length > 0) {
    console.log('\n  Brand logo uploads planned:');
    for (const b of brandQueue) {
      const ext = extname(b.filename).toLowerCase();
      const rt  = ext === '.svg' ? 'auto' : 'image';
      console.log(`    ○  ${b.name.padEnd(40)} ${b.filename}  [resource_type: ${rt}]`);
    }
  }

  console.log('\n  ✅  Safe to proceed.');
  console.log('      Run with --apply to execute migration.\n');
  await mongoose.disconnect();
  process.exit(0);
}

// ════════════════════════════════════════════════════════════════════════════════
// PART 2 — DATABASE BACKUP
// ════════════════════════════════════════════════════════════════════════════════

console.log('PART 2 — DATABASE BACKUP\n');

mkdirSync(BACKUPS_DIR, { recursive: true });

const backup = {
  createdAt:   new Date().toISOString(),
  mode:        'cloudinary-migration',
  cloudName:   process.env.CLOUDINARY_CLOUD_NAME,
  products: products.map(p => ({
    _id:            String(p._id),
    name:           p.name,
    originalImages: p.images || [],
    originalImage:  p.image  || null,
  })),
  brands: brands.map(b => ({
    _id:          String(b._id),
    name:         b.name,
    originalLogo: b.logo || null,
  })),
};

writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2), 'utf8');
console.log(`  ✅  Backup written: ${BACKUP_FILE}`);
console.log(`      Products backed up: ${backup.products.length}`);
console.log(`      Brands backed up:   ${backup.brands.length}\n`);

// ════════════════════════════════════════════════════════════════════════════════
// PART 3 — PRODUCT IMAGE MIGRATION
// ════════════════════════════════════════════════════════════════════════════════

console.log(`PART 3 — PRODUCT IMAGE MIGRATION  (${productQueue.length} products)\n`);

const stats = { uploaded: 0, skipped: 0, failed: 0 };
const failures = [];

let pIdx = 0;
for (const p of productQueue) {
  pIdx++;
  const label = `[${String(pIdx).padStart(2)}/${productQueue.length}]`;

  try {
    const buffer    = readFileSync(p.localPath);
    const result    = await uploadBuffer(buffer, 'products');
    const secureUrl = result.secure_url;

    await Product.updateOne({ _id: p._id }, { $set: { images: [secureUrl] } });

    const shortUrl = secureUrl.replace('https://res.cloudinary.com/', '…/');
    console.log(`  ✓ ${label} ${p.name}`);
    console.log(`        ${p.filename}  →  ${shortUrl}`);
    stats.uploaded++;
  } catch (err) {
    console.error(`  ✗ ${label} FAILED: ${p.name} | ${p.filename}`);
    console.error(`         ${err.message}`);
    stats.failed++;
    failures.push({ type: 'product', name: p.name, filename: p.filename, error: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// PART 4 — BRAND LOGO MIGRATION
// ════════════════════════════════════════════════════════════════════════════════

console.log(`\nPART 4 — BRAND LOGO MIGRATION  (${brandQueue.length} brands)\n`);

let bIdx = 0;
for (const b of brandQueue) {
  bIdx++;
  const label = `[${String(bIdx).padStart(2)}/${brandQueue.length}]`;
  const ext    = extname(b.filename).toLowerCase();
  const rtype  = ext === '.svg' ? 'auto' : 'image';

  try {
    const buffer    = readFileSync(b.localPath);
    const result    = await uploadBuffer(buffer, 'brands', rtype);
    const secureUrl = result.secure_url;

    await Brand.updateOne({ _id: b._id }, { $set: { logo: secureUrl } });

    const shortUrl = secureUrl.replace('https://res.cloudinary.com/', '…/');
    console.log(`  ✓ ${label} ${b.name}`);
    console.log(`        ${b.filename}  →  ${shortUrl}`);
    stats.uploaded++;
  } catch (err) {
    console.error(`  ✗ ${label} FAILED: ${b.name} | ${b.filename}`);
    console.error(`         ${err.message}`);
    stats.failed++;
    failures.push({ type: 'brand', name: b.name, filename: b.filename, error: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// PART 7 — POST-MIGRATION VERIFICATION
// ════════════════════════════════════════════════════════════════════════════════

console.log('\nPART 7 — POST-MIGRATION VERIFICATION\n');

const productsAfter = await Product.find({}, 'name images image').lean();
const brandsAfter   = await Brand.find({}, 'name logo').lean();

let prodOnCloud = 0, prodLegacyRemaining = 0, prodNoImage = 0;
const stillLegacyProducts = [];
for (const p of productsAfter) {
  const img = p.images?.[0] || p.image;
  if (!img)                  { prodNoImage++; }
  else if (isCloudinary(img)){ prodOnCloud++; }
  else                       { prodLegacyRemaining++; stillLegacyProducts.push({ name: p.name, img }); }
}

let brandOnCloud = 0, brandLegacyRemaining = 0;
const stillLegacyBrands = [];
for (const b of brandsAfter) {
  if (!b.logo)                  { /* no logo */ }
  else if (isCloudinary(b.logo)){ brandOnCloud++; }
  else                          { brandLegacyRemaining++; stillLegacyBrands.push({ name: b.name, logo: b.logo }); }
}

console.log(`  Products on Cloudinary:    ${prodOnCloud} / ${productsAfter.length}`);
console.log(`  Products still legacy:     ${prodLegacyRemaining}`);
console.log(`  Products with no image:    ${prodNoImage}`);
console.log(`  Brands on Cloudinary:      ${brandOnCloud} / ${brandsAfter.length}`);
console.log(`  Brands still legacy:       ${brandLegacyRemaining}`);

const expectedProducts = productsAfter.length - productsSkipped - (productQueue.length - productsSkipped);
const allProductsDone  = prodLegacyRemaining === 0;
const allBrandsDone    = brandLegacyRemaining === 0;

if (allProductsDone && allBrandsDone) {
  console.log('\n  ✅  Verification passed — no legacy filenames remaining.');
} else {
  if (stillLegacyProducts.length > 0) {
    console.log('\n  ⚠  Products still on legacy:');
    stillLegacyProducts.forEach(p => console.log(`       ${p.name}: ${p.img}`));
  }
  if (stillLegacyBrands.length > 0) {
    console.log('\n  ⚠  Brands still on legacy:');
    stillLegacyBrands.forEach(b => console.log(`       ${b.name}: ${b.logo}`));
  }
  console.log('\n  ℹ  Re-run with --apply to retry failed items.');
}

// ════════════════════════════════════════════════════════════════════════════════
// FINAL REPORT
// ════════════════════════════════════════════════════════════════════════════════

const productsFailed  = failures.filter(f => f.type === 'product').length;
const brandsFailed    = failures.filter(f => f.type === 'brand').length;
const productsMigrated = productQueue.length - productsFailed;
const brandsMigrated   = brandQueue.length   - brandsFailed;

console.log(`\n${'═'.repeat(60)}`);
console.log('  FINAL REPORT');
console.log(`${'═'.repeat(60)}`);
console.log(`  Products migrated:        ${productsMigrated}`);
console.log(`  Brands migrated:          ${brandsMigrated}`);
console.log(`  Assets skipped:           ${productsSkipped + brandsSkipped}  (already on Cloudinary)`);
console.log(`  Assets failed:            ${stats.failed}`);
console.log(`  Cloudinary URLs written:  ${stats.uploaded}`);
console.log(`  Legacy filenames remaining: ${prodLegacyRemaining + brandLegacyRemaining}`);

if (failures.length > 0) {
  console.log('\n  Failed assets:');
  failures.forEach(f =>
    console.log(`    [${f.type}] ${f.name} — ${f.filename}\n            ${f.error}`)
  );
}

console.log(`\n  Rollback file: ${BACKUP_FILE}`);
console.log('  To rollback: node scripts/rollback-cloudinary-migration.mjs\n');

if (stats.failed === 0 && prodLegacyRemaining === 0 && brandLegacyRemaining === 0) {
  console.log('  ✅  Migration complete. 100% of catalog assets now on Cloudinary.\n');
} else if (stats.failed > 0) {
  console.log('  ⚠  Migration partial. Re-run with --apply to retry failed assets.\n');
}

await mongoose.disconnect();
