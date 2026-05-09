import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db();
    
    const psychologists = await db.collection('users').find({ 
      role: 'psychologist' 
    }).project({
      password: 0, // Keamanan data
    }).toArray();

    // Sorting: Online diletakkan di paling atas
    const sortedData = psychologists.sort((a, b) => {
      if (a.isOnline === b.isOnline) return 0;
      return a.isOnline ? -1 : 1;
    });

    return NextResponse.json({ success: true, data: sortedData });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}