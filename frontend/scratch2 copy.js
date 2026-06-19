const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://admin:gg8SrJI4TzdSnrYy@ac-vmul2sw-shard-00-00.zx7sp2f.mongodb.net:27017,ac-vmul2sw-shard-00-01.zx7sp2f.mongodb.net:27017,ac-vmul2sw-shard-00-02.zx7sp2f.mongodb.net:27017/edumind?replicaSet=atlas-bqzxxo-shard-0&ssl=true&authSource=admin";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    
    const schools = await db.collection("schools").find({ name: { $regex: /sman 5 bukittinggi/i } }).toArray();
    console.log("Schools found:", schools.map(s => ({ _id: s._id, name: s.name })));
  } finally {
    await client.close();
  }
}

main().catch(console.error);
