import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "psychologist") {
      return new Response("Unauthorized", { status: 401 });
    }

    const psychologistId = session.user.id;
    const encoder = new TextEncoder();

    const customStream = new ReadableStream({
      async start(controller) {
        let client;
        let changeStream;

        try {
          client = await connectDB();
          const db = client.db();

          // ── KUNCI PERBAIKAN BACKEND: Pantau semua pesan baru secara global ──
          const pipeline = [
            {
              $match: {
                "operationType": "insert"
              }
            }
          ];

          changeStream = db.collection("messages").watch(pipeline, {
            fullDocument: "updateLookup"
          });

          changeStream.on("change", (change) => {
            const doc = change.fullDocument;
            
            // Validasi pengaman: Hanya pancarkan jika penerima atau pengirim cocok dengan ID psikolog ini
            if (String(doc.receiver_id) === String(psychologistId) || String(doc.sender_id) === String(psychologistId)) {
              const sseMessage = `event: globalMessage\ndata: ${JSON.stringify(doc)}\n\n`;
              controller.enqueue(encoder.encode(sseMessage));
            }
          });

          // Heartbeat ping 15 detik
          const heartbeatInterval = setInterval(() => {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          }, 15000);

          request.signal.addEventListener("abort", () => {
            clearInterval(heartbeatInterval);
            if (changeStream) changeStream.close();
          });

        } catch (err) {
          console.error("Change Stream Error:", err);
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

  } catch (error) {
    console.error("Stream initialization error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}