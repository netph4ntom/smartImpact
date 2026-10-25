import { useState, useEffect, useCallback, useRef } from 'react'
import { TelemetryContext } from './telemetryContextDefinition'
import { fetchLatestTelemetry } from '../services/telemetryService'
import { loadPreferences } from '../services/settingsService'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

/**
 * TelemetryProvider
 * Manages live telemetric state, background periodic polling, and error resilience.
 */
export function TelemetryProvider({ children }) {
  const isBrowserOnline = useNetworkStatus()

  const [telemetry, setTelemetry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fetchWarning, setFetchWarning] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  // Derived warning: Differentiate browser offline from ESP32 offline
  const refreshWarning = !isBrowserOnline
    ? 'Koneksi internet browser terputus (Browser Offline). Menampilkan data cache terakhir.'
    : fetchWarning

  // References to prevent overlapping requests and keep last valid telemetry
  const isFetchingRef = useRef(false)
  const lastValidTelemetryRef = useRef(null)

  // Main lifecycle effect with cleanup & cancellation
  useEffect(() => {
    let isCancelled = false
    const abortController = new AbortController()

    async function runFetch() {
      if (isFetchingRef.current) {
        return
      }
      isFetchingRef.current = true

      try {
        const data = await fetchLatestTelemetry({
          signal: abortController.signal,
        })

        if (!isCancelled && !abortController.signal.aborted) {
          setTelemetry(data)
          lastValidTelemetryRef.current = data
          setError(null)
          setFetchWarning(null)
          setLoading(false)
        }
      } catch (err) {
        if (isCancelled || abortController.signal.aborted) {
          return
        }

        const errorMessage = err.message || 'Terjadi kesalahan sistem saat memuat telemetri.'

        // Rule: "Pertahankan data terakhir yang valid saat refresh gagal bila aman, tetapi tandai stale."
        if (lastValidTelemetryRef.current) {
          setTelemetry((prev) => (prev ? { ...prev, isStale: true } : lastValidTelemetryRef.current))
          setFetchWarning(`Penyegaran data gagal: ${errorMessage}. Menampilkan data valid terakhir.`)
          setError(null)
        } else {
          setError(errorMessage)
          setTelemetry(null)
        }
        setLoading(false)
      } finally {
        isFetchingRef.current = false
      }
    }

    runFetch()

    // Setup periodic polling based on saved preferences
    const prefs = loadPreferences()
    const intervalMs = Math.max(5000, (prefs.refreshIntervalSeconds || 300) * 1000)

    const intervalId = setInterval(() => {
      runFetch()
    }, intervalMs)

    return () => {
      isCancelled = true
      clearInterval(intervalId)
      abortController.abort()
      isFetchingRef.current = false
    }
  }, [reloadTrigger])

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setFetchWarning(null)
    setReloadTrigger((count) => count + 1)
  }, [])

  return (
    <TelemetryContext.Provider
      value={{
        telemetry,
        loading,
        error,
        refreshWarning,
        isBrowserOnline,
        retry,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  )
}
