import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const DATA_DIR = process.env.DATA_DIR || './data';
const USERS_FILE = join(DATA_DIR, 'users.json');
const MAX_HISTORY = 5;

let data = { users: {} };

export function loadData() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  if (existsSync(USERS_FILE)) {
    try {
      const content = readFileSync(USERS_FILE, 'utf-8');
      data = JSON.parse(content);
    } catch (error) {
      console.error('Error loading data:', error.message);
      data = { users: {} };
    }
  }
}

export function saveData() {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error.message);
  }
}

export function getHistory(userId) {
  const user = data.users[userId];
  if (!user || !user.history) {
    return [];
  }
  return user.history.slice(-MAX_HISTORY);
}

export function addMessage(userId, role, content) {
  if (!data.users[userId]) {
    data.users[userId] = { history: [] };
  }

  data.users[userId].history.push({ role, content });

  // Keep only last MAX_HISTORY messages
  if (data.users[userId].history.length > MAX_HISTORY) {
    data.users[userId].history = data.users[userId].history.slice(-MAX_HISTORY);
  }

  saveData();
}
