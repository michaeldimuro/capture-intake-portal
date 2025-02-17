import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

export function decrypt(encryptedData: string): string {
  // Split the encrypted data into components
  const [ivHex, encrypted, authTagHex] = encryptedData.split(':');
  
  // Convert hex strings back to buffers
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  // Decrypt the text
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
} 