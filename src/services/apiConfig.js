/**
 * apiConfig.js
 * Centralized API configuration and environment options.
 *
 * Security rule:
 * No secrets or Blynk Auth Tokens are read or stored here.
 */

const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}

export const API_CONFIG = {
  // Base URL for the smartImpact backend proxy (never connect directly to Blynk with secret tokens)
  baseUrl: (metaEnv.VITE_API_BASE_URL || '/api').replace(/\/+$/, ''),


  // Request timeout in milliseconds
  timeoutMs: Number(metaEnv.VITE_API_TIMEOUT_MS) || 8000,

  // Proposed backend endpoint paths (documented, not assumed to exist yet)
  endpoints: {
    latestTelemetry: '/telemetry/latest',
    history: '/telemetry/history',
    deviceStatus: '/device/status',
    settings: '/settings',
    thresholds: '/settings/thresholds',
  },
}

export default API_CONFIG
