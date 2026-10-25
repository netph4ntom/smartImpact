import { useState, useEffect } from 'react'

/**
 * useNetworkStatus Hook
 * Monitors browser internet connectivity (distinct from ESP32 device connectivity).
 *
 * @returns {boolean} isOnline - True if browser network is active, false if browser is offline
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine
    }
    return true
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export default useNetworkStatus
