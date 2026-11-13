import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => {
  if (value.startsWith('--')) pairs.push([value.slice(2), values[index + 1]]);
  return pairs;
}, []));
const email = args.email || 'admin@example.com';
const password = args.password || 'Admin@123';
const name = args.name || 'UCISP Administrator';
await mongoose.connect(env.mongoUri);
await User.findOneAndUpdate(
  { email: email.toLowerCase() },
  { name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'admin' },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);
await mongoose.disconnect();
console.log(`Admin seeded: ${email}`);
console.log(`Password: ${password}`);
