/**
 * One-time admin account seeder.
 *
 * Usage (Node 20.6+):
 *   node --env-file=.env scripts/seed-admin.mjs
 *
 * The script is idempotent — accounts that already exist are skipped.
 * Uses bcrypt with 12 rounds, identical to the application's registration flow.
 *
 * After running, verify login at /admin/login, then delete or
 * remove this script from version control if the passwords are sensitive.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set. Run with: node --env-file=.env scripts/seed-admin.mjs');
  process.exit(1);
}

const SALT_ROUNDS = 12;

const ACCOUNTS = [
  { username: 'admin',   password: 'admin@btl'   },
  { username: 'rifaque', password: 'rifaque.dev'  },
];

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

async function seed() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI, { bufferCommands: false });
  console.log('Connected.');

  const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

  for (const { username, password } of ACCOUNTS) {
    const exists = await Admin.findOne({ username });
    if (exists) {
      console.log(`  SKIP  ${username} — already exists`);
      continue;
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await new Admin({ username, password: hashedPassword }).save();
    console.log(`  OK    ${username} — created`);
  }

  await mongoose.disconnect();
  console.log('Done. Verify accounts at /admin/login before deploying.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
