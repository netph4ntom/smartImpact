/**
 * test-regression.mjs
 * Comprehensive regression test suite for smartImpact (Tahap 10).
 * Tests:
 * 1. Sensor format and units
 * 2. 0 / null / NaN / undefined values (AGENT.md zero-is-valid compliance)
 * 3. Timestamp parsing, formatting, and relative times
 * 4. Freshness status (online, stale, offline, unknown)
 * 5. Telemetry payload normalizer (nested, flat Blynk, partial failure)
 * 6. Threshold evaluation rules (normal, warning, danger, unconfigured)
 * 7. Settings form validation (technical limits, min >= max, non-numeric)
 * 8. History dataset calculations (empty, single point, mixed, unsorted)
 * 9. Credential leakage audit across src/ and dist/
 */

import fs from 'node:fs'
import path from 'node:path'
import { formatSensorValue, formatTimestamp, formatRelativeTime } from './src/utils/formatters.js'
import { determineFreshness } from './src/utils/telemetry.js'
import { SENSOR_METADATA, evaluateSensorStatus } from './src/utils/thresholds.js'
import { normalizeTelemetry } from './src/services/telemetryService.js'
import { calculateDatasetStats, sortChronologically } from './src/services/historyService.js'
import { validateThresholdInputs } from './src/services/settingsService.js'

console.log('====================================================')
console.log('   smartImpact — TAHAP 10 REGRESSION TEST SUITE    ')
console.log('====================================================\n')

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

// ---------------------------------------------------------------------------
// SUITE 1: Sensor Metadata, Formatting, and Units
// ---------------------------------------------------------------------------
console.log('--- 1. Sensor Metadata, Formatting & Units ---')

assert(SENSOR_METADATA.temperature.unit === '°C', 'Temperature unit is °C')
assert(SENSOR_METADATA.ph.unit === 'mg/L', 'Oksigen unit is mg/L')
assert(SENSOR_METADATA.ph.name === 'Oksigen', 'Oksigen sensor name is Oksigen')
assert(SENSOR_METADATA.turbidity.unit === 'mg/L', 'Amonia unit is mg/L')
assert(SENSOR_METADATA.turbidity.name === 'Amonia', 'Amonia sensor name is Amonia')
assert(SENSOR_METADATA.tds.unit === 'ppt', 'Salinitas unit is ppt')

assert(formatSensorValue(25.4, 1) === '25.4', 'Formats 25.4 with 1 decimal as "25.4"')
assert(formatSensorValue(7.234, 1) === '7.2', 'Rounds 7.234 to "7.2"')
assert(formatSensorValue(320, 0) === '320', 'Formats 320 with 0 decimals as "320"')

// ---------------------------------------------------------------------------
// SUITE 2: Edge Cases: 0, Null, NaN, Undefined, String Numbers
// ---------------------------------------------------------------------------
console.log('\n--- 2. Handling 0, Null, NaN, and Non-Numeric ---')

// 0 must be treated as valid numeric, never falsy fallback!
assert(formatSensorValue(0, 1) === '0.0', 'formatSensorValue(0, 1) returns "0.0"')
assert(formatSensorValue(0, 0) === '0', 'formatSensorValue(0, 0) returns "0"')
assert(formatSensorValue('0', 1) === '0.0', 'formatSensorValue("0", 1) returns "0.0"')

const zeroTurbidityEval = evaluateSensorStatus(0, 'turbidity')
assert(zeroTurbidityEval.valid === true, 'Turbidity 0 is marked valid: true')
assert(zeroTurbidityEval.status === 'normal', 'Turbidity 0 is evaluated as normal')

const zeroTdsEval = evaluateSensorStatus(0, 'tds')
assert(zeroTdsEval.valid === true, 'TDS 0 is marked valid: true')
assert(zeroTdsEval.status === 'normal', 'TDS 0 is evaluated as normal')

// Null and undefined
assert(formatSensorValue(null) === '--', 'formatSensorValue(null) returns "--"')
assert(formatSensorValue(undefined) === '--', 'formatSensorValue(undefined) returns "--"')

const nullEval = evaluateSensorStatus(null, 'temperature')
assert(nullEval.valid === false && nullEval.status === 'unknown', 'Null value gives status unknown and valid false')
assert(nullEval.label === 'Belum ada data', 'Null value displays label "Belum ada data"')

// NaN and non-numeric
assert(formatSensorValue(Number.NaN) === 'Invalid', 'formatSensorValue(NaN) returns "Invalid"')
assert(formatSensorValue('abc') === 'Invalid', 'formatSensorValue("abc") returns "Invalid"')

