import { Loader2 } from 'lucide-react'
import './LoadingState.css'

/**
 * LoadingState Component
 * Displays an accessible loading spinner or skeleton layout that avoids layout shifts.
 *
 * @param {string} message - User-facing loading message
 * @param {'spinner' | 'skeleton'} type
 * @param {number} skeletonCount - Number of skeleton cards to render if type='skeleton'
 */
export default function LoadingState({
  message = 'Memuat data telemetri...',
  type = 'spinner',
  skeletonCount = 4,
  className = '',
}) {
  if (type === 'skeleton') {
    return (
      <div
        className={`skeleton-grid ${className}`}
        role="status"
        aria-label={message}
      >
        <span className="sr-only">{message}</span>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-card__header">
              <div className="skeleton-line skeleton-line--circle" />
              <div className="skeleton-line skeleton-line--title" />
            </div>
            <div className="skeleton-line skeleton-line--value" />
            <div className="skeleton-line skeleton-line--badge" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={`loading-state ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="loading-state__spinner" aria-hidden="true" />
      <p className="loading-state__text">{message}</p>
    </div>
  )
}
