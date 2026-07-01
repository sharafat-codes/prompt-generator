import { z } from "zod";
import { streamGeneration } from "@/lib/ai/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  prompt: z.string().min(1).max(8000),
  contentType: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }

  // TODO(auth + db): requireSession → getCurrentWorkspace → check UsageCounter
  // vs plan (402 if over the free limit) → record a Run + increment usage.
  // Enforced here, server-side — never trusted from the client.

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamGeneration(parsed.data.prompt, {
          contentType: parsed.data.contentType,
        })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch {
        controller.enqueue(
          encoder.encode("\n\n[Generation was interrupted. Please try again.]"),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
