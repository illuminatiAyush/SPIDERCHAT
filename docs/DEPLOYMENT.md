# Deployment Guide

## Prerequisites
- Node.js (v18+)
- PostgreSQL Database URL
- Vercel CLI (optional for frontend)
- Server environment (VPS, Heroku, Railway, Render) for backend

## Environment Variables

### Client (`client/.env`)
```env
NEXT_PUBLIC_API_URL=https://api.spiderchat.example.com
NEXT_PUBLIC_SOCKET_URL=https://api.spiderchat.example.com
```

### Server (`server/.env`)
```env
PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db?schema=public
CLIENT_URL=https://spiderchat.example.com
JWT_SECRET=your_super_secret_key
```

## Backend (Server) Deployment

1. **Host**: Render, Railway, or VPS.
2. **Setup**:
   - Set environment variables.
   - Install dependencies: `npm install`
   - Run Prisma push: `npx prisma db push`
   - Start the server: `npm start`
3. **Important**: Ensure the host allows WebSockets (usually enabled by default on modern PaaS).

## Frontend (Client) Deployment

1. **Host**: Vercel recommended.
2. **Setup**:
   - Set environment variables.
   - Build command: `npm run build`
   - Output directory: `.next`
3. **Cookies**: Remember that cookies might fail in cross-origin setups with `SameSite=Lax`. Ensure the `CLIENT_URL` and `API_URL` share the same root domain in production, or rely on our socket token fallback.

## Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Change `JWT_SECRET` to a cryptographically secure random string.
- [ ] Use `SameSite=None; Secure` for cookies if frontend and backend are on different domains.
- [ ] Scale Redis (if utilizing multiple Node.js instances for Socket.IO scaling).
