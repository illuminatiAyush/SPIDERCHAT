# SpiderChat Server

This directory contains the Node.js backend for SpiderChat.

## Backend Architecture

- **Express.js:** Lightweight HTTP server for basic health checks.
- **Socket.IO:** The core real-time engine handling all chat, typing, and presence events.
- **Prisma Client:** Used exclusively for database operations. Note: Actual REST API routes are handled via Next.js API Routes in the `client` folder. The server mostly interacts with the database for persistent sockets.

## Security
- Validates JWT tokens on socket connection.
- Implements a basic rate-limiter for socket events to prevent spam.
- Handles disconnects cleanly to prevent ghost users.

## Running the Server
```bash
npm install
npm start
```
The server runs on `http://localhost:3001` by default.
