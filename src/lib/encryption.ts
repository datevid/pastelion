import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const MASTER_KEY_HEX = process.env.MASTER_KEY || '';

function getMasterKey(): Buffer {
  const key = Buffer.from(MASTER_KEY_HEX, 'hex');
  if (key.length !== 32) {
    throw new Error('MASTER_KEY environment variable must be a valid 32-byte hex string');
  }
  return key;
}

/**
 * Encrypts generic text (like the paste content) using a provided 32-byte key.
 */
export function encryptText(text: string, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Format: iv:encrypted_data:tag
  return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
}

/**
 * Decrypts text using a provided 32-byte key.
 */
export function decryptText(encryptedText: string, key: Buffer): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted text format');
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const tag = Buffer.from(parts[2], 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Encrypts the symmetric key using the Master Key.
 */
export function encryptSymmetricKey(symmetricKey: Buffer): string {
  return encryptText(symmetricKey.toString('hex'), getMasterKey());
}

/**
 * Decrypts the symmetric key using the Master Key.
 */
export function decryptSymmetricKey(encryptedSymmetricKey: string): Buffer {
  const hexKey = decryptText(encryptedSymmetricKey, getMasterKey());
  return Buffer.from(hexKey, 'hex');
}

/**
 * Generates a random 32-byte symmetric key buffer.
 */
export function generateSymmetricKey(): Buffer {
  return crypto.randomBytes(32);
}

/**
 * Hashes a user password using scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifies a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    if (!salt || !key) return resolve(false);
    
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
}
