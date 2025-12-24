// API Configuration
// Uses environment variables when available, falls back to localhost for development

const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

// You can set these environment variables during build or use .env file
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL ||
  (isProduction
    ? 'https://physical-ai-humanoid-robotics-textbook-bgc0.onrender.com'
    : 'http://127.0.0.1:8000'
  );

export const API_CONFIG = {
  BACKEND_URL: `${BACKEND_BASE_URL}/chat`,
  CHAT_HISTORY_URL: `${BACKEND_BASE_URL}/api/chat-history`,
  AUTH_URL: `${BACKEND_BASE_URL}/api/auth`,
};

export default API_CONFIG;
