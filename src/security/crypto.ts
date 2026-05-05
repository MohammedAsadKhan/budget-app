import CryptoJS from 'crypto-js';
import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 12;
const STORAGE_KEY = 'budgetapp_data';
const AUTH_KEY = 'budgetapp_auth';
const SESSION_KEY = 'budgetapp_session';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

// ─── Password Hashing ────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

// ─── Data Encryption (AES-256) ───────────────────────────────────────────────

function deriveKey(password: string, salt: string): string {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256,
  }).toString();
}

export function encryptData(data: object, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  const key = deriveKey(password, salt);
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), CryptoJS.enc.Hex.parse(key), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return JSON.stringify({
    salt,
    iv: iv.toString(),
    data: encrypted.toString(),
  });
}

export function decryptData(encryptedStr: string, password: string): object | null {
  try {
    const { salt, iv, data } = JSON.parse(encryptedStr);
    const key = deriveKey(password, salt);
    const decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Hex.parse(key), {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export function saveEncryptedData(data: object, password: string): void {
  const encrypted = encryptData(data, password);
  localStorage.setItem(STORAGE_KEY, encrypted);
}

export function loadEncryptedData(password: string): object | null {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;
  return decryptData(encrypted, password);
}

export function hasExistingData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// ─── Auth Storage ─────────────────────────────────────────────────────────────

export function saveAuthHash(hash: string): void {
  localStorage.setItem(AUTH_KEY, hash);
}

export function getAuthHash(): string | null {
  return localStorage.getItem(AUTH_KEY);
}

export function isFirstTime(): boolean {
  return localStorage.getItem(AUTH_KEY) === null;
}

// ─── Session Management ───────────────────────────────────────────────────────

export function createSession(password: string): void {
  const session = {
    password, // kept in sessionStorage only — gone when tab closes
    expiresAt: Date.now() + SESSION_DURATION,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): { password: string; expiresAt: number } | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function refreshSession(): void {
  const session = getSession();
  if (session) {
    session.expiresAt = Date.now() + SESSION_DURATION;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSessionPassword(): string | null {
  return getSession()?.password ?? null;
}

// ─── Export / Import ──────────────────────────────────────────────────────────

export function exportBackup(data: object, password: string): void {
  const encrypted = encryptData(data, password);
  const blob = new Blob([encrypted], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budgetapp-backup-${new Date().toISOString().split('T')[0]}.enc`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File, password: string): Promise<object | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const data = decryptData(content, password);
      resolve(data);
    };
    reader.readAsText(file);
  });
}
