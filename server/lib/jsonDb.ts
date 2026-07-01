import fs from "fs";
import path from "path";

const DB_DIR = path.resolve(__dirname, "../data");

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

export function updateJson<T>(filename: string, callback: (data: T) => T): T {
  const current = readJson<T>(filename);
  const updated = callback(current);
  writeJson(filename, updated);
  return updated;
}
