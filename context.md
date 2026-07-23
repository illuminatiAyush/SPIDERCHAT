# THE WEB-VERSE (SpiderChat) - Project Context

## 1. Project Idea & Concept
**SpiderChat (The Web-Verse)** is a highly interactive, real-time web application deeply inspired by the visual aesthetics of the "Spider-Man: Into the Spider-Verse" movies. It serves as a real-time communication platform allowing users to either hop into quick anonymous "multiverse" chat rooms, or create permanent accounts to manage friends, explore the network, and engage in persistent 1-on-1 direct messaging (DMs). 

The entire UI/UX is built around comic-book aesthetics: halftone dotted backgrounds, skewed bold text, heavy drop shadows, dynamic micro-animations, glitch effects, and witty MCU (Marvel Cinematic Universe) references for system states (e.g., "ACTIVATING SLING RING...", "CONSULTING JARVIS...").

---

## 2. Technology Stack

### Frontend (Client)
- **Framework:** Next.js (App Router, v15+)
- **Language:** TypeScript / React
- **Styling:** Tailwind CSS (v4) heavily augmented with custom vanilla CSS in `globals.css` for complex animations, CSS variables, and comic-book layer effects.
- **Animations:** Framer Motion (for page transitions, UI reveals, and glitch effects).
- **Icons:** Lucide React.
- **Real-time Client:** Socket.IO Client.
- **Fonts:** Google Fonts loaded natively via standard `<link>` tags (Bangers, Bebas Neue, Fredoka, Permanent Marker).

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js (or Next.js API Routes acting as the backend controllers)
- **Database:** PostgreSQL (managed via Prisma ORM for schemas like User, Message, Conversation, FriendRequest).
- **Real-time Engine:** Socket.IO (handles live typing indicators, room broadcasting, online/offline presence tracking, and instant messaging).
- **Authentication:** Custom token-based auth (JWT) managed through `/api/auth` endpoints.

---

## 3. Core Architecture & Workflows

### A. Authentication & User States
- **Guest Flow:** A user can click "CREATE ROOM" on the landing page. A random alias (e.g., `Host_123`) is generated, a socket connection is established, and they are warped to `/room/[roomCode]` to chat instantly.
- **Permanent Auth Flow:** Users can Sign Up / Log In. Protected routes are wrapped in an `<AuthProvider>` context that fetches session data from `/api/auth/me`. 
- **Session Termination:** If a user loses their session or accesses a protected dashboard route while unauthenticated, they are caught by a custom "SESSION TERMINATED" state in the layout rather than entering an infinite loading loop.

### B. Real-Time Socket Architecture
The `socket.ts` file establishes a singleton websocket connection.
- **Rooms (`/room/[roomCode]`):** Transient, fast-paced group chats. Events include `join_room`, `receive_message`, `display_typing`, and `user_list`.
- **Global Presence:** The dashboard listens for global socket events (`spiderchat_live_users_update`, `spiderchat_new_notification`, `spiderchat_new_message`) and dispatches them via standard DOM `CustomEvent`s so components like the Friends list or Notifications page can update optimistically without re-fetching APIs.

### C. Aesthetic & Design System
- **Loading States:** Uses a custom `LoadingAnimation.tsx` component that takes a central `loading_animation.gif` and crops it into a perfect circle, scaled at 200% zoom. Smaller UI elements use spinning text with MCU references.
- **CSS Architecture:** `globals.css` defines root variables (`--color-spider-red`, `--color-spider-blue`, `--color-spider-black`, `--color-spider-white`). It also holds keyframes for the breathing logo and comic-book button hover effects (`--shadow-comic`).

---

## 4. Folder Structure

