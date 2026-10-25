import { normalizeTelemetry } from './src/services/telemetryService.js'
import { calculateDatasetStats, sortChronologically } from './src/services/historyService.js'
import { determineFreshness, assessTelemetryHealth } from './src/utils/telemetry.js'
import { evaluateSensorStatus } from './src/utils/thresholds.js'

console.log('--- RUNNING TAHAP 7 VALIDATION SUITE ---')

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`)
    passed++
  } else {
    console.error(`❌ FAIL: ${message}`)
    failed++
  }
}

// Test 1: Standard structured payload
const standardPayload = {
  deviceId: 'ESP32-TEST',
  deviceName: 'ESP32 Water Node',
  location: 'Sungai Ciliwung',
  receivedAt: new Date(Date.now() - 60 * 1000).toISOString(), // 1 minute ago
  sensors: {
    temperature: { value: 26.5, unit: '°C' },
    ph: { value: 7.2, unit: '' },
    turbidity: { value: 4.1, unit: 'NTU' },
    tds: { value: 290, unit: 'ppm' },
  },
}

const norm1 = normalizeTelemetry(standardPayload)
assert(norm1.connectionStatus === 'online', 'Fresh timestamp results in online status')
assert(norm1.sensors.length === 4, 'Contains 4 water quality sensors')
assert(norm1.sensors[0].formattedValue === '26.5' && norm1.sensors[0].unit === '°C', 'Temperature normalized with °C')
assert(norm1.sensors[1].formattedValue === '7.2', 'pH normalized with 1 decimal')
assert(norm1.sensors[2].formattedValue === '4.1' && norm1.sensors[2].unit === 'NTU', 'Turbidity normalized with NTU')
assert(norm1.sensors[3].formattedValue === '290' && norm1.sensors[3].unit === 'ppm', 'TDS normalized with ppm')
assert(norm1.hasPartialFailure === false, 'No partial failure in standard payload')

// Test 2: Flat payload with string numbers (typical Blynk REST API returns)
const blynkFlatPayload = {
  device_id: 'ESP32-BLYNK',
  timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  temp: '27.4',
  ph: '6.85',
  turb: '3.5',
  tds: '310',
}

const norm2 = normalizeTelemetry(blynkFlatPayload)
assert(norm2.sensors[0].value === 27.4, 'Converts string temperature "27.4" to number 27.4')
assert(norm2.sensors[1].value === 6.85, 'Converts string pH "6.85" to number 6.85')
assert(norm2.sensors[2].value === 3.5, 'Converts string turbidity "3.5" to number 3.5')
assert(norm2.sensors[3].value === 310, 'Converts string TDS "310" to number 310')

// Test 3: Partial Sensor Failure
const partialPayload = {
  receivedAt: new Date(Date.now() - 60 * 1000).toISOString(),
  sensors: {
    temperature: { value: 25.0 },
    ph: { value: null }, // sensor disconnected
    turbidity: { value: 4.0 },
    tds: { value: 'INVALID_ADC' }, // sensor reading corrupted
  },
}

const norm3 = normalizeTelemetry(partialPayload)
assert(norm3.hasPartialFailure === true, 'Accurately flags hasPartialFailure: true')
assert(norm3.failedSensors.includes('pH') && norm3.failedSensors.includes('TDS'), 'Identifies failed sensors: pH & TDS')
assert(norm3.sensors[0].valid === true, 'Temperature remains valid and functional')
assert(norm3.sensors[1].valid === false, 'pH correctly marked invalid')
assert(norm3.sensors[3].valid === false, 'TDS corrupted reading marked invalid')

// Test 4: Stale and Offline Freshness Evaluation
const staleDate = new Date(Date.now() - 11 * 60 * 1000).toISOString() // 11 min ago
const offlineDate = new Date(Date.now() - 35 * 60 * 1000).toISOString() // 35 min ago

const freshStale = determineFreshness(staleDate)
assert(freshStale.status === 'stale' && freshStale.isStale === true, '11 minutes evaluates to stale')

const freshOffline = determineFreshness(offlineDate)
assert(freshOffline.status === 'offline' && freshOffline.isStale === true, '35 minutes evaluates to offline')

// Test 5: Dataset stats and chronological sorting
const unsortedPoints = [
  { timestamp: '2026-10-25T04:00:00Z', value: 28.0 },
  { timestamp: '2026-10-25T01:00:00Z', value: 24.0 },
  { timestamp: '2026-10-25T03:00:00Z', value: 26.0 },
  { timestamp: '2026-10-25T02:00:00Z', value: 'invalid' },
]

const sorted = sortChronologically(unsortedPoints)
assert(sorted[0].value === 24.0, 'Chronologically sorts points ascending')
assert(sorted[sorted.length - 1].value === 28.0, 'Last point is latest timestamp')

const stats = calculateDatasetStats(sorted, 1)
assert(stats.min === 24.0, 'Calculates min correctly ignoring invalid values')
assert(stats.max === 28.0, 'Calculates max correctly')
assert(stats.avg === 26.0, 'Calculates avg: (24+26+28)/3 = 26.0')
assert(stats.hasInvalid === true, 'Flags hasInvalid: true when non-numeric point exists')

// Test 6: Direct assessment of telemetry health and threshold status
const healthEval = assessTelemetryHealth([
  { id: 'temperature', name: 'Suhu Air', valid: true, value: 25.0 },
  { id: 'ph', name: 'pH', valid: false, value: null },
])
assert(healthEval.hasPartialFailure === true, 'assessTelemetryHealth detects partial failure')

const thresholdEval = evaluateSensorStatus(14.0, 'ph')
assert(thresholdEval.status === 'danger', 'evaluateSensorStatus detects critical pH out-of-range')

console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`)
if (failed > 0) process.exit(1)
