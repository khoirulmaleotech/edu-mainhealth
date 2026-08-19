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

        // Mengupayakan mendengarkan operasi pengisian dokumen baru secara instan
        const pipeline = [{ $match: { "operationType": "insert" } }];
        changeStream = db.collection("family_ai_agreements").watch(pipeline, {
          fullDocument: "updateLookup"
        });

        changeStream.on("change", (change) => {
          const doc = change.fullDocument;
          const ssePayload = `event: newParentAgreement\ndata: ${JSON.stringify(doc)}\n\n`;
          controller.enqueue(encoder.encode(ssePayload));
        });

        const pulseHeartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }, 15000);

        request.signal.addEventListener("abort", () => {
          clearInterval(pulseHeartbeat);
          if (changeStream) changeStream.close();
        });

      } catch (err) {
        console.error("❌ STREAM_RUNTIME_ERROR:", err);
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