const nanEval = evaluateSensorStatus(Number.NaN, 'ph')
assert(nanEval.valid === false && nanEval.status === 'danger', 'NaN sensor reading gives status danger')
assert(nanEval.label === 'Nilai Tidak Valid', 'NaN sensor reading displays label "Nilai Tidak Valid"')

// ---------------------------------------------------------------------------
// SUITE 3: Timestamp Formatting and Relative Times
// ---------------------------------------------------------------------------
console.log('\n--- 3. Timestamp & Relative Time Formatting ---')

const fixedNow = new Date('2026-10-25T12:00:00.000Z')
const justNow = new Date(fixedNow.getTime() - 30 * 1000).toISOString()
const tenMinAgo = new Date(fixedNow.getTime() - 10 * 60 * 1000).toISOString()
const twoHoursAgo = new Date(fixedNow.getTime() - 2 * 60 * 60 * 1000).toISOString()
const twoDaysAgo = new Date(fixedNow.getTime() - 48 * 60 * 60 * 1000).toISOString()

assert(formatRelativeTime(justNow, fixedNow) === 'Baru saja', 'Relative time < 1 min formats to "Baru saja"')
assert(formatRelativeTime(tenMinAgo, fixedNow) === '10 menit yang lalu', '10 min ago formats to "10 menit yang lalu"')
assert(formatRelativeTime(twoHoursAgo, fixedNow) === '2 jam yang lalu', '2 hours ago formats to "2 jam yang lalu"')
assert(formatRelativeTime(twoDaysAgo, fixedNow) === '2 hari yang lalu', '2 days ago formats to "2 hari yang lalu"')

assert(formatRelativeTime(null) === 'Belum tersedia', 'Null timestamp gives "Belum tersedia"')
assert(formatRelativeTime('not-a-date') === 'Waktu tidak valid', 'Malformed timestamp gives "Waktu tidak valid"')
assert(formatTimestamp(null) === 'Belum ada data', 'formatTimestamp(null) returns "Belum ada data"')
assert(formatTimestamp('invalid') === 'Waktu tidak valid', 'formatTimestamp("invalid") returns "Waktu tidak valid"')

// ---------------------------------------------------------------------------
// SUITE 4: Telemetry Freshness & Online Status
// ---------------------------------------------------------------------------
console.log('\n--- 4. Telemetry Freshness Status ---')

const freshNow = new Date()
const fresh5m = new Date(freshNow.getTime() - 5 * 60000).toISOString()
const fresh15m = new Date(freshNow.getTime() - 15 * 60000).toISOString()
const fresh45m = new Date(freshNow.getTime() - 45 * 60000).toISOString()

const statusOnline = determineFreshness(fresh5m)
assert(statusOnline.status === 'online' && !statusOnline.isStale, '5 min telemetry is online and not stale')

const statusStale = determineFreshness(fresh15m)
assert(statusStale.status === 'stale' && statusStale.isStale, '15 min telemetry is stale')

const statusOffline = determineFreshness(fresh45m)
assert(statusOffline.status === 'offline' && statusOffline.isStale, '45 min telemetry is offline')

const statusUnknown = determineFreshness(null)
assert(statusUnknown.status === 'unknown', 'Missing timestamp gives unknown status')

// ---------------------------------------------------------------------------
// SUITE 5: Telemetry Normalizer (Nested & Flat & Partial Failure)
// ---------------------------------------------------------------------------
console.log('\n--- 5. Telemetry Normalizer ---')

// A. Standard nested payload
const nestedData = {
  deviceId: 'ESP32-NODE-01',
  deviceName: 'Sensor Node Ciliwung',
  location: 'Ciliwung Hilir',
  receivedAt: fresh5m,
  sensors: {
    temperature: { value: 26.2 },
    ph: { value: 7.4 },
    turbidity: { value: 3.8 },
    tds: { value: 240 },
  },
}
const normNested = normalizeTelemetry(nestedData)
assert(normNested.deviceId === 'ESP32-NODE-01', 'Maps deviceId correctly')
assert(normNested.sensors.length === 4, 'Maps all 4 water quality sensors')
assert(normNested.hasPartialFailure === false, 'Flags hasPartialFailure: false for complete payload')

