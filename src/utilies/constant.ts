export const currentTimestamp = 'CURRENT_TIMESTAMP(6)';

/**
 * Returns the base URL for the application.
 * - In production: reads BASE_URL env var (e.g. https://api.myshop.com)
 * - In development / local: falls back to http://localhost:<PORT>
 */
export const getBaseUrl = (): string => {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, '');
  }
  const port = process.env.PORT || '3001';
  return `http://localhost:${port}`;
};

/** @deprecated Use getBaseUrl() instead */
export const baseUrlLocale = 'http://localhost:3001';
