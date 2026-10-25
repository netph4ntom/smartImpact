/**
 * telemetry.js
 * Evaluates telemetry freshness, partial failure, and connection health.
 * Reference: AGENT.md section 8 (Model data telemetri)
 */

/**
 * Determine connection status and freshness based on telemetry timestamp.
 *
 * @param {string | Date | null | undefined} receivedAt
 * @param {Date} [now]
 * @returns {{
 *   status: 'online' | 'stale' | 'offline' | 'unknown',
 *   label: string,
 *   isStale: boolean,
 *   ageMinutes: number | null
 * }}
 */
export function determineFreshness(receivedAt, now = new Date()) {
  if (!receivedAt) {
    return {
      status: 'unknown',
      label: 'Tidak Diketahui',
      isStale: false,
      ageMinutes: null,
    }
  }

  const date = receivedAt instanceof Date ? receivedAt : new Date(receivedAt)
  if (Number.isNaN(date.getTime())) {
    return {
      status: 'unknown',
      label: 'Format Waktu Invalid',
      isStale: false,
      ageMinutes: null,
    }
  }

  const diffMs = Math.max(0, now.getTime() - date.getTime())
  const ageMinutes = Math.floor(diffMs / 60000)

  // Within 5 minutes: Online
  if (ageMinutes <= 5) {
    return {
      status: 'online',
      label: 'Online',
      isStale: false,
      ageMinutes,
    }
  }

  // 5 to 15 minutes: Data terlambat (stale)
  if (ageMinutes <= 15) {
    return {
      status: 'stale',
      label: 'Data Terlambat',
      isStale: true,
      ageMinutes,
    }
  }

  // Over 15 minutes: Offline
  return {
    status: 'offline',
    label: 'Offline',
    isStale: true,
    ageMinutes,
  }
}

/**
 * Assess sensor array health for partial failure detection.
 *
 * @param {Array<{ id: string, valid: boolean, value: any }>} sensors
 * @returns {{
 *   hasPartialFailure: boolean,
 *   validCount: number,
 *   totalCount: number,
 *   failedSensors: string[]
 * }}
 */
export function assessTelemetryHealth(sensors) {
  if (!Array.isArray(sensors) || sensors.length === 0) {
    return {
      hasPartialFailure: false,
      validCount: 0,
      totalCount: 0,
      failedSensors: [],
    }
  }

  const failedSensors = sensors
    .filter((s) => {
      const val = s.rawValue !== undefined ? s.rawValue : s.value
      return !s.valid || val === null || val === undefined || !Number.isFinite(Number(val))
    })
    .map((s) => s.name || s.id)

  const validCount = sensors.length - failedSensors.length
  const hasPartialFailure = validCount > 0 && validCount < sensors.length

  return {
    hasPartialFailure,
    validCount,
    totalCount: sensors.length,
    failedSensors,
  }
}
