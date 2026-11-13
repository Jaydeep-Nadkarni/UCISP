import mongoose from 'mongoose';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { Resource } from './models/Resource.js';
import { SearchEngine } from './engines/daa/SearchEngine.js';

try {
  await mongoose.connect(env.mongoUri);
  const searchEngine = new SearchEngine();
  const resources = await Resource.find({ status: { $ne: 'expired' } }).lean();
  resources.forEach((resource) => searchEngine.add(resource));
  console.log(`Restored ${resources.length} resources into the search index.`);
  createApp(searchEngine).listen(env.port, () => console.log(`UCISP API listening on ${env.port}`));
} catch (error) {
  if (error?.codeName === 'AtlasError' || error?.message?.toLowerCase().includes('authentication failed')) {
    console.error('MongoDB authentication failed. Check the Atlas database username/password, URL-encode special characters, and confirm the user has access to the selected database.');
  } else {
    console.error(`MongoDB connection failed: ${error.message}`);
  }
  process.exitCode = 1;
}
