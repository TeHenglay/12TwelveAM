# Vercel Deployment Instructions

## Environment Variables Required

Set these in your Vercel dashboard (Project Settings > Environment Variables):

```
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
TELEGRAM_BOT_TOKEN=your-bot-token (optional)
TELEGRAM_CHAT_ID=your-chat-id (optional)
NODE_ENV=production
```

## Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** Leave empty (Next.js auto-detects)
- **Install Command:** `npm install`
- **Node.js Version:** 18.x or 20.x

## Common 404 Issues and Solutions

1. **Missing Environment Variables**
   - Ensure DATABASE_URL is set correctly
   - Verify Redis configuration if using caching

2. **Build Command Issues**
   - Use `npm run build` not `npm build`
   - Ensure package.json has correct scripts

3. **Database Connection**
   - Make sure your database allows connections from Vercel IPs
   - Use connection pooling for PostgreSQL

4. **Static File Issues**
   - Check if images/assets are in the public folder
   - Verify Next.js image configuration

## Troubleshooting Steps

1. Check Vercel Function Logs
2. Verify Environment Variables
3. Test API routes individually
4. Check database connectivity
5. Review build logs for errors

## Database Setup

If using PostgreSQL, ensure:
- SSL is enabled
- Connection limits are appropriate for serverless
- Proper indexes are in place for performance
