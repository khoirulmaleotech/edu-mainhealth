import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');

  try {
    await client.connect();
    const db = client.db();
    
    const messages = await db.collection('messages')
      .find({ room_id: new ObjectId(roomId) })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}