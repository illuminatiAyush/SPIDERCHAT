# THE WEB-VERSE (SpiderChat) - UI & Design System

## 1. Aesthetic Vision
The UI of SpiderChat is deeply inspired by the visual language of the "Spider-Man: Into the Spider-Verse" animated movies. The design prioritizes high-energy, dynamic, and comic-book-style interfaces. The experience should feel less like a standard web app and more like stepping into an interactive comic panel.

### Key Design Pillars:
- **Bold & Unapologetic:** High contrast, vibrant colors, and large expressive typography.
- **Dynamic Feedback:** Heavy use of micro-animations, glitch effects, and satisfying hover states.
- **Thematic Consistency:** MCU references in loading states, text copy, and component names.
- **Layered Depth:** Use of halftone patterns, heavy drop shadows, and overlapping elements to create a 3D comic feel.

## 2. Global Design Tokens (Tailwind & CSS)

### 2.1 Color Palette
The core colors are defined as CSS variables in `globals.css` to allow for easy theming (e.g., dark mode switching) and use within Tailwind via `var()`.

- **Primary Accent (`--color-spider-red`):** Used for primary buttons, active states, and critical notifications. Vibrant and aggressive.
- **Secondary Accent (`--color-spider-blue`):** Used for secondary actions, borders, and thematic contrast against the red.
- **Backgrounds (`--color-spider-black` / Dark Tones):** Deep, almost pure blacks and very dark grays to make the neon accents pop.
- **Text (`--color-spider-white`):** High-contrast white for readability on dark backgrounds.

### 2.2 Typography
To avoid blocking issues with Next.js optimization, fonts are loaded directly via HTML `<link>` tags.
- **Bangers:** Used for massive, explosive headers and primary titles.
- **Bebas Neue:** Used for strong, structured subheadings and UI labels.
- **Permanent Marker:** Used for handwritten, organic-looking annotations or informal text.
- **Fredoka:** Used for readable body copy and message bubbles, providing a slightly rounded, friendly contrast to the harsh display fonts.

## 3. Signature Visual Effects

### 3.1 Halftone Patterns
A recurring background element that mimics the printing process of vintage comic books. Implemented via repeating CSS radial gradients or SVG overlays in `globals.css` or specific layout components.

### 3.2 The Comic Shadow (`--shadow-comic`)
Instead of soft, blurry box-shadows standard in modern web design (Material/Apple), SpiderChat uses hard, solid, offset drop shadows. This gives containers, cards, and buttons a distinct "pop-out" 2D effect.
- *Example Behavior:* On hover, a button translates slightly down and right, while its solid shadow shrinks, simulating a physical button press.

### 3.3 Glitch Effects (`GlitchText.tsx`)
Built using Framer Motion. This effect simulates digital distortion by briefly splitting text into its RGB channels (cyan, magenta, yellow) and offsetting them laterally. Used for dramatic entrances, error states, or thematic emphasis.

## 4. Key UI Components

### 4.1 Loading States
- **Global Loader (`LoadingAnimation.tsx`):** A custom circular component that uses a highly zoomed (200%) Spider-Verse GIF. This acts as the primary full-page loading blocker.
- **Inline Loaders:** Instead of generic CSS spinners, buttons and small elements use pulsing text with thematic MCU phrases (e.g., "Consulting Jarvis...", "Activating Sling Ring...").

### 4.2 Thematic Embellishments
- **`HangingWebs.tsx`:** Decorative, non-interactive visual elements placed in the corners or margins of the screen to reinforce the Spider-Man theme.
- **`AnnouncementBanner.tsx`:** A permanent, stylized ticker tape at the top of the UI for global system messages or thematic flavor text.

## 5. Core User Interfaces

### 5.1 Landing Page (`/`)
- **Splash Screen:** A dramatic 2-second initial load sequence introducing the universe.
- **Main Hero:** Features massive GlitchText and prominent call-to-action buttons.
- **Primary Actions:** "ENTER MULTIVERSE" (Login/Signup) or "CREATE ANONYMOUS ROOM" (Guest flow).

### 5.2 Dashboard (`/dashboard/*`)
Protected area for authenticated users.
- **Sidebar Navigation:** Comic-paneled navigation linking to Messages, Friends, Explore, and Profile.
- **Session Guard:** If the auth token expires, the dashboard intercepts the render and displays a full-screen "SESSION TERMINATED" glitch state rather than an infinite loop.

### 5.3 Live Chat Rooms (`/room/[roomCode]`)
The core real-time interface.
- **Message Bubbles:** High-contrast containers with comic shadows.
- **Typing Indicators:** Animated comic-style speech bubbles with ellipses (`...`).
- **Presence List:** A side panel showing connected users in the specific room.
- **Input Area:** Bold, oversized text input emphasizing quick, responsive typing.
