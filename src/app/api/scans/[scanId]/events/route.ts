import { getScanRecord, subscribeScan } from "@/server/store";

export async function GET(request: Request, context: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await context.params;
  const record = getScanRecord(scanId);
  if (!record) {
    return new Response(JSON.stringify({ error: "Scan not found.", retry: true, demo: true }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      record.events.forEach(send);
      const unsubscribe = subscribeScan(record, send);
      const close = () => {
        unsubscribe();
        controller.close();
      };
      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
