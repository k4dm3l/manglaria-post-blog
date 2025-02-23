// src/lib/db.ts
import mongoose from "mongoose";

// 1. Definir la interfaz del objeto cached
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI no está definido en .env.local");
}

// 2. Inicializar con el tipo correcto
let cached: any = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function connect() {
  if (cached.conn) return cached.conn;

  // 3. Asegurar el tipo en la promesa
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false
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