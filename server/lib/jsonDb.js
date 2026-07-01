const fs = require("fs");
const path = require("path");

const DB_DIR = path.resolve(__dirname, "../data");

function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const defaults = {
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

function safeWrite(filePath, data) {
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

function readJson(filename) {
  initDb();
  const filePath = path.join(DB_DIR, filename);
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[jsonDb] Failed to read or parse ${filename}, returning default empty structure:`, err);
    if (filename === "messages.json") {
      return { conversations: [], messages: [] };
    }
    if (filename === "rooms.json") {
      return {};
    }
    return [];
  }
}

function writeJson(filename, data) {
  initDb();
  const filePath = path.join(DB_DIR, filename);
  safeWrite(filePath, data);
}

function updateJson(filename, callback) {
  const current = readJson(filename);
  const updated = callback(current);
  writeJson(filename, updated);
  return updated;
}

module.exports = {
  readJson,
  writeJson,
  updateJson,
  safeWrite,
  initDb
};
