# SpiderChat Architecture

## Overall System
SpiderChat is a real-time, multiverse-themed chat application. It follows a client-server architecture with a separate frontend built in Next.js and a backend server running Node.js with Socket.IO for real-time communication.

## Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS + custom CSS for comic-book style aesthetics
- **State Management:** React Context (`AuthProvider`), local component state
- **Real-Time:** Socket.IO Client
- **Routing:** Next.js App Router

## Backend
- **Environment:** Node.js, Express
- **Real-Time Engine:** Socket.IO
- **Database ORM:** Prisma (interacting with PostgreSQL)
- **Authentication:** JWT (JSON Web Tokens) stored in `httpOnly` cookies

## Database
- **Provider:** PostgreSQL
- **Schema Management:** Prisma
- **Core Entities:** `User`, `Conversation`, `Message`, `FriendRequest`, `Notification`

## Sockets
- The application relies heavily on WebSockets for real-time delivery of messages, typing indicators, online presence, and notifications.
- Managed centrally in `server/socketHandler.js` and `client/src/components/GlobalSocketListener.tsx`.

## Authentication
- Users authenticate via Next.js API routes which proxy to Prisma.
- A JWT token is generated on login and stored in an HTTP-only cookie.
- The Socket.IO connection is authenticated using the JWT token passed either via cookie or explicit handshake auth payload.
