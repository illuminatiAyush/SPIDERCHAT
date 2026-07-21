# 🕸️ SpiderChat - The Multiverse of Conversations

![SpiderChat Banner](https://placehold.co/1200x400/101010/FF0000?text=SPIDERCHAT)

> Enter the Multiverse of Conversations. A highly-stylized, real-time chat application built for speed, privacy, and aesthetics.

## Project Overview

SpiderChat is a production-grade full-stack real-time application. It features a unique comic-book style user interface heavily inspired by the Spider-Verse, combined with robust real-time WebSocket communication and a PostgreSQL backend.

## Features

- **Real-Time Communication:** Instant messaging via Socket.IO.
- **Multiverse Aesthetics:** Comic panels, halftone backgrounds, and vibrant Spider-themed colors.
- **Direct Messaging & Friend System:** Add friends, accept requests, and manage your multiverse squad.
- **Online Presence:** See who is online in real-time.
- **Message Reactions:** React to messages instantly.
- **Typing Indicators:** See when your friends are typing.
- **Anonymous Rooms:** Instantly warp into anonymous rooms without an account.

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, Socket.IO
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** Custom JWT-based HTTP-only cookies (with Socket fallback)

## Folder Structure

```
SpiderChat/
├── client/         # Next.js Frontend
├── server/         # Express + Socket.IO Backend
├── prisma/         # Database Schema & Migrations
├── docs/           # Project Documentation
└── README.md       # You are here
```

## Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/SpiderChat.git
   cd SpiderChat
   ```

2. **Setup the Database:**
   - Install dependencies in root: `npm install` (if managing workspaces)
   - Ensure you have a running PostgreSQL instance.
   - Configure `.env` in the root (see `.env.example`).
   - Run Prisma Push: `npx prisma db push`

3. **Start the Server:**
   ```bash
   cd server
   npm install
   npm start
   ```

4. **Start the Client:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Documentation

Dive deeper into the system architecture and APIs:
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [REST API Reference](./docs/API.md)
- [Socket Events](./docs/SOCKET_EVENTS.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## Contributing
Please see our [Contributing Guide](./docs/CONTRIBUTING.md) to learn how to help expand the multiverse.

## License
MIT License
