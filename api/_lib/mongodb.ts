import { MongoClient, Db } from 'mongodb';

// Fallback to cluster URI so Vercel deployment works seamlessly immediately
const FALLBACK_URI = 'mongodb+srv://dinuwaperera10:dinuwa123@cluster0.mndhh.mongodb.net/studyclock?appName=Cluster0';
const uri = process.env.MONGODB_URI || FALLBACK_URI;
const dbName = process.env.MONGODB_DB || 'studyclock';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let indexesStarted = false;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

/**
 * Background index creation (non-blocking)
 */
async function ensureIndexes(db: Db): Promise<void> {
  if (indexesStarted) return;
  indexesStarted = true;
  try {
    await Promise.allSettled([
      db.collection('sessions').createIndex({ userId: 1, startTime: -1 }),
      db.collection('sessions').createIndex({ id: 1, userId: 1 }, { unique: true }),
      db.collection('subjects').createIndex({ userId: 1, createdAt: 1 }),
      db.collection('goals').createIndex({ userId: 1 }, { unique: true }),
      db.collection('users').createIndex({ username: 1 }, { unique: true }),
    ]);
  } catch (err) {
    // Indexes might already exist
  }
}

export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  const db = connectedClient.db(dbName);
  // Ensure indexes in background without delaying request response
  ensureIndexes(db).catch(() => {});
  return db;
}

export default clientPromise;
