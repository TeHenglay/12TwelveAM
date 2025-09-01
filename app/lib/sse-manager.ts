import { redis } from '@/app/lib/redis';

// Global store for all client connections
const clients = new Set<{
  id: string;
  sendEvent: (data: any) => void;
  close: () => void;
}>();

// Function to broadcast updates to all clients
export async function broadcastProductUpdate(productData: any) {
  clients.forEach((client) => {
    client.sendEvent(productData);
  });
  
  // Store the last update in Redis for new clients
  await redis.set('last_product_update', JSON.stringify({
    ...productData,
    timestamp: Date.now(),
  }), { ex: 3600 }); // Expire after 1 hour
}

export { clients };
