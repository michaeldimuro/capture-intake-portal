import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
const ALGORITHM = "aes-256-gcm";

export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const textEncoder = new TextEncoder();
    const keyData = textEncoder.encode(ENCRYPTION_KEY);
    
    const KEY_ARRAY = await window.crypto.subtle.digest('SHA-256', keyData);
    
    // Split the encrypted data into components
    const [ivHex, encrypted, authTagHex] = encryptedData.split(":");

    // Convert hex strings to Uint8Arrays
    const iv = new Uint8Array(hexToBytes(ivHex));
    const authTag = new Uint8Array(hexToBytes(authTagHex));
    const encryptedBytes = new Uint8Array(hexToBytes(encrypted));

    // Combine encrypted data with auth tag
    const encryptedWithTag = new Uint8Array([...encryptedBytes, ...authTag]);

    const key = await window.crypto.subtle.importKey(
      'raw',
      KEY_ARRAY,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      key,
      encryptedWithTag
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Error decrypting data", error);
    throw new Error("Failed to decrypt data");
  }
}

// Helper function to convert hex string to byte array
function hexToBytes(hex: string): number[] {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}
