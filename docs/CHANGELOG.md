# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- Real-time online status syncing via `spiderchat_live_users_update`.
- Real-time notifications for friend requests.
- Glitch timing customization.
- Auto-redirect and fallback buttons on the landing page for authenticated users.

## [1.1.0] - 2026-07-21
### Added
- PostgreSQL integration using Prisma.
- Full authentication system (Login/Register).
- Direct Messaging system (DMs) replacing the old anonymous-only system.
- Friend Request system (Send, Accept, Decline).
- Real-time typing indicators in DMs.
- Real-time reactions to messages.
- Socket fallback authentication utilizing JWT tokens to bypass strict SameSite cookie policies.

### Changed
- Migrated from generic React components to a highly stylized "Spider-Verse" comic book aesthetic.
- Split Next.js API routes to act as proxies to Prisma instead of raw JSON files.

## [1.0.0] - Initial Release
### Added
- Anonymous chat rooms.
- Basic Express + Socket.io server.
- Next.js frontend with Tailwind CSS.
