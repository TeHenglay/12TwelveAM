import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let bot: TelegramBot | null = null;

// Initialize bot only if credentials are provided
if (BOT_TOKEN && CHAT_ID) {
  bot = new TelegramBot(BOT_TOKEN, { polling: false });
}

export interface OrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  total: number;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
  paymentProofUrl?: string;
  createdAt: Date;
}

export async function sendOrderNotification(orderData: OrderNotificationData): Promise<boolean> {
  console.log('🤖 sendOrderNotification called for order:', orderData.orderNumber);
  console.log('🔍 Bot instance exists:', !!bot);
  console.log('🔍 CHAT_ID exists:', !!CHAT_ID);
  console.log('🔍 BOT_TOKEN exists:', !!BOT_TOKEN);
  
  if (!bot || !CHAT_ID) {
    console.warn('❌ Telegram bot not configured. Skipping notification.');
    console.warn('   BOT_TOKEN:', BOT_TOKEN ? 'SET' : 'NOT SET');
    console.warn('   CHAT_ID:', CHAT_ID ? 'SET' : 'NOT SET');
    return false;
  }

  try {
    const itemsList = orderData.items.map(item => 
      `• ${item.name} (${item.size}) - Qty: ${item.quantity} - $${item.price.toFixed(2)}`
    ).join('\n');

    const message = `
🛍️ <b>NEW ORDER RECEIVED</b>

📋 <b>Order Details:</b>
Order #: <code>${orderData.orderNumber}</code>
Total: <b>$${orderData.total.toFixed(2)}</b>
Date: ${orderData.createdAt.toLocaleString()}

👤 <b>Customer Info:</b>
Name: ${orderData.customerName}
Phone: ${orderData.customerPhone}
${orderData.customerEmail ? `Email: ${orderData.customerEmail}` : ''}

📦 <b>Items:</b>
${itemsList}

🏠 <b>Shipping Address:</b>
${orderData.shippingAddress}

${orderData.paymentProofUrl ? `💳 <b>Payment Proof:</b> ${orderData.paymentProofUrl}` : ''}

---
Please process this order as soon as possible.
    `.trim();

    await bot.sendMessage(CHAT_ID, message, { 
      parse_mode: 'HTML',
      disable_web_page_preview: false
    });

    console.log(`Order notification sent to Telegram for order ${orderData.orderNumber}`);
    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}

export async function sendTestMessage(): Promise<boolean> {
  if (!bot || !CHAT_ID) {
    console.warn('Telegram bot not configured. Cannot send test message.');
    console.warn('BOT_TOKEN:', BOT_TOKEN ? 'SET' : 'NOT SET');
    console.warn('CHAT_ID:', CHAT_ID ? 'SET' : 'NOT SET');
    return false;
  }

  try {
    console.log('Sending test message to Telegram...');
    await bot.sendMessage(CHAT_ID, '🤖 Telegram bot is working correctly!');
    console.log('Test message sent successfully!');
    return true;
  } catch (error) {
    console.error('Failed to send test Telegram message:', error);
    return false;
  }
}
