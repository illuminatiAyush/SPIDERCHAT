# SpiderChat Client

This is the Next.js frontend for SpiderChat.

## Frontend Architecture

- **Next.js App Router:** Utilizes the `/app` directory for routing.
- **Tailwind CSS:** For rapid UI development. Custom comic-book utility classes are defined in `global.css`.
- **Framer Motion:** Used for smooth, dynamic animations (page transitions, hover effects).
- **Socket.IO Client:** Connected globally in `GlobalSocketListener.tsx` to handle real-time events efficiently.

## Core Pages
- `/` - Landing Page
- `/login`, `/signup` - Authentication
- `/dashboard` - Main hub for authenticated users
- `/dashboard/messages/[id]` - Direct messaging interface
- `/dashboard/friends` - Friend list and online status
- `/dashboard/notifications` - Friend requests and alerts

## State Management
- `AuthProvider` (Context API) manages user session and JWT token extraction.
- Local state (`useState`) handles component-specific data (e.g. typing indicators).

## Styling & Theme
The application uses a strict color palette:
- `spider-red`: `#E23636`
- `spider-blue`: `#5048E5`
- `spider-black`: `#101010`
- `spider-white`: `#F5F5F1`

All interactive elements utilize comic-book styles (hard drop shadows, heavy borders, skewed containers).