```text
THE-WEB-VERSE-master/
├── client/                      # Next.js Frontend Environment
│   ├── public/                  # Static assets
│   │   ├── loading_animation.gif# Custom 200% zoomed loading GIF
│   │   └── img.png              # Favicons and logos
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── (auth)/          # Login, Signup, Forgot Password
│   │   │   ├── api/             # Next.js API routes connecting to MongoDB
│   │   │   ├── dashboard/       # Protected user dashboard
│   │   │   │   ├── explore/     # Search for other users
│   │   │   │   ├── friends/     # Manage friends and see online presence
│   │   │   │   ├── messages/    # Persistent DM list and specific [conversationId] chats
│   │   │   │   ├── notifications/ # S.H.I.E.L.D. alerts / Friend requests
│   │   │   │   ├── profile/     # User settings and avatar management
│   │   │   │   └── layout.tsx   # Dashboard wrapper with Sidebar and Session Terminated UI
│   │   │   ├── room/
│   │   │   │   └── [roomCode]/  # Live ephemeral socket rooms
│   │   │   ├── globals.css      # Core tailwind entry and Spider-Verse CSS config
│   │   │   ├── layout.tsx       # Root layout, Google Fonts, CSP configuration
│   │   │   └── page.tsx         # Landing Page with 2-second splash screen
│   │   ├── components/          # Reusable UI Components
│   │   │   ├── LoadingAnimation.tsx # Global circular loader
│   │   │   ├── AuthProvider.tsx # Client-side context for user sessions
│   │   │   ├── GlitchText.tsx   # Framer-motion based RGB split text effect
│   │   │   ├── HangingWebs.tsx  # Thematic decorative element
│   │   │   └── AnnouncementBanner.tsx # Permanent top banner
│   │   └── lib/                 # Utilities
│   │       └── socket.ts        # Socket.IO client initialization
│   ├── next.config.ts           # Next.js config (Custom CSP for Google Fonts)
│   └── package.json
└── server/                      # Node.js/Express Backend (Assumed structure based on API usage)
    ├── models/                  # MongoDB Mongoose Schemas (User, Message, Conversation)
    ├── routes/                  # Express API endpoints
    └── socketHandler.js         # Backend socket logic and room management
```

---

## 5. Important Recent Fixes (Context for LLMs)
- **Font Optimization:** Next.js `next/font/google` was removed due to strict local Node.js network timeouts causing CSS generation failures. Fonts are currently linked statically via standard HTML `<head>` tags in `layout.tsx` to bypass server-side blocking, and CSP was updated to allow `fonts.googleapis.com`.
- **Infinite Loading:** Resolved infinite loading loops on routes (like `/dashboard/messages`) by ensuring `finally { setLoading(false) }` blocks are rigorously applied to all API fetches. 
- **Next.js Cache Corruption:** The project utilizes Next.js v15+ which occasionally corrupts the `.next` directory causing `PageNotFoundError: /_document`. Clearing `.next` resolves this.
- **Loader Homogenization:** Replaced raw CSS spinners across the board. Massive full-screen blocks use `<LoadingAnimation size={300} />` while inline buttons/sections use faded text with `.animate-pulse` and MCU thematic strings.

---

## 6. Current Feature Status (What Works & What Exists)

### Fully Implemented & Working
- **Anonymous/Guest Rooms:** Fully functional. A user can create a room, get a link/code, share it, and chat instantly over WebSockets. History for these is ephemeral.
- **Authentication:** JWT-based Login and Signup flows are working.
- **User Dashboard Navigation:** Sidebar routing works smoothly with the `SESSION TERMINATED` protection guard in place.
- **Profile Management:** Users can update their avatar, username, and bio. 
- **Explore System:** Users can search the database for other users using a debounced search input.
- **Friends & Presence System:** 
  - Sending/Accepting/Declining friend requests is working.
  - Live online/offline presence is tracked globally and updates the UI instantly using standard DOM Custom Events attached to Socket listeners.
- **Direct Messaging (Persistent Chats):** 1-on-1 private messaging is active.
  - Features real-time message delivery.
  - Features pagination (Loading earlier messages / "Accessing Quantum Realm...").
  - Typing indicators are wired up.
- **UI & Loaders:** All visual elements, Glitch texts, halftone backgrounds, and loaders (300px custom GIF and MCU text states) are polished and active.

### Potential Future Extensions (To Build Next)
- **Media Uploads:** While the chat UI has buttons for Images/Camera, actual cloud integration (AWS S3/Cloudinary) for rich media might need expansion.
- **Group DMs:** Currently, permanent chats are 1-on-1, while group chats are transient guest rooms. Bridging this gap to allow permanent group chats.
- **Push Notifications:** Integrating Web Push API or PWA features so users get notifications when the browser is closed.
