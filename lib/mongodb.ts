import mongoose, { Connection, ConnectOptions, Mongoose } from 'mongoose';

/**
 * Interface describing the cached connection object stored in the global scope.
 * This prevents creating multiple MongoDB connections during hot reloads in development.
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Augment the global type definition so we can attach a typed `mongoose` cache
 * property to `global` / `globalThis` without using `any`.
 */
declare global {
  // `var` is required here because of how Next.js compiles server code.
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

/**
 * Use a global cache in development to avoid creating a new connection on every
 * Hot Module Replacement (HMR) or API route call. In production, modules are
 * loaded only once so a simple module-level singleton would also work, but
 * using `globalThis` keeps the logic consistent.
 */
const cached: MongooseCache = globalThis.mongooseCache || {
  conn: null,
  promise: null,
};

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

/**
 * Safely reads the MongoDB connection string from environment variables.
 * Throws an error early if it is missing to fail fast during startup.
 */
const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside your environment configuration.',
    );
  }

  return uri;
};

/**
 * Optional strongly-typed Mongoose connection options.
 * Extend this object if you need to tune pool size, timeouts, etc.
 */
const mongooseOptions: ConnectOptions = {
  // Example options (uncomment/tune as needed):
  // maxPoolSize: 10,
  // serverSelectionTimeoutMS: 5000,
};

/**
 * Establishes (or reuses) a Mongoose connection to MongoDB.
 *
 * - Reuses an existing connection if one is already established.
 * - Caches the connection promise to prevent parallel connection attempts.
 * - Throws an error if the connection fails.
 */
export const connectToDatabase = async (): Promise<Connection> => {
  // If we already have an active connection, return it immediately.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is already being established, reuse the same promise.
  if (!cached.promise) {
    const uri = getMongoUri();

    cached.promise = mongoose.connect(uri, mongooseOptions).then((mongooseInstance) => {
      return mongooseInstance.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // If connection fails, reset the cached promise so future calls can retry.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

export default connectToDatabase;
