import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'fs';

// Helper function to check if HTTPS certificates exist
const getConfig = () => {
  try {
    // Check if certificates exist
    const key = fs.readFileSync('localhost-key.pem');
    const cert = fs.readFileSync('localhost-cert.pem');
    
    // If we get here, we have certificates, so return config with server
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      server: {
        https: {
          key,
          cert
        }
      }
    }
  } catch {
    // Return config without server property
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      }
    }
  }
}

export default defineConfig(getConfig());