// B. Flat Blynk REST API format with string numbers
const flatBlynk = {
  v0: '28.1', // temperature
  v1: '6.9',  // pH
  v2: '4.2',  // turbidity
  v3: '295',  // TDS
  time: fresh5m,
}
const normFlat = normalizeTelemetry(flatBlynk)
assert(normFlat.sensors[0].value === 28.1, 'Parses v0 string "28.1" to 28.1 °C')
assert(normFlat.sensors[1].value === 6.9, 'Parses v1 string "6.9" to 6.9 mg/L')
assert(normFlat.sensors[2].value === 4.2, 'Parses v2 string "4.2" to 4.2 mg/L')
assert(normFlat.sensors[3].value === 295, 'Parses v3 string "295" to 295 ppm')

// C. Partial sensor failure
const partialData = {
  receivedAt: fresh5m,
  sensors: {
    temperature: { value: 25.0 },
    ph: { value: null }, // sensor failed
    turbidity: { value: 'ERR_TIMEOUT' }, // sensor bad reading
    tds: { value: 310 },
  },
}
const normPartial = normalizeTelemetry(partialData)
assert(normPartial.hasPartialFailure === true, 'Flags hasPartialFailure: true')
assert(normPartial.failedSensors.length === 2, 'Identifies exactly 2 failed sensors')
assert(normPartial.sensors[0].valid === true && normPartial.sensors[3].valid === true, 'Valid sensors remain functional')
assert(normPartial.sensors[1].valid === false && normPartial.sensors[2].valid === false, 'Failed sensors marked invalid')

// ---------------------------------------------------------------------------
// SUITE 6: Threshold Evaluation Rules
// ---------------------------------------------------------------------------
console.log('\n--- 6. Threshold Evaluation Rules ---')

// Normal
const tempNormal = evaluateSensorStatus(25.0, 'temperature')
assert(tempNormal.status === 'normal' && tempNormal.label === 'Normal', '25.0°C evaluates to Normal')

// Warning (between normal min 4.0 and critical warnMin 3.0)
const phWarning = evaluateSensorStatus(3.5, 'ph')
assert(phWarning.status === 'warning' && phWarning.label === 'Perhatian', 'Oksigen 3.5 evaluates to Warning / Perhatian')

// Danger / Critical (below warnMin 3.0)
const phDanger = evaluateSensorStatus(2.0, 'ph')
assert(phDanger.status === 'danger' && phDanger.label === 'Kritis', 'Oksigen 2.0 evaluates to Danger / Kritis')

// Unconfigured threshold (null)
const unconfiguredEval = evaluateSensorStatus(25.0, 'temperature', null)
assert(unconfiguredEval.status === 'unknown', 'Null custom threshold gives status unknown')
assert(unconfiguredEval.label === 'Batas belum diatur', 'Null threshold gives label "Batas belum diatur"')
assert(unconfiguredEval.valid === true, 'Measurement itself remains valid: true')

// ---------------------------------------------------------------------------
// SUITE 7: Settings Form Validation
// ---------------------------------------------------------------------------
console.log('\n--- 7. Settings Form Validation ---')

// Valid threshold configuration
const validForm = {
  tempMin: '20',
  tempMax: '30',
  phMin: '4.0',
  phMax: '10.0',
  turbMax: '0.1',
  tdsMax: '35',
}
const valResult1 = validateThresholdInputs(validForm)
assert(valResult1.isValid === true, 'Valid form passes validation with isValid: true')

// Invalid: tempMin >= tempMax
const invertedTemp = { ...validForm, tempMin: '32', tempMax: '25' }
const valResult2 = validateThresholdInputs(invertedTemp)
assert(valResult2.isValid === false && valResult2.errors.temperature, 'Catches tempMin >= tempMax')

// Invalid: Oksigen outside 0 - 20
const invalidPh = { ...validForm, phMax: '25.0' }
const valResult3 = validateThresholdInputs(invalidPh)
assert(valResult3.isValid === false && valResult3.errors.ph, 'Catches oksigen > 20')

// Invalid: Negative or 0 amonia max
const negativeTurb = { ...validForm, turbMax: '-2' }
const valResult4 = validateThresholdInputs(negativeTurb)
assert(valResult4.isValid === false && valResult4.errors.turbidity, 'Catches negative amonia threshold')

// Invalid: Non-numeric strings
const nonNumeric = { ...validForm, tdsMax: 'tiga_ratus' }
const valResult5 = validateThresholdInputs(nonNumeric)
assert(valResult5.isValid === false && valResult5.errors.tds, 'Catches non-numeric input')

