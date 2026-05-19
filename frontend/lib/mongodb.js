import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  // CRITICAL: Batasi pool size maksimal per instance di serverless Next.js
  maxPoolSize: 5, 
  minPoolSize: 1,
  // Menutup koneksi yang idle secara otomatis agar tidak menggantung di Atlas
  maxIdleTimeMS: 10000, 
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Silakan tambahkan MONGODB_URI ke file .env.local");
}

if (process.env.NODE_ENV === "development") {
  // Dalam mode development, gunakan variabel global agar koneksi tidak di-reset setiap kali Fast Refresh
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Dalam mode produksi, buat client baru namun batasi lewat maxPoolSize di atas
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;