import { NextRequest } from 'next/server';
import { redis } from '@/app/lib/redis';
import { clients } from '@/app/lib/sse-manager';

// Create a custom ReadableStream for SSE
function createSSEStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array>;
  
  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });
  
  return {
    stream,
    sendEvent: (data: any) => {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    },
    close: () => controller.close(),
  };
}

export async function GET(request: NextRequest) {
  // Create a unique client ID
  const clientId = crypto.randomUUID();
  
  // Create SSE stream for this client
  const { stream, sendEvent, close } = createSSEStream();
  
  // Add this client to our set
  const client = { id: clientId, sendEvent, close };
  clients.add(client);
  
  // Send initial connection message
  sendEvent({ type: 'connection', message: 'Connected to product updates' });
  
  // Send last update if available
  const lastUpdate = await redis.get('last_product_update');
  if (lastUpdate) {
    try {
      // Handle both string and object responses from Redis
      const updateData = typeof lastUpdate === 'string' ? JSON.parse(lastUpdate) : lastUpdate;
      sendEvent(updateData);
    } catch (error) {
      console.error('Error parsing last update:', error);
    }
  }
  
  // Remove client when connection closes
  request.signal.addEventListener('abort', () => {
    clients.delete(client);
  });
  
  // Return the stream with appropriate headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
