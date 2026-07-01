import fs from "fs";
import path from "path";

export interface IUser {
  _id: string;
  username: string;
  passwordHash: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFriendRequest {
  _id: string;
  sender: string; // userId
  receiver: string; // userId
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface IDirectMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'seen';
  replyTo?: string; // messageId
  reactions: Array<{ emoji: string; userId: string }>;
  createdAt: string;
  editedAt?: string;
}

export interface IConversation {
  _id: string;
  participants: string[]; // userIds
  lastMessage?: string;
  lastMessageAt: string;
  unreadCounts: Record<string, number>; // userId -> count
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Resolve the directory where data files are stored
const getDbDir = () => {
  const cwd = process.cwd();
  // Next.js dev/build runs in workspace/client
  if (path.basename(cwd) === 'client') {
    return path.resolve(cwd, '../server/data');
  }
  // Workspace root
  if (fs.existsSync(path.join(cwd, 'server'))) {
    return path.resolve(cwd, 'server/data');
  }
  return path.resolve(cwd, 'data');
};

const DB_DIR = getDbDir();

// Ensure db directory and default files exist
export function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const defaults: Record<string, string> = {
    "users.json": "[]",
    "friends.json": "[]",
    "messages.json": '{"conversations": [], "messages": []}',
    "notifications.json": "[]",
    "rooms.json": "{}"
  };

  for (const [file, content] of Object.entries(defaults)) {
    const filePath = path.join(DB_DIR, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}

// Atomic safe write utility
export function safeWrite(filePath: string, data: any) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = `${filePath}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Error during safeWrite to ${filePath}:`, err);
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch {}
    }
    throw err;
  }
}

export function readJson<T>(filename: string): T {
  initDb();
  const filePath = path.join(DB_DIR, filename);
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[jsonDb] Failed to read or parse ${filename}, returning default empty structure:`, err);
    if (filename === "messages.json") {
      return { conversations: [], messages: [] } as unknown as T;
    }
    if (filename === "rooms.json") {
      return {} as unknown as T;
    }
    return [] as unknown as T;
  }
}

export function writeJson(filename: string, data: any) {
  initDb();
  const filePath = path.join(DB_DIR, filename);
  safeWrite(filePath, data);
}

// Thread-safe update helper
export function updateJson<T>(filename: string, callback: (data: T) => T): T {
  const current = readJson<T>(filename);
  const updated = callback(current);
  writeJson(filename, updated);
  return updated;
}
