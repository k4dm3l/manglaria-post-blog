// src/lib/db.ts
import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// 1. Definir la interfaz del objeto cached
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | null;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI no está definido en .env.local");
}

// 2. Inicializar con el tipo correcto
const cached: MongooseCache = globalThis.mongoose || { conn: null, promise: null };

async function connect() {
  if (cached.conn) return cached.conn;

  // 3. Asegurar el tipo en la promesa
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    }).then((connectedMongoose) => {
      return connectedMongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connect;