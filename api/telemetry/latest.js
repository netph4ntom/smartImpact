/**
 * /api/telemetry/latest
 * Vercel Serverless Function (Node.js runtime)
 *
 * Fetches real-time sensor datastreams from Blynk Cloud using server-side credentials.
 * Security: BLYNK_AUTH_TOKEN is never exposed to browser clients.
 */
export default async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const token = process.env.BLYNK_AUTH_TOKEN
  const server = (process.env.BLYNK_SERVER || 'blynk.cloud')
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
  const deviceName = process.env.DEVICE_NAME || 'ESP32'
  const deviceId = process.env.DEVICE_ID || 'ESP32-001'
  const location = process.env.DEVICE_LOCATION || 'Politeknik Negeri Banyuwangi'

  // If token is missing, return friendly guidance without crashing
  if (!token) {
    return res.status(503).json({
      error:
        'BLYNK_AUTH_TOKEN belum dikonfigurasi. Masukkan BLYNK_AUTH_TOKEN pada Environment Variables di Vercel Settings atau file .env.local lokal.',
      configured: false,
    })
  }

  try {
    // 1. Fetch Virtual Pins V0, V1, V2, V3 from Blynk REST API
    const blynkApiUrl = `https://${server}/external/api/get?token=${encodeURIComponent(token)}&v0&v1&v2&v3`
    const blynkRes = await fetch(blynkApiUrl, {
      headers: { Accept: 'application/json' },
    })

    if (!blynkRes.ok) {
      const errText = await blynkRes.text().catch(() => '')
      return res.status(blynkRes.status).json({
        error: `Blynk Cloud mengembalikan HTTP ${blynkRes.status}: ${
          errText || 'Periksa apakah token Blynk valid dan server blynk.cloud/sgp1.blynk.cloud sesuai.'
        }`,
      })
    }

    const rawData = await blynkRes.json()

    // 2. Check hardware connectivity status from Blynk Cloud
    let isConnected = true
    try {
      const connUrl = `https://${server}/external/api/isHardwareConnected?token=${encodeURIComponent(token)}`
      const connRes = await fetch(connUrl)
      if (connRes.ok) {
        const connText = await connRes.text()
        isConnected = connText.trim().toLowerCase() === 'true'
      }
    } catch {
      // Non-critical, fallback to timestamp freshness
    }

    const nowIso = new Date().toISOString()

    // 3. Return sanitized telemetry payload for smartImpact frontend
    return res.status(200).json({
      deviceId,
      deviceName,
      location,
      receivedAt: isConnected ? nowIso : new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      isHardwareConnected: isConnected,
      sensors: {
        v0: rawData.v0 !== undefined ? rawData.v0 : rawData.V0,
        v1: rawData.v1 !== undefined ? rawData.v1 : rawData.V1,
        v2: rawData.v2 !== undefined ? rawData.v2 : rawData.V2,
        v3: rawData.v3 !== undefined ? rawData.v3 : rawData.V3,
      },
      ...rawData,
      source: 'live_api',
    })
  } catch (err) {
    return res.status(500).json({
      error: `Gagal menghubungi server Blynk Cloud (${server}): ${err.message}`,
    })
  }
}
