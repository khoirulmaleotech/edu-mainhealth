import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    async start(controller) {
      let client;
      let changeStream;

      try {
        client = await connectDB();
        const db = client.db();

        // Pipeline matched murni mendengarkan operasi pengisian (insert) baru kuesioner
        const pipeline = [
          {
            $match: {
              "operationType": "insert"
            }
          }
        ];

        changeStream = db.collection("wellbeing_camp_responses").watch(pipeline, {
          fullDocument: "updateLookup"
        });

        changeStream.on("change", (change) => {
          const doc = change.fullDocument;
          const sseMessage = `event: newResponse\ndata: ${JSON.stringify(doc)}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
        });

        const heartbeatInterval = setInterval(() => {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }, 15000);

        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeatInterval);
          if (changeStream) changeStream.close();
        });

      } catch (err) {
        console.error("Change Stream Runtime Error:", err);
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