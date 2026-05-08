import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI tidak ditemukan di .env");
}

/**
 * Global digunakan untuk menjaga koneksi tetap bertahan saat 'hot reload' di development mode.
 * Ini mencegah error "Too many connections" di MongoDB Atlas.
 */
let cached = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Jika cluster Bapak mendukung, tambahkan maxPoolSize untuk performa
      maxPoolSize: 10, 
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected via Mongoose");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB Connection Error:", e);
    throw e;
  }

  return cached.conn;
}

// Simpan ke global agar tidak dibuat ulang saat reload
if (!global.mongoose) {
  global.mongoose = cached;
}