import { useContext } from 'react'
import { TelemetryContext } from '../context/telemetryContextDefinition'

/**
 * useTelemetry Hook
 * Accesses current telemetry data, connection state, and scenario controls.
 */
export function useTelemetry() {
  const context = useContext(TelemetryContext)
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider')
  }
  return context
}

export default useTelemetry
