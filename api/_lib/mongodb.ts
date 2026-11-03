import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'studyclock';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let indexesInitialized = false;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  console.warn('⚠️ MONGODB_URI environment variable is not defined. Database operations will require MONGODB_URI to be configured.');
}

if (uri) {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

/**
 * Initialize database indexes for performance and security
 */
async function ensureIndexes(db: Db): Promise<void> {
  if (indexesInitialized) return;
  try {
    await Promise.all([
      db.collection('sessions').createIndex({ userId: 1, startTime: -1 }),
      db.collection('sessions').createIndex({ id: 1, userId: 1 }, { unique: true }),
      db.collection('subjects').createIndex({ userId: 1, createdAt: 1 }),
      db.collection('goals').createIndex({ userId: 1 }, { unique: true }),
      db.collection('users').createIndex({ username: 1 }, { unique: true }),
      db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true }),
    ]);
    indexesInitialized = true;
  } catch (err) {
    // Indexes might already exist
    indexesInitialized = true;
  }
}

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error('Database configuration error: MONGODB_URI is not set.');
  }
  const connectedClient = await clientPromise;
  const db = connectedClient.db(dbName);
  await ensureIndexes(db);
  return db;
}

export default clientPromise!;
