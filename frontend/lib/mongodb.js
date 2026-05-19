import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add MONGODB_URI");
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = {
    client: null,
    promise: null,
  };
}

export async function connectDB() {
  // Already connected
  if (cached.client) {
    return cached.client;
  }

  // Create connection promise once
  if (!cached.promise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
    });

    cached.promise = client.connect();
  }

  try {
    cached.client = await cached.promise;

    console.log("✅ MongoDB Connected");

    return cached.client;
  } catch (error) {
    cached.promise = null;

    console.error(
      "❌ MongoDB Connection Error:",
      error
    );

    throw error;
  }
}
