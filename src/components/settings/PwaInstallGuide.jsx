import { useState, useEffect } from 'react'
import { Smartphone, Download, CheckCircle, Info, Monitor, Apple, Droplets, ShieldCheck } from 'lucide-react'
import './PwaInstallGuide.css'

export default function PwaInstallGuide() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches || Boolean(window.navigator.standalone)
    }
    return false
  })

  useEffect(() => {
    // Capture install prompt event if supported by the browser
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }

  return (
    <section className="pwa-guide-section card" aria-labelledby="heading-about-app">
      <div className="pwa-guide-section__header">
        <h2 id="heading-about-app" className="pwa-guide-section__title">
          Tentang Aplikasi & Instalasi PWA
        </h2>
        <span className="app-version-tag">smartImpact v1.0.0</span>
      </div>

      <div className="pwa-status-box">
        <div className="pwa-status-box__left">
          <div className="pwa-status-box__icon-wrap">
            <Smartphone className="pwa-status-box__icon" aria-hidden="true" />
          </div>
          <div>
            <h3 className="pwa-status-box__title">Progressive Web App (PWA)</h3>
            <p className="pwa-status-box__desc">
              {isInstalled
                ? 'Aplikasi smartImpact telah terpasang di perangkat Anda.'
                : 'Dapat diinstal di komputer desktop, laptop, atau ponsel pintar tanpa unduhan App Store.'}
            </p>
          </div>
        </div>

        <div className="pwa-status-box__right">
          {isInstalled ? (
            <span className="pwa-installed-badge">
              <CheckCircle className="pwa-installed-icon" aria-hidden="true" />
              Terpasang
            </span>
          ) : deferredPrompt ? (
            <button
              type="button"
              onClick={handleInstallClick}
              className="pwa-install-button touch-target"
            >
              <Download className="pwa-install-icon" aria-hidden="true" />
              <span>Pasang Aplikasi</span>
            </button>
          ) : (
            <span className="pwa-ready-badge">Siap Diinstal</span>
          )}
        </div>
      </div>

      {/* Manual Installation Guidelines by Platform */}
      {!isInstalled && (
        <div className="pwa-steps-accordion">
          <h4 className="pwa-steps-title">
            <Info className="pwa-steps-icon" aria-hidden="true" />
            Petunjuk Instalasi Manual:
          </h4>

          <div className="pwa-platforms-grid">
            {/* Desktop Chrome / Edge */}
            <div className="pwa-platform-card">
              <div className="platform-card__header">
                <Monitor className="platform-card__icon" aria-hidden="true" />
                <span className="platform-card__name">Desktop (Chrome / Edge)</span>
              </div>
              <p className="platform-card__step">
                Klik ikon instalasi (⤓) pada bilah alamat URL (address bar) browser, atau buka menu titik tiga (⋮) &gt; pilih <strong>"Install smartImpact"</strong>.
              </p>
            </div>

            {/* Android Chrome */}
            <div className="pwa-platform-card">
              <div className="platform-card__header">
                <Smartphone className="platform-card__icon" aria-hidden="true" />
                <span className="platform-card__name">Ponsel Android (Chrome)</span>
              </div>
              <p className="platform-card__step">
                Sentuh menu titik tiga (⋮) di pojok kanan atas browser &gt; pilih <strong>"Tambahkan ke Layar Utama"</strong> (Add to Home screen).
              </p>
            </div>

            {/* iOS Safari */}
            <div className="pwa-platform-card">
              <div className="platform-card__header">
                <Apple className="platform-card__icon" aria-hidden="true" />
                <span className="platform-card__name">iPhone / iPad (Safari)</span>
              </div>
              <p className="platform-card__step">
                Sentuh tombol Bagikan (Share / ⎋) di bilah bawah Safari &gt; gulir dan pilih <strong>"Tambahkan ke Layar Utama"</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security & Offline Transparency Notice */}
      <div className="pwa-security-notice" role="region" aria-label="Informasi Keamanan & Offline PWA">
        <div className="pwa-security-notice__header">
          <ShieldCheck className="pwa-security-notice__icon" aria-hidden="true" />
          <h4 className="pwa-security-notice__title">Persyaratan Teknis & Mode Offline:</h4>
        </div>
        <ul className="pwa-security-notice__list">
          <li><strong>Protokol HTTPS:</strong> Instalasi PWA dan Service Worker mewajibkan koneksi HTTPS pada lingkungan produksi (kecuali <code>localhost</code> pada lingkungan pengembangan).</li>
          <li><strong>Penyimpanan Cache Statis:</strong> Service Worker hanya meng-cache app shell dan asset antarmuka. Kredensial rahasia, token, dan endpoint sensitif tidak pernah disimpan dalam cache browser.</li>
          <li><strong>Perilaku Tanpa Jaringan:</strong> Saat perangkat offline, aplikasi tetap dapat dibuka dan menampilkan rekaman telemetri valid terakhir dengan indikator data kedaluwarsa (<em>stale</em>). Pembaruan telemetri sensor ESP32 secara langsung tidak dapat dilakukan tanpa koneksi internet.</li>
        </ul>
      </div>

      {/* Vision Branding Banner Card */}
      <div className="app-branding-banner">
        <div className="app-branding-banner__icon-wrap">
          <Droplets className="app-branding-banner__icon" aria-hidden="true" />
        </div>
        <div className="app-branding-banner__text">
          <h3 className="app-branding-banner__name">smartimpact</h3>
          <p className="app-branding-banner__motto">
            Monitoring kualitas air untuk masa depan yang lebih baik.
          </p>
        </div>
      </div>
    </section>
  )
}
