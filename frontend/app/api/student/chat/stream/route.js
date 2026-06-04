import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (!roomId || !ObjectId.isValid(roomId)) {
    return new Response("Room ID tidak valid", { status: 400 });
  }

  const encoder = new TextEncoder();

  // Membuka protokol standardisasi HTTP stream response
  const customStream = new ReadableStream({
    async start(controller) {
      let client;
      let changeStream;

      try {
        client = await connectDB();
        const db = client.db();

        // Mengunci target filter pemantauan khusus dokumen yang masuk ke room ini
        const pipeline = [
          {
            $match: {
              "operationType": "insert",
              "fullDocument.room_id": new ObjectId(roomId)
            }
          }
        ];

        changeStream = db.collection("messages").watch(pipeline, {
          fullDocument: "updateLookup"
        });

        // Loop penangkap event saat dokumen baru selesai di-insert di Atlas Mongo
        changeStream.on("change", (change) => {
          const doc = change.fullDocument;
          
          // Format standardisasi SSE data stream (harus diakhiri ganda \n\n)
          const sseMessage = `event: newMessage\ndata: ${JSON.stringify(doc)}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
        });

        // Menjaga detak jantung pipa stream (Heartbeat) tiap 15 detik agar koneksi Vercel/Hosting tidak timeout
        const heartbeatInterval = setInterval(() => {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }, 15000);

        // Bersihkan seluruh watcher database saat pipa ditutup oleh client browser
        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeatInterval);
          if (changeStream) changeStream.close();
          console.log(`Stream room ${roomId} ditutup secara bersih.`);
        });

      } catch (err) {
        console.error("Stream runtime error:", err);
        if (changeStream) changeStream.close();
        controller.close();
      }
    }
  });

  return new NextResponse(customStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}