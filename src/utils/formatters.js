/**
 * formatters.js
 * Safe formatting utilities for sensor readings, timestamps, and numbers.
 * Complies with AGENT.md rules:
 * - 0 is a valid measurement; never use `value || "--"`
 * - Number.isFinite used to prevent NaN/Infinity
 * - Differentiate 0, null, undefined, and non-numeric
 */

/**
 * Format a sensor reading into a display string.
 *
 * @param {number | null | undefined} value - Raw measurement
 * @param {number} [decimals] - Optional fixed decimal places
 * @returns {string} Formatted string or '--'
 */
export function formatSensorValue(value, decimals = 1) {
  if (value === null || value === undefined) {
    return '--'
  }

  const num = Number(value)

  if (!Number.isFinite(num)) {
    return 'Invalid'
  }

  // If 0, it is a valid measurement
  if (num === 0) {
    return decimals > 0 ? (0).toFixed(decimals) : '0'
  }

  // Round if specified
  if (typeof decimals === 'number' && decimals >= 0) {
    // If it's an integer like TDS (e.g. 320), avoid unnecessary trailing zero if decimals is 0
    return num.toFixed(decimals)
  }

  return String(num)
}

/**
 * Format an ISO timestamp string into Indonesian standard format.
 * Example: "12 Jun 2025, 14:32"
 *
 * @param {string | Date | null | undefined} timestamp
 * @returns {string}
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'Belum ada data'

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return 'Waktu tidak valid'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

/**
 * Format relative elapsed time in Indonesian.
 * Example: "Baru saja", "3 menit yang lalu", "1 jam yang lalu"
 *
 * @param {string | Date | null | undefined} timestamp
 * @param {Date} [now]
 * @returns {string}
 */
export function formatRelativeTime(timestamp, now = new Date()) {
  if (!timestamp) return 'Belum tersedia'

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'Waktu tidak valid'

  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} jam yang lalu`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} hari yang lalu`
}
