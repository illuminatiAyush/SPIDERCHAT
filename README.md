# 🕷️ SpiderChat

SpiderChat is a Spider-Verse inspired real-time chat platform featuring rooms, private messaging, friend requests, live communication and a comic-inspired multiverse UI.

---

## 🚀 Overview

**SpiderChat** is a real-time, anonymous chat application where users can instantly create or join chat rooms using a **room code** — no signup, no friction.

Built with a **comic-book / Spider-Verse aesthetic**, the platform combines modern real-time communication with a visually unique UI experience.

---

## ✨ Features

### 🔥 Core Features

* ⚡ Real-time messaging using Socket.IO
* 🔑 Join/Create rooms with a simple code
* 👥 Up to 100 users per room
* 🚫 No authentication required

---

### 🎨 UI & Experience

* 🕶️ Dark / Light mode toggle (persistent)
* 🕸️ Spider-Verse themed UI (comic panels, bold colors)
* ✨ Smooth animations (Framer Motion)
* 📱 Fully responsive design

---

### 💬 Chat Features

* 📝 Text messaging
* 🖼️ Media sharing (images/files)
* ↩️ Reply to specific messages
* 😊 Emoji reactions
* ⏱️ Message timestamps
* ✏️ Edit & delete messages
* 📌 Pinned messages (optional extension)

---

### ⚙️ Realtime Enhancements

* ⌨️ Typing indicator
* 🟢 Online user list per room
* 🔔 Sound notifications for new messages
* 🔄 Auto-reconnect socket handling

---

## 🧱 Tech Stack

### Frontend

* **Next.js (App Router)**
* **React + TypeScript**
* **Tailwind CSS**
* **Framer Motion**
* **Socket.IO Client**

### Backend

* **Node.js**
* **Express.js**
* **Socket.IO**

### Deployment

* Frontend → **Vercel**
* Backend → **Render**

---

## 🏗️ Architecture

```
Users (Browser)
      ↓
Frontend (Next.js - Vercel)
      ↓
WebSocket Connection
      ↓
Backend (Node.js + Socket.IO - Render)
      ↓
Room-based Messaging System
```

---

## 📁 Project Structure

```
spiderchat/

├── src/                 # Frontend (Next.js)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── styles/
│
├── public/
│
├── server/              # Backend (Express + Socket.IO)
│   ├── server.js
│   ├── socketHandler.js
│   └── roomManager.js
│
├── .env.local
├── package.json
└── next.config.ts
```

---

## ⚙️ Environment Variables

### Frontend (.env.local or Vercel)

```
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.onrender.com
```

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/spiderchat.git
cd spiderchat
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Run frontend

```bash
npm run dev
```

---

### 4️⃣ Run backend

```bash
cd server
npm install
node server.js
```

---

## 🌐 Deployment

### Frontend (Vercel)

1. Import repo into Vercel
2. Set root directory = `/`
3. Add environment variable:

   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
   ```
4. Deploy

---

### Backend (Render)

1. Create Web Service
2. Root Directory = `server`
3. Build Command:

   ```
   npm install
   ```
4. Start Command:

   ```
   node server.js
   ```

---

## 🔌 Socket Events

| Event             | Description              |
| ----------------- | ------------------------ |
| `join_room`       | User joins a room        |
| `send_message`    | Send message             |
| `receive_message` | Receive message          |
| `typing`          | Typing indicator         |
| `user_joined`     | User joined notification |
| `user_left`       | User left notification   |

---

## 🧠 Message Structure

```json
{
  "id": "msg123",
  "user": "Karan",
  "type": "text",
  "content": "Hello multiverse",
  "timestamp": 1710000000,
  "replyToMessageId": "msg122",
  "reactions": {
    "🔥": ["user1", "user2"]
  }
}
```

---

## 🔒 Security Considerations

* Input sanitization to prevent XSS
* Controlled room size (max 100 users)
* No sensitive user data stored

---

## 🧪 Testing Checklist

* ✅ Join room works
* ✅ Messages send/receive instantly
* ✅ Media uploads render correctly
* ✅ Replies display properly
* ✅ Theme persists across reloads
* ✅ No console/socket errors

---

## 🚧 Future Improvements

* 🔐 Optional authentication system
* 📦 Message persistence (DB)
* 📞 Voice / video chat (WebRTC)
* 🌍 Multi-language support
* 📊 Admin moderation tools

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Submit a PR

---

## 📄 License

MIT License

---

## 💡 Inspiration

Inspired by the visual storytelling style of the Spider-Verse — blending **technology + comic art + real-time interaction**.

---

## 🔗 Live Demo

Frontend: https://your-vercel-app.vercel.app
Backend: https://your-backend.onrender.com

---

## 👨‍💻 Author

Built by **Ayush Singh**

---

⭐ If you like this project, give it a star!!!
