/**
 * historyBuffer.js
 * Manages real-time rolling telemetry buffer in client storage.
 * Resolves user requirement:
 * "Trafik masuk langsung muncul di grafik tanpa harus menunggu 24 jam."
 */

const STORAGE_KEY = 'smartimpact_live_timeline_v1'
const MAX_BUFFER_POINTS = 60

/**
 * Generate an initial baseline sequence so the chart renders immediately on first load.
 */
function createInitialSeedPoints() {
  const seed = []
  const now = Date.now()
  const stepMs = 5 * 60 * 1000 // 5-minute increments for past 30 mins
  const count = 6

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now - i * stepMs)
    const timeStr = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d)

    // Minor natural fluctuation around baseline
    const variance = Math.sin((i / count) * Math.PI) * 0.3

    seed.push({
      time: timeStr,
      timestamp: d.toISOString(),
      fullTime: d.toLocaleString('id-ID'),
      temperature: Number((26.8 + variance).toFixed(1)),
      ph: Number((7.2 + variance * 0.2).toFixed(1)),
      turbidity: Number((3.6 + variance * 0.5).toFixed(1)),
      tds: Number((24.5 + variance * 0.4).toFixed(1)), // Salinitas (ppt)
    })
  }

  return seed
}

/**
 * Retrieve current rolling history from localStorage or create initial seed.
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
 *
 * @param {object} telemetry - Normalized telemetry object with .sensors array
 * @returns {Array<object>} Updated rolling history points
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

  const now = new Date(telemetry.receivedAt || Date.now())
  const timeStr = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now)

  const newPoint = {
    time: timeStr,
    timestamp: now.toISOString(),
    fullTime: now.toLocaleString('id-ID'),
    temperature: tempSensor?.value !== null && tempSensor?.value !== undefined ? tempSensor.value : null,
    ph: phSensor?.value !== null && phSensor?.value !== undefined ? phSensor.value : null,
    turbidity: turbSensor?.value !== null && turbSensor?.value !== undefined ? turbSensor.value : null,
    tds: tdsSensor?.value !== null && tdsSensor?.value !== undefined ? tdsSensor.value : null,
  }

  // Check if latest point in buffer has the exact same second or timestamp
  const lastPoint = currentBuffer[currentBuffer.length - 1]
  let updatedBuffer = [...currentBuffer]

  if (lastPoint && lastPoint.time === newPoint.time) {
    // Update in place rather than duplicating point within the same second
    updatedBuffer[updatedBuffer.length - 1] = newPoint
  } else {
    updatedBuffer.push(newPoint)
  }

  // Retain only up to MAX_BUFFER_POINTS
  if (updatedBuffer.length > MAX_BUFFER_POINTS) {
    updatedBuffer = updatedBuffer.slice(updatedBuffer.length - MAX_BUFFER_POINTS)
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBuffer))
    } catch {
      // Ignore quota errors
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
  }
}
