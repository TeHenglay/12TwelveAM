# Environment Variables Setup

This file contains the required environment variables for the e-commerce application.

## Required Variables

### Database
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
```

### Redis (Upstash)
```bash
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"
```

### Authentication
```bash
JWT_SECRET="your_super_secret_jwt_key_here"
```

### Environment
```bash
NODE_ENV="development"
```

## Optional Variables

### Telegram Bot (for Order Notifications)
```bash
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
TELEGRAM_CHAT_ID="your_telegram_chat_id"
```

**Note:** If Telegram variables are not provided, the application will work normally but order notifications won't be sent to Telegram.

## Setting Up Telegram Bot

1. Create a new bot by messaging [@BotFather](https://t.me/botfather) on Telegram
2. Use `/newbot` command and follow the instructions
3. Get your bot token from BotFather
4. Add your bot to the desired group/channel
5. Get the chat ID using the bot API or tools like `@userinfobot`
6. Add both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to your environment variables
7. Test the integration in Admin Settings > Telegram Bot section

## Getting Chat ID

You can get your chat ID by:
1. Adding your bot to the group
2. Sending a message in the group
3. Visiting: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for the "chat" object and copy the "id" value

## Example .env file
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"
UPSTASH_REDIS_REST_URL="https://example.upstash.io"
UPSTASH_REDIS_REST_TOKEN="example_token"
JWT_SECRET="your_secret_key_here"
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_CHAT_ID="-123456789"
NODE_ENV="development"
```
