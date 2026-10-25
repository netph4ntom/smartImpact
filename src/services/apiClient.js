import { API_CONFIG } from './apiConfig.js'

/**
 * Custom API Error class with normalized error metadata.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, type = 'unknown', endpoint = '', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.type = type // 'timeout' | 'network' | 'http' | 'offline' | 'parser'
    this.endpoint = endpoint
    this.details = details
  }
}

/**
 * Perform an HTTP request with timeout, cancellation, and normalized errors.
 *
 * @param {string} endpoint - Relative path (e.g. '/telemetry/latest') or full URL
 * @param {object} [options]
 * @param {'GET' | 'POST' | 'PUT' | 'DELETE'} [options.method='GET']
 * @param {object} [options.body]
 * @param {object} [options.headers]
 * @param {number} [options.timeoutMs]
 * @param {AbortSignal} [options.signal] - External signal for effect cleanup
 * @returns {Promise<any>} Parsed JSON response
 */
export async function request(endpoint, options = {}) {
  // Check if browser is strictly offline
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ApiError('Koneksi internet browser terputus (Browser Offline).', {
      type: 'offline',
      endpoint,
    })
  }

  const {
    method = 'GET',
    body = null,
    headers = {},
    timeoutMs = API_CONFIG.timeoutMs,
    signal: externalSignal,
  } = options

  // Build full target URL
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_CONFIG.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  // Set up internal AbortController for timeout
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => {
    timeoutController.abort(new Error('Request timeout'))
  }, timeoutMs)

  // Combine external cancellation signal with internal timeout signal
  const activeSignal = externalSignal
    ? anySignal([externalSignal, timeoutController.signal])
    : timeoutController.signal

  const requestHeaders = {
    Accept: 'application/json',
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : null,
      signal: activeSignal,
    })

    clearTimeout(timeoutId)

    // Handle non-OK HTTP status codes (4xx, 5xx)
    if (!response.ok) {
      let serverErrorMsg = `Permintaan API gagal dengan status HTTP ${response.status}.`
      let details = null

      try {
        const errorJson = await response.json()
        if (errorJson && (errorJson.message || errorJson.error)) {
          serverErrorMsg = errorJson.message || errorJson.error
        }
        details = errorJson
      } catch {
        // Body was not JSON
      }

      throw new ApiError(serverErrorMsg, {
        status: response.status,
        type: 'http',
        endpoint,
        details,
      })
    }

    // Parse JSON safely
    try {
      return await response.json()
    } catch (parseErr) {
      throw new ApiError('Format respons dari server bukan JSON yang valid.', {
        status: response.status,
        type: 'parser',
        endpoint,
        details: parseErr.message,
      })
    }
  } catch (err) {
    clearTimeout(timeoutId)

    if (err instanceof ApiError) {
      throw err
    }

    // Detect timeout or abort
    if (err.name === 'AbortError' || activeSignal.aborted) {
      const isTimeout = timeoutController.signal.aborted
      throw new ApiError(
        isTimeout
          ? `Batas waktu permintaan terlampaui (${timeoutMs}ms). Server backend lambat atau tidak merespons.`
          : 'Permintaan dibatalkan oleh sistem.',
        {
          type: isTimeout ? 'timeout' : 'cancelled',
          endpoint,
        },
      )
    }

    // General network failures (CORS, DNS, connection refused)
    throw new ApiError('Gagal menghubungi backend API smartImpact. Pastikan server lokal/proxy telah berjalan.', {
      type: 'network',
      endpoint,
      details: err.message,
    })
  }
}

/**
 * Combines multiple AbortSignals into a single signal.
 */
function anySignal(signals) {
  const controller = new AbortController()

  function onAbort(e) {
    controller.abort(e?.target?.reason)
    signals.forEach((s) => s.removeEventListener('abort', onAbort))
  }

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      return signal
    }
    signal.addEventListener('abort', onAbort)
  }

  return controller.signal
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
}

export default apiClient
