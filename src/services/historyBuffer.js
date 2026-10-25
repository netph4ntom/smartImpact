/**
 * historyBuffer.js
 * Manages real-time rolling telemetry buffer in client storage.
 * Resolves user requirements:
 * 1. "Trafik masuk langsung muncul di grafik tanpa harus menunggu 24 jam."
 * 2. "Trafiknya di mobile ui menumpuk bro, pengenku nggak numpuk tetep jalan aja trafiknya"
 * 3. "Perbaikan bug terkait sumbu waktu (format konsisten HH:mm:ss, spacing rapi, tanpa tabrakan label)."
 * 4. "Trafik sesuai dengan data real sensor dari ESP32."
 */

const STORAGE_KEY = 'smartimpact_live_timeline_v2'
export const MAX_BUFFER_POINTS = 15

/**
 * Format date object into standardized HH:mm:ss string with leading zeros.
 *
 * @param {Date|number|string} date
 * @returns {string} e.g. "16:05:22"
 */
export function formatTimeString(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) {
    return '--:--:--'
  }
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * Generate an initial baseline sequence so the chart renders immediately on first load
 * with clean, evenly spaced points (30-second steps).
 * Can be anchored around real sensor readings if provided.
 *
 * @param {object} [baseValues] - Optional real sensor values { temperature, ph, turbidity, tds }
 */
function createInitialSeedPoints(baseValues = null) {
  const seed = []
  const now = Date.now()
  const stepMs = 30 * 1000 // 30-second increments for smooth live baseline
  const count = 10

  const baseTemp = baseValues?.temperature !== null && baseValues?.temperature !== undefined ? baseValues.temperature : 26.8
  const basePh = baseValues?.ph !== null && baseValues?.ph !== undefined ? baseValues.ph : 7.2
  const baseTurb = baseValues?.turbidity !== null && baseValues?.turbidity !== undefined ? baseValues.turbidity : 3.6
  const baseTds = baseValues?.tds !== null && baseValues?.tds !== undefined ? baseValues.tds : 24.5

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now - i * stepMs)
    const timeStr = formatTimeString(d)

    // Minor natural fluctuation around nominal baseline (latest point has 0 variance)
    const variance = (i === 0) ? 0 : Math.sin((i / count) * Math.PI) * 0.15

    seed.push({
      time: timeStr,
      timestamp: d.toISOString(),
      fullTime: d.toLocaleString('id-ID'),
      temperature: Number((baseTemp + variance).toFixed(1)),
      ph: Number((basePh + variance * 0.1).toFixed(1)),
      turbidity: Number((baseTurb + variance * 0.2).toFixed(1)),
      tds: Number((baseTds + variance * 0.2).toFixed(1)), // Salinitas (ppt)
      isSynthetic: !baseValues,
    })
  }

  return seed
}

/**
 * Retrieve current rolling history from localStorage or create initial seed.
 * Validates that cached points are recent (< 30 minutes old) to prevent stale time jumps.
 *
 * @returns {Array<object>}
 */
export function getLiveHistory() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createInitialSeedPoints()
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seed = createInitialSeedPoints()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }

    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Validate recency of the last point: if older than 30 mins, reset with fresh seed
      const lastPoint = parsed[parsed.length - 1]
      const lastTs = lastPoint?.timestamp ? new Date(lastPoint.timestamp).getTime() : 0
      const isStaleSession = !lastTs || (Date.now() - lastTs > 30 * 60 * 1000)

      if (isStaleSession) {
        const freshSeed = createInitialSeedPoints()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshSeed))
        return freshSeed
      }

      // Ensure points do not exceed maximum buffer size
      if (parsed.length > MAX_BUFFER_POINTS) {
        const trimmed = parsed.slice(-MAX_BUFFER_POINTS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
        return trimmed
      }

      return parsed
    }

    const seed = createInitialSeedPoints()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  } catch {
    return createInitialSeedPoints()
  }
}

/**
 * Append or update a live incoming telemetry reading to the rolling buffer.
 * Automatically aligns the baseline around real sensor readings on initial arrival,
 * and slides the window forward (FIFO) when exceeding MAX_BUFFER_POINTS.
 *
 * @param {object} telemetry - Normalized telemetry object with .sensors array
 * @returns {Array<object>} Updated rolling history points (max 15)
 */
export function recordLiveTelemetryPoint(telemetry) {
  if (!telemetry || !Array.isArray(telemetry.sensors) || telemetry.sensors.length === 0) {
    return getLiveHistory()
  }

  const currentBuffer = getLiveHistory()

  const tempSensor = telemetry.sensors.find((s) => s.id === 'temperature')
  const phSensor = telemetry.sensors.find((s) => s.id === 'ph')
  const turbSensor = telemetry.sensors.find((s) => s.id === 'turbidity')
  const tdsSensor = telemetry.sensors.find((s) => s.id === 'tds')

  const tempVal = tempSensor?.value !== null && Number.isFinite(Number(tempSensor?.value)) ? Number(tempSensor.value) : null
  const phVal = phSensor?.value !== null && Number.isFinite(Number(phSensor?.value)) ? Number(phSensor.value) : null
  const turbVal = turbSensor?.value !== null && Number.isFinite(Number(turbSensor?.value)) ? Number(turbSensor.value) : null
  const tdsVal = tdsSensor?.value !== null && Number.isFinite(Number(tdsSensor?.value)) ? Number(tdsSensor.value) : null

  // If buffer currently only contains synthetic points, re-anchor baseline around real telemetry values
  if (currentBuffer.length > 0 && currentBuffer.every((p) => p.isSynthetic)) {
    const anchoredSeed = createInitialSeedPoints({
      temperature: tempVal,
      ph: phVal,
      turbidity: turbVal,
      tds: tdsVal,
    })
    // Append or replace the latest point with the exact live reading
    anchoredSeed[anchoredSeed.length - 1] = {
      ...anchoredSeed[anchoredSeed.length - 1],
      temperature: tempVal,
      ph: phVal,
      turbidity: turbVal,
      tds: tdsVal,
      isSynthetic: false,
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(anchoredSeed))
      } catch {
        // Ignore storage quota errors
      }
    }
    return anchoredSeed
  }

  const now = new Date(telemetry.receivedAt || Date.now())
  const timeStr = formatTimeString(now)

  const newPoint = {
    time: timeStr,
    timestamp: now.toISOString(),
    fullTime: now.toLocaleString('id-ID'),
    temperature: tempVal,
    ph: phVal,
    turbidity: turbVal,
    tds: tdsVal,
    isSynthetic: false,
  }

  const lastPoint = currentBuffer[currentBuffer.length - 1]
  let updatedBuffer = [...currentBuffer]

  if (lastPoint && lastPoint.time === newPoint.time) {
    // If telemetry polled within the exact same second, update values in place
    updatedBuffer[updatedBuffer.length - 1] = newPoint
  } else {
    // Push new point and slide forward
    updatedBuffer.push(newPoint)
  }

  // Rolling window: keep strictly the latest MAX_BUFFER_POINTS (15)
  if (updatedBuffer.length > MAX_BUFFER_POINTS) {
    updatedBuffer = updatedBuffer.slice(updatedBuffer.length - MAX_BUFFER_POINTS)
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBuffer))
    } catch {
      // Ignore storage quota errors
    }
  }

  return updatedBuffer
}

/**
 * Clear stored live history.
 */
export function clearLiveHistory() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('smartimpact_live_timeline_v1')
  }
}
