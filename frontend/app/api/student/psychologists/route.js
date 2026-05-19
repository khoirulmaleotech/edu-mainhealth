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
    }).project({ password: 0 }).toArray();

    // Sorting sederhana: Online di atas, Offline di bawah
    const sortedData = psychologists.sort((a, b) => {
      if (a.is_online === b.is_online) return 0;
      return a.is_online ? -1 : 1;
    });

    return NextResponse.json({ success: true, data: sortedData });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}