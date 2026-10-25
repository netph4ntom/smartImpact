import { AlertCircle, RotateCcw } from 'lucide-react'
import './ErrorState.css'

/**
 * ErrorState Component
 * Displays an error message with an optional retry button.
 *
 * @param {string} title
 * @param {string} message
 * @param {() => void} onRetry
 */
export default function ErrorState({
  title = 'Gagal Memuat Data',
  message = 'Terjadi kendala saat mengambil data telemetri. Silakan periksa koneksi atau coba beberapa saat lagi.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`error-state ${className}`} role="alert">
      <div className="error-state__icon-wrap">
        <AlertCircle className="error-state__icon" aria-hidden="true" />
      </div>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="error-state__retry-btn touch-target"
        >
          <RotateCcw className="error-state__btn-icon" aria-hidden="true" />
          <span>Coba Lagi</span>
        </button>
      )}
    </div>
  )
}