// ---------------------------------------------------------------------------
// SUITE 8: History Dataset Calculations & Edge Cases
// ---------------------------------------------------------------------------
console.log('\n--- 8. History Dataset Calculations & Edge Cases ---')

// Empty dataset
const emptyStats = calculateDatasetStats([])
assert(emptyStats.count === 0, 'Empty dataset count is 0')
assert(emptyStats.min === null && emptyStats.formattedMin === '--', 'Empty dataset min is null and "--"')

// Single point dataset
const singlePoint = [{ value: 25.4, timestamp: '2026-10-25T10:00:00Z' }]
const singleStats = calculateDatasetStats(singlePoint, 1)
assert(singleStats.count === 1, 'Single point count is 1')
assert(singleStats.min === 25.4 && singleStats.max === 25.4 && singleStats.avg === 25.4, 'Min, max, avg all equal 25.4')

// Mixed dataset with invalid / NaN / null / 0
const mixedPoints = [
  { value: 24.0 },
  { value: Number.NaN },
  { value: 0 }, // 0 is valid!
  { value: null },
  { value: 26.0 },
]
const mixedStats = calculateDatasetStats(mixedPoints, 1)
assert(mixedStats.count === 3, 'Valid points count is 3 (24, 0, 26)')
assert(mixedStats.min === 0, 'Min is 0 (zero is valid number)')
assert(mixedStats.max === 26.0, 'Max is 26.0')
assert(mixedStats.avg === 16.7, 'Avg is (24 + 0 + 26) / 3 = 16.7')
assert(mixedStats.hasInvalid === true, 'Flags hasInvalid: true')

// Unsorted timestamps sorting
const jumbled = [
  { timestamp: '2026-10-25T08:00:00Z', val: 3 },
  { timestamp: '2026-10-25T02:00:00Z', val: 1 },
  { timestamp: '2026-10-25T05:00:00Z', val: 2 },
]
const sortedJumbled = sortChronologically(jumbled)
assert(sortedJumbled[0].val === 1 && sortedJumbled[2].val === 3, 'sortChronologically sorts ascending by time')

// ---------------------------------------------------------------------------
// SUITE 9: Credential Leakage Audit
// ---------------------------------------------------------------------------
console.log('\n--- 9. Security & Credential Leakage Audit ---')

const rootDir = process.cwd()

function checkDirectoryForSecrets(dirPath, forbiddenRegexes) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true })
  let leaks = []

  for (const file of files) {
    const fullPath = path.join(dirPath, file.name)
    if (file.isDirectory()) {
      if (file.name !== 'node_modules' && file.name !== '.git' && file.name !== 'dist-test') {
        leaks = leaks.concat(checkDirectoryForSecrets(fullPath, forbiddenRegexes))
      }
    } else if (file.isFile()) {
      // Only inspect text source files
      if (/\.(js|jsx|ts|tsx|json|html|css|env)$/i.test(file.name)) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        for (const { name, regex } of forbiddenRegexes) {
          if (regex.test(content)) {
            leaks.push({ file: fullPath, pattern: name })
          }
        }
      }
    }
  }
  return leaks
}

const forbiddenPatterns = [
  { name: 'Hardcoded Blynk Auth Token declaration', regex: /(?:blynk[_-]?auth[_-]?token|auth[_-]?token)\s*[:=]\s*['"][a-zA-Z0-9_-]{20,}['"]/i },
  { name: 'VITE_BLYNK_AUTH_TOKEN secret assignment', regex: /VITE_.*(TOKEN|SECRET|PASSWORD)\s*=\s*['"][^'"]+['"]/i },
  { name: 'Direct private key block', regex: /-----BEGIN (RSA|EC|PRIVATE) KEY-----/ },
]

const srcLeaks = checkDirectoryForSecrets(path.join(rootDir, 'src'), forbiddenPatterns)
assert(srcLeaks.length === 0, 'No secrets or auth tokens detected in src/')

if (fs.existsSync(path.join(rootDir, 'dist'))) {
  const distLeaks = checkDirectoryForSecrets(path.join(rootDir, 'dist'), forbiddenPatterns)
  assert(distLeaks.length === 0, 'No secrets or auth tokens detected in production dist/')
}

// ---------------------------------------------------------------------------
// FINAL REPORT
// ---------------------------------------------------------------------------
console.log('\n====================================================')
console.log(`TAHAP 10 REGRESSION SUITE: ${passed} PASSED, ${failed} FAILED`)
console.log('====================================================')

if (failed > 0) {
  process.exit(1)
}
