const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

// In development, Vite proxies this path to the local backend for every device on the Wi-Fi.
export const API_URL = configuredApiUrl ?? '/api';
