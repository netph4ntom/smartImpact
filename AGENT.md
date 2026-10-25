# AGENT.md --- smartImpact

> Dokumen instruksi utama untuk AI coding agent yang membangun aplikasi
> web/PWA **smartImpact**, yaitu antarmuka monitoring kualitas air
> berbasis ESP32 dan Blynk Cloud.
>
> **Prioritas utama:** UI/UX profesional, responsif, mudah dipahami,
> data yang jujur, keamanan token, dan implementasi yang bisa
> dijalankan. Jangan menambahkan fitur di luar cakupan tanpa alasan yang
> jelas.

------------------------------------------------------------------------

## 1. Misi proyek

Bangun aplikasi **smartImpact --- IoT Water Quality Monitoring**
menggunakan React JavaScript. Aplikasi harus berjalan baik pada:

-   Browser desktop.
-   Browser mobile.
-   PWA yang dapat dipasang pada perangkat yang mendukung instalasi.

Perangkat ESP32 membaca empat parameter:

1.  Suhu air --- °C.
2.  pH --- skala pH.
3.  Turbidity/kekeruhan --- NTU.
4.  TDS --- ppm.

Alur data yang direncanakan:

`ESP32 + sensor → Blynk Cloud → backend/API aman → smartImpact React PWA`

Jika proyek yang tersedia ternyata sudah memiliki backend atau metode
akses Blynk tertentu, periksa dan pahami implementasi tersebut terlebih
dahulu. Jangan mengganti arsitektur secara membabi buta.

## 2. Cara bekerja sebagai AI agent

Ikuti urutan ini. Jangan langsung membuat semua halaman sekaligus
sebelum memeriksa repository.

### Tahap A --- Inspeksi

1.  Periksa struktur direktori, `package.json`, README, konfigurasi
    build, dan file yang sudah ada.
2.  Identifikasi apakah proyek sudah memakai React, Vite, TypeScript,
    Tailwind, router, test runner, atau backend.
3.  Periksa komponen, style, API, dan variabel environment yang telah
    tersedia.
4.  Jangan menghapus atau menimpa kode yang ada sebelum memahami
    kegunaannya.
5.  Jika ada mockup atau screenshot referensi, gunakan sebagai arahan
    visual, bukan alasan untuk menyalin teks/angka yang tidak valid.
6.  Buat ringkasan singkat tentang temuan dan rencana sebelum melakukan
    perubahan besar.

### Tahap B --- Rencana dan fondasi

1.  Buat checklist implementasi yang kecil dan bisa diverifikasi.
2.  Tentukan struktur halaman dan komponen yang dapat dipakai ulang.
3.  Tetapkan design tokens, routing, dan pendekatan state.
4.  Bangun layout responsif serta komponen dasar sebelum integrasi data.
5.  Jalankan aplikasi dan periksa hasilnya sesudah setiap tahap penting.

### Tahap C --- Implementasi bertahap

Urutan implementasi yang wajib:

1.  Design system dan shell aplikasi.
2.  Dashboard dengan data contoh yang diberi label jelas.
3.  Halaman Riwayat.
4.  Halaman Pengaturan.
5.  Lapisan data/API dan state loading/error/offline.
6.  Integrasi backend/Blynk bila kredensial dan spesifikasi tersedia.
7.  PWA, aksesibilitas, dan responsive polish.
8.  Pengujian, build produksi, dan dokumentasi.

Jangan membuat semua data palsu terlihat seperti data perangkat nyata.
Jangan menyatakan integrasi Blynk berhasil sebelum benar-benar diuji.

### Tahap D --- Verifikasi dan laporan

Sebelum menyatakan pekerjaan selesai:

-   Jalankan lint dan test jika tersedia.
-   Jalankan build produksi.
-   Periksa console browser dan network errors.
-   Uji layout pada lebar mobile, tablet, dan desktop.
-   Periksa status loading, error, stale data, offline, dan data kosong.
-   Laporkan file yang diubah, fitur yang selesai, perintah verifikasi
    yang dijalankan, masalah tersisa, dan langkah pengguna selanjutnya.

Jika ada keputusan penting yang belum diketahui, pilih default yang aman
dan sederhana bila memungkinkan. Tanyakan hanya jika keputusan tersebut
menghalangi pekerjaan atau berisiko merusak data/keamanan. Jangan
mengarang kredensial, endpoint, pin Blynk, standar kualitas air, atau
hasil sensor.

------------------------------------------------------------------------

## 3. Stack teknologi

Gunakan stack sederhana berikut kecuali repository sudah menetapkan
pilihan lain:

-   **React** dengan JavaScript.
-   **Vite** untuk development server dan build.
-   **React Router** untuk tiga halaman utama jika routing diperlukan.
-   **CSS Modules atau CSS biasa dengan CSS variables** untuk styling.
    Tailwind boleh dipakai jika sudah terpasang atau memang dipilih di
    awal; jangan memasang dua sistem styling yang saling tumpang tindih.
-   **Lucide React** untuk ikon yang konsisten.
-   **Recharts** atau library chart yang sudah ada untuk grafik
    historis. Pilih satu library saja.
-   **vite-plugin-pwa** atau konfigurasi PWA yang sesuai dengan versi
    Vite yang dipakai.
-   `fetch` untuk komunikasi HTTP sederhana; gunakan library tambahan
    hanya jika ada kebutuhan nyata.
-   Backend/API terpisah untuk rahasia Blynk dan akses yang perlu
    dilindungi.

Jangan menambahkan Redux, state-management framework besar, UI kit
penuh, database lokal, atau banyak dependency hanya untuk dashboard
sederhana. Gunakan React state/hooks untuk kebutuhan awal.

Jika repository sudah memiliki struktur yang berjalan, prioritaskan
konsistensi dengan proyek yang ada dibandingkan mengganti stack.

------------------------------------------------------------------------

## 4. Tujuan UI/UX dan prinsip desain

### Karakter produk

smartImpact harus terasa:

-   Profesional dan modern.
-   Minimalis, bukan dashboard penuh ornamen.
-   Ramah bagi pengguna nonteknis.
-   Informatif, dengan status dan unit yang jelas.
-   Konsisten antara desktop, mobile browser, dan PWA.
-   Cepat dibaca: pengguna dapat memahami kondisi telemetri dalam
    beberapa detik.

### Design tokens

Gunakan CSS custom properties agar warna, jarak, radius, dan bayangan
konsisten.

``` css
:root {
  --color-brand-900: #123B45;
  --color-brand-700: #0F766E;
  --color-brand-100: #E0F2F1;
  --color-page: #F5F8FA;
  --color-surface: #FFFFFF;
  --color-text: #123B45;
  --color-text-muted: #60747C;
  --color-border: #E1E9EC;
  --color-success: #16845B;
  --color-warning: #B7791F;
  --color-danger: #C24141;

  --radius-card: 16px;
  --radius-control: 10px;
  --shadow-card: 0 4px 18px rgb(18 59 69 / 5%);
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
}
```

Tokens ini adalah baseline; boleh disempurnakan tanpa mengubah karakter
visual utama.

### Tipografi

-   Pilih Inter bila tersedia, dengan fallback system sans-serif.
-   Judul halaman jelas dan tidak terlalu besar.
-   Angka sensor menjadi elemen paling mudah dilihat pada kartu.
-   Label, unit, timestamp, dan status harus tetap terbaca.
-   Jangan menggunakan terlalu banyak ukuran font, ketebalan, atau
    warna.

### Komponen visual

-   Surface putih pada latar off-white.
-   Border halus dan bayangan ringan.
-   Radius kartu sekitar 14--18 px.
-   Ikon Lucide React dengan ukuran dan stroke konsisten.
-   Animasi singkat dan halus; hindari animasi berulang yang mengganggu.
-   Jangan gunakan gradient mencolok, glassmorphism berat, neon, atau
    dekorasi yang tidak membantu pemahaman.
-   Jangan membuat seluruh layar menjadi kumpulan kartu tanpa hierarki.

### Status warna

Warna status tidak boleh menjadi satu-satunya pembeda. Selalu sertakan
teks dan/atau ikon.

-   Normal: hijau.
-   Perhatian: amber.
-   Kritis: merah.
-   Tidak diketahui/tidak tersedia: netral.
-   Perangkat offline: indikator yang jelas, bukan sekadar perubahan
    warna kecil.

Status "normal" hanya berdasarkan threshold yang dikonfigurasi untuk
konteks penggunaan. Jangan menyatakan air aman diminum hanya dari empat
parameter ini.

------------------------------------------------------------------------

## 5. Struktur halaman dan navigasi

Batasi produk awal pada **tiga halaman utama**:

1.  **Dashboard**
2.  **Riwayat**
3.  **Pengaturan**

Desktop memakai sidebar di kiri. Mobile memakai bottom navigation dengan
tiga item tersebut. Pastikan ruang bawah konten tidak tertutup bottom
navigation dan memperhitungkan safe area perangkat.

### 5.1 Dashboard

Tujuan: memberi gambaran terbaru secara cepat.

Elemen wajib:

-   Brand smartImpact.
-   Judul dan deskripsi singkat.
-   Status perangkat: Online, Data terlambat, Offline, atau Tidak
    diketahui.
-   Timestamp data terakhir diterima.
-   Empat kartu parameter:
    -   Suhu (°C).
    -   pH.
    -   Turbidity (NTU).
    -   TDS (ppm).
-   Nilai, unit, status, dan timestamp yang sesuai.
-   Grafik ringkas historis bila data historis tersedia.
-   Ringkasan perangkat ESP32 jika informasinya tersedia.
-   Link/aksi sederhana untuk membuka detail di Riwayat.

Aturan layout:

-   Desktop: empat kartu dalam satu baris bila ruang memadai.
-   Tablet: dua kolom.
-   Mobile: dua kolom jika tiap kartu tetap nyaman dibaca; satu kolom
    pada layar sangat sempit.
-   Grafik menggunakan lebar konten yang tersedia.
-   Hindari tabel lebar dan informasi teknis yang tidak diperlukan.

Jangan mengarang status koneksi dari keberhasilan render halaman. Status
harus berasal dari timestamp telemetri atau health-check backend yang
nyata.

### 5.2 Riwayat

Tujuan: membantu pengguna memahami perubahan parameter dari waktu ke
waktu.

Elemen wajib:

-   Pilih satu parameter: Suhu, pH, Turbidity, atau TDS.
-   Filter waktu sederhana: 1 jam, 24 jam, 7 hari. Tampilkan hanya
    pilihan yang memang didukung data/backend.
-   Grafik garis untuk satu parameter pada satu waktu.
-   Tooltip yang menunjukkan nilai dan timestamp.
-   Ringkasan minimum, maksimum, dan rata-rata hanya jika bisa dihitung
    dari data yang tersedia.
-   Daftar pembacaan terbaru yang responsif bila berguna.
-   Empty state jika histori belum tersedia.
-   Error state jika histori gagal dimuat.

Jangan menggabungkan semua parameter pada satu sumbu Y tanpa alasan,
karena unit dan skalanya berbeda. Jika belum ada penyimpanan historis,
jangan menghasilkan histori sintetis seolah-olah nyata. Gunakan data
contoh yang diberi label "Data contoh", lalu dokumentasikan kebutuhan
backend untuk histori.

### 5.3 Pengaturan

Tujuan: menyediakan konfigurasi minimum tanpa membebani pengguna.

Elemen yang disarankan:

-   Informasi perangkat: nama/ID, status, dan timestamp terakhir.
-   Threshold setiap sensor, dengan unit dan validasi input.
-   Interval refresh tampilan jika memang dapat dikonfigurasi.
-   Informasi aplikasi dan versi.
-   Petunjuk instalasi PWA.
-   Penjelasan sumber data/API bila diperlukan untuk debugging.

Aturan:

-   Jangan menampilkan token rahasia Blynk.
-   Jangan membuat kontrol yang terlihat aktif tetapi tidak berfungsi.
-   Jika pengaturan belum terhubung ke backend, tandai sebagai demo atau
    nonaktifkan dengan penjelasan.
-   Setiap perubahan konfigurasi harus memiliki validasi dan umpan balik
    berhasil/gagal.
-   Simpan threshold hanya pada tempat yang memang dirancang untuk
    menyimpannya; jangan mengklaim tersimpan jika hanya berubah di state
    lokal.

------------------------------------------------------------------------

## 6. Responsive design

Gunakan pendekatan mobile-first dan CSS Grid/Flexbox. Breakpoint adalah
pedoman, bukan aturan mutlak; layout harus mengikuti ruang yang
tersedia.

Target pengujian minimal:

-   320--360 px: mobile kecil.
-   390--430 px: mobile umum.
-   768 px: tablet portrait.
-   1024 px: laptop/tablet landscape.
-   1280--1440 px: desktop.
-   Lebar ekstra besar: konten dibatasi agar tidak melebar berlebihan.

Aturan:

-   Tidak boleh ada horizontal overflow pada halaman utama.
-   Tombol dan kontrol mudah disentuh; target sekitar 44 × 44 px bila
    memungkinkan.
-   Form control tidak terlalu rapat.
-   Chart harus mengubah ukuran dengan container.
-   Sidebar desktop berubah menjadi navigasi mobile, bukan sekadar
    dipersempit secara paksa.
-   Pertahankan urutan konten yang logis di layar kecil.
-   Perhatikan `env(safe-area-inset-bottom)` untuk bottom navigation
    bila relevan.
-   Hindari tinggi tetap pada kartu yang menyebabkan teks terpotong.
-   Gunakan `min-width: 0` pada flex/grid child yang memuat teks atau
    chart jika diperlukan.

------------------------------------------------------------------------

## 7. Arsitektur aplikasi dan organisasi kode

Contoh struktur yang disarankan:

``` text
smartimpact/
├── public/
│   ├── icons/
│   └── ...
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   └── router.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── BottomNavigation.jsx
│   │   │   └── PageHeader.jsx
│   │   ├── dashboard/
│   │   │   ├── SensorCard.jsx
│   │   │   ├── DeviceStatus.jsx
│   │   │   └── OverviewChart.jsx
│   │   ├── history/
│   │   │   ├── SensorSelector.jsx
│   │   │   ├── TimeRangeSelector.jsx
│   │   │   └── HistoryChart.jsx
│   │   └── common/
│   │       ├── StatusBadge.jsx
│   │       ├── LoadingState.jsx
│   │       ├── ErrorState.jsx
│   │       └── EmptyState.jsx
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── HistoryPage.jsx
│   │   └── SettingsPage.jsx
│   ├── services/
│   │   ├── apiClient.js
│   │   └── telemetryService.js
│   ├── hooks/
│   │   ├── useTelemetry.js
│   │   └── useHistory.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── thresholds.js
│   │   └── telemetry.js
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   └── ...
│   └── main.jsx
├── .env.example
├── AGENT.md
├── package.json
└── README.md
```

Struktur di atas adalah referensi. Sesuaikan dengan ukuran repository;
jangan membuat file abstraksi untuk hal yang hanya dipakai sekali jika
tidak memberi manfaat.

Pedoman kode:

-   Gunakan komponen kecil yang memiliki tanggung jawab jelas.
-   Pisahkan presentasi dari pengambilan data.
-   Hindari satu komponen raksasa untuk seluruh aplikasi.
-   Hindari duplikasi markup kartu sensor; gunakan komponen bersama.
-   Gunakan nama variabel yang deskriptif.
-   Hindari `any`-style data tanpa validasi; JavaScript tetap perlu
    memvalidasi bentuk respons API.
-   Tangani error Promise dan cleanup effect yang melakukan polling.
-   Jangan menaruh logika API, threshold, dan format unit langsung
    tersebar di JSX.

------------------------------------------------------------------------

## 8. Model data telemetri

Buat satu format data internal yang konsisten, lalu konversikan respons
dari Blynk/backend ke format tersebut.

Contoh model internal:

``` js
{
  deviceId: "esp32-001",
  receivedAt: "2026-10-25T02:57:24.000Z",
  connectionStatus: "online",
  sensors: {
    temperature: { value: 27.4, unit: "°C", valid: true },
    ph:          { value: 7.2, unit: "pH", valid: true },
    turbidity:   { value: 3.8, unit: "NTU", valid: true },
    tds:         { value: 185, unit: "ppm", valid: true }
  }
}
```

Model ini adalah contoh skema internal, bukan format respons Blynk yang
dijamin. Adaptasikan berdasarkan dokumentasi dan payload yang
benar-benar digunakan proyek.

Aturan data:

-   Simpan timestamp dengan zona waktu yang jelas, idealnya ISO 8601.
-   Format tanggal/waktu untuk pengguna sesuai locale Indonesia dan zona
    waktu yang dipilih aplikasi.
-   Nilai `0` adalah nilai numerik yang valid bila sensor memang
    mengukurnya; jangan menggantinya dengan fallback truthy seperti
    `value || "--"`.
-   Gunakan pemeriksaan `Number.isFinite` untuk mencegah `NaN`/infinity
    tampil sebagai data normal.
-   Bedakan `0`, `null`, data invalid, dan data belum tersedia.
-   Tampilkan unit secara konsisten.
-   Jangan mengasumsikan semua nilai yang berhasil diterima pasti valid
    secara fisik.
-   Dokumentasikan kalibrasi dan faktor konversi sensor jika relevan.

### Status freshness

Tentukan status dari umur timestamp telemetri berdasarkan interval
pengiriman dan toleransi yang dikonfigurasi.

Contoh konsep, bukan nilai final:

-   **Online:** telemetri diterima dalam rentang waktu yang diharapkan.
-   **Data terlambat:** telemetri melewati ambang keterlambatan.
-   **Offline:** backend/perangkat memastikan koneksi putus atau tidak
    ada telemetri dalam rentang yang disepakati.
-   **Tidak diketahui:** belum cukup informasi untuk menentukan status.

Jangan menganggap browser offline sama dengan ESP32 offline. Itu dua
kondisi yang berbeda dan sebaiknya ditampilkan secara terpisah bila
diperlukan.

------------------------------------------------------------------------

## 9. Integrasi Blynk Cloud dan keamanan

### Prinsip wajib

**Jangan menaruh Blynk Auth Token, API key rahasia, password, atau
credential privat di kode React yang dikirim ke browser.** Variabel
`VITE_*` akan masuk ke bundle client dan bukan tempat aman untuk
menyimpan rahasia.

Arsitektur yang disarankan:

1.  ESP32 mengirim data ke Blynk Cloud.
2.  Backend mengambil atau menerima data dari Blynk menggunakan
    kredensial server-side.
3.  Frontend meminta data dari API smartImpact.
4.  Backend mengautentikasi request dan membatasi akses sesuai
    kebutuhan.

Jika proyek belum mempunyai backend:

-   Buat rancangan kontrak API terlebih dahulu.
-   Jangan mengarang endpoint atau pin Blynk.
-   Minta detail datastream/virtual pin, jenis autentikasi, bentuk
    payload, kebutuhan histori, dan environment deployment sebelum
    mengimplementasikan integrasi final.
-   Untuk pengembangan UI, gunakan adapter mock yang eksplisit dan dapat
    diganti.
-   Jangan menghubungkan browser langsung ke API ber-token rahasia hanya
    demi mempercepat demo.

Contoh `.env.example` frontend yang aman:

``` dotenv
VITE_API_BASE_URL=/api
VITE_DEMO_MODE=true
```

Jangan pernah menaruh nilai token sungguhan di file `.env.example`,
README, source control, screenshot, atau log.

### Kontrak endpoint yang bisa dijadikan rancangan

Kontrak ini hanya usulan untuk koordinasi frontend/backend; endpoint
belum tentu sudah tersedia.

-   `GET /api/telemetry/latest` --- pembacaan terbaru dan metadata
    timestamp.
-   `GET /api/telemetry/history?parameter=ph&range=24h` --- data
    historis untuk satu parameter.
-   `GET /api/device/status` --- status perangkat berdasarkan informasi
    backend.
-   `GET /api/settings` --- konfigurasi yang boleh dibaca client.
-   `PUT /api/settings/thresholds` --- update threshold jika pengguna
    memang diberi izin.

Dokumentasikan respons sukses, error, autentikasi, pagination/limit, dan
batas request. Jangan implementasikan endpoint sebagai fakta sampai
backend menyediakannya.

### Polling dan performa

-   Pilih interval polling sesuai frekuensi telemetri dan kemampuan
    backend.
-   Jangan mengirim request berlebihan.
-   Pastikan interval dibersihkan ketika komponen unmount.
-   Hindari request tumpang tindih jika request sebelumnya belum
    selesai.
-   Tampilkan timestamp penerimaan data, bukan hanya waktu render.
-   Jika nanti memakai WebSocket/SSE, pertahankan fallback dan status
    koneksi yang jelas.

------------------------------------------------------------------------

## 10. Threshold dan makna status kualitas air

-   Ambang batas harus dapat dikonfigurasi atau berasal dari konfigurasi
    backend.
-   Jangan menanam rentang universal tanpa mengetahui jenis penggunaan
    air, regulasi yang relevan, dan spesifikasi sensor.
-   Pisahkan **status sensor/perangkat** dari **interpretasi parameter
    kualitas air**.
-   Jelaskan status berdasarkan parameter yang melampaui batas.
-   Hindari label "air aman diminum" atau klaim kesehatan berdasarkan
    suhu, pH, turbidity, dan TDS saja.
-   Jika threshold belum dikonfigurasi, tampilkan "Batas belum diatur"
    atau "Status belum dapat dinilai", bukan "Normal".
-   Jika nilai invalid, tampilkan status sensor yang sesuai dan jangan
    mengklasifikasikan kualitas air dari nilai tersebut.

------------------------------------------------------------------------

## 11. PWA

Aplikasi harus bisa diinstal sebagai PWA pada browser/platform yang
mendukungnya.

Persyaratan minimum:

-   Web App Manifest valid.
-   Nama aplikasi `smartImpact` dan short name yang sesuai.
-   Ikon aplikasi dengan ukuran yang diperlukan, termasuk ikon maskable
    bila dibuat.
-   `start_url`, `scope`, `display: "standalone"`, warna tema, dan
    background color yang benar.
-   HTTPS pada deployment, kecuali konteks localhost untuk pengembangan.
-   Service worker melalui solusi yang kompatibel dengan versi Vite.
-   Halaman tetap usable pada jaringan lambat.
-   Cache app shell dan asset statis dengan strategi yang sesuai.
-   Jangan cache response sensitif atau data telemetri pribadi secara
    sembarangan.
-   Beri tahu pengguna bila yang ditampilkan adalah data cache/stale.
-   Petunjuk instalasi sesuai browser; jangan menjanjikan prompt
    instalasi selalu tersedia.
-   Uji update service worker agar pengguna tidak terjebak pada asset
    versi lama.

Offline mode tidak berarti telemetri live tersedia. Saat jaringan
terputus, tampilkan data terakhir beserta timestamp dan indikator
stale/offline.

------------------------------------------------------------------------

## 12. Aksesibilitas

-   Gunakan elemen HTML semantik.
-   Pastikan seluruh aksi dapat diakses dengan keyboard.
-   Tambahkan label yang jelas pada input, tombol, dan filter.
-   Pastikan fokus keyboard terlihat.
-   Gunakan kontras teks yang memadai.
-   Jangan menyampaikan status hanya melalui warna.
-   Berikan nama aksesibel pada ikon tombol yang tidak memiliki teks.
-   Hindari tooltip sebagai satu-satunya cara memperoleh informasi
    penting.
-   Hormati `prefers-reduced-motion`.
-   Pastikan grafik memiliki ringkasan teks atau alternatif informasi
    penting yang bisa dibaca.
-   Jangan menghilangkan outline fokus tanpa pengganti.

------------------------------------------------------------------------

## 13. Loading, error, empty, dan stale states

Setiap halaman yang mengambil data harus memiliki state yang eksplisit:

1.  **Loading:** skeleton atau indikator ringkas yang tidak menyebabkan
    layout meloncat.
2.  **Success:** data aktual dengan timestamp.
3.  **Empty:** belum ada data; jelaskan apa yang perlu terjadi
    selanjutnya.
4.  **Error:** pesan yang dapat dipahami dan tombol coba lagi jika
    relevan.
5.  **Stale:** tampilkan data terakhir, umur data, dan peringatan bahwa
    data tidak terbaru.
6.  **Partial failure:** jika satu sensor gagal tetapi sensor lain
    valid, tampilkan kondisi masing-masing tanpa menghilangkan semua
    data.
7.  **Demo:** beri label "Data contoh" yang terlihat dan jangan
    menyamarkannya sebagai telemetri nyata.

Jangan hanya menampilkan spinner tanpa batas. Jangan menghapus data
terakhir yang berguna ketika refresh gagal; pertahankan dengan penanda
stale jika aman.

------------------------------------------------------------------------

## 14. Kualitas implementasi

### Hindari

-   Halaman yang terlihat seperti template admin generik tanpa
    identitas.
-   Gradient berlebihan dan terlalu banyak warna.
-   Terlalu banyak kartu, badge, tabel, atau ikon dekoratif.
-   Font kecil untuk nilai sensor atau timestamp.
-   Data palsu tanpa label.
-   Button yang tidak melakukan apa pun.
-   Link navigasi yang rusak.
-   Hard-coded credential.
-   API call langsung ke layanan rahasia dari browser.
-   Status "online" yang ditentukan hanya dari halaman berhasil dimuat.
-   Grafik tanpa unit, timestamp, atau keterangan rentang waktu.
-   Menambah halaman atau fitur di luar tiga halaman utama tanpa
    persetujuan.
-   Menyembunyikan error agar demo tampak sukses.

### Wajib

-   Komponen konsisten dan dapat digunakan ulang.
-   Layout mobile-first.
-   Unit dan timestamp yang akurat.
-   Status koneksi dan freshness yang jujur.
-   Kontras dan focus states yang baik.
-   Empty/error/loading states.
-   Build berhasil.
-   Dokumentasi setup dan konfigurasi.
-   Tidak ada secret yang masuk ke bundle client.

------------------------------------------------------------------------

## 15. Checklist pengujian dan acceptance criteria

Pekerjaan dinyatakan selesai hanya bila kriteria berikut terpenuhi atau
pengecualiannya dilaporkan secara eksplisit.

### Fungsional

-   [ ] Tiga halaman Dashboard, Riwayat, dan Pengaturan dapat dibuka.
-   [ ] Navigasi desktop dan mobile bekerja.
-   [ ] Empat parameter memiliki label, nilai, dan unit yang benar.
-   [ ] Data contoh ditandai sebagai data contoh.
-   [ ] API loading, error, empty, stale, dan partial failure ditangani.
-   [ ] Nilai `0`, `null`, dan nilai nonnumerik ditangani dengan benar.
-   [ ] Grafik menggunakan data sesuai parameter dan rentang yang
    dipilih.
-   [ ] Kontrol UI tidak terlihat aktif jika belum berfungsi.
-   [ ] Status online/offline tidak ditentukan dari render UI semata.

### Responsive dan visual

-   [ ] Tidak ada horizontal overflow pada 320 px, 390 px, 768 px, 1024
    px, dan 1440 px.
-   [ ] Kartu sensor tetap terbaca di mobile.
-   [ ] Bottom navigation tidak menutupi konten.
-   [ ] Sidebar dan navigasi mobile berganti sesuai ruang layar.
-   [ ] Form, tooltip, dan grafik tetap usable pada layar sentuh.
-   [ ] Warna, tipografi, radius, jarak, dan ikon konsisten.
-   [ ] Loading/error states tidak merusak layout.

### Keamanan dan PWA

-   [ ] Tidak ada Blynk token atau secret di source client/bundle.
-   [ ] API menggunakan base URL melalui konfigurasi environment.
-   [ ] Manifest PWA valid dan ikon tersedia.
-   [ ] Service worker tidak menyimpan secret atau respons sensitif
    sembarangan.
-   [ ] Offline/stale state menjelaskan umur data.
-   [ ] Build production berhasil.
-   [ ] Panduan instalasi dan deployment tersedia.

### Verifikasi perintah

Gunakan perintah yang benar-benar tersedia pada `package.json`. Contoh
jika script-nya ada:

``` bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

Jangan mengklaim perintah test/lint berhasil jika script tersebut tidak
tersedia atau belum dijalankan.

------------------------------------------------------------------------

## 16. Dokumentasi yang harus disediakan

Perbarui atau buat `README.md` dengan:

-   Deskripsi smartImpact.
-   Teknologi yang dipakai.
-   Persyaratan versi Node.js.
-   Cara instalasi dependency.
-   Cara menjalankan mode development.
-   Cara menjalankan lint/test/build.
-   Environment variables yang diperlukan beserta contoh aman.
-   Arsitektur frontend, backend, dan Blynk.
-   Bentuk payload telemetri yang benar-benar digunakan.
-   Cara mengaktifkan mode demo dan membedakannya dari mode live.
-   Cara deploy dengan HTTPS.
-   Cara menguji dan memasang PWA.
-   Keterbatasan yang belum diselesaikan.

Jangan mendokumentasikan endpoint, pin, atau konfigurasi sebagai fakta
jika belum diverifikasi.

------------------------------------------------------------------------

## 17. Hal yang harus dikonfirmasi sebelum integrasi live

UI dan mode demo dapat dibangun tanpa informasi ini. Integrasi live
memerlukan:

1.  Blynk Cloud yang digunakan dan metode API yang tersedia.
2.  Nama datastream/virtual pin untuk suhu, pH, turbidity, dan TDS.
3.  Contoh payload nyata (hapus token dan informasi rahasia).
4.  Frekuensi ESP32 mengirim data.
5.  Apakah data historis sudah disimpan dan berapa lama retensinya.
6.  Apakah sudah ada backend/API atau perlu dibuat.
7.  Apakah pengguna perlu login atau hanya satu dashboard privat.
8.  Target deployment frontend dan backend.

Jangan meminta atau menuliskan token rahasia di chat, source control,
atau dokumentasi. Gunakan environment secret di server/deployment.

------------------------------------------------------------------------

## 18. Prompt awal untuk AI coding agent

Salin prompt berikut ketika memberikan repository kepada AI coding
agent:

> Baca `AGENT.md` sepenuhnya sebelum mengubah kode. Inspeksi repository
> dan laporkan stack, struktur, fitur yang sudah ada, dan rencana
> implementasi singkat. Bangun smartImpact sebagai aplikasi React
> JavaScript untuk monitoring kualitas air IoT dengan tiga halaman saja:
> Dashboard, Riwayat, dan Pengaturan. Ikuti design tokens, hierarki
> informasi, responsive behavior, aturan keamanan, serta acceptance
> criteria dalam `AGENT.md`.
>
> Kerjakan bertahap: fondasi/layout, dashboard, riwayat, pengaturan,
> state data, integrasi API jika kontraknya tersedia, PWA, lalu
> verifikasi. Gunakan data mock yang jelas diberi label sampai API nyata
> terverifikasi. Jangan mengarang pin Blynk, endpoint, credential, nilai
> sensor, atau standar kualitas air. Jangan pernah mengekspos Blynk Auth
> Token ke frontend.
>
> Setelah setiap tahap, jalankan aplikasi atau build yang relevan,
> periksa hasilnya, dan perbaiki error sebelum lanjut. Jangan berhenti
> pada mockup statis: buat kontrol navigasi dan interaksi yang memang
> berfungsi. Jangan menambahkan fitur di luar cakupan tanpa alasan kuat.
>
> Di akhir, laporkan file yang dibuat/diubah, fitur yang selesai, cara
> menjalankan proyek, hasil test/lint/build yang benar-benar dijalankan,
> dan hal yang masih membutuhkan keputusan atau akses dari saya.

------------------------------------------------------------------------

## 19. Definisi selesai

smartImpact siap untuk tahap demo ketika:

-   Tiga halaman utama selesai dengan visual yang konsisten.
-   Responsif di desktop dan mobile.
-   Data contoh dan data live dibedakan dengan jelas.
-   Navigasi dan kontrol yang ditampilkan berfungsi.
-   Loading, error, empty, stale, dan offline states ditangani.
-   PWA dapat diuji instalasinya pada environment yang mendukung.
-   Tidak ada credential rahasia di client.
-   Build berhasil dan dokumentasi setup tersedia.

**Prinsip terakhir:** bangun pengalaman monitoring yang sederhana,
akurat, dan dapat dipercaya terlebih dahulu. Tambahkan kompleksitas
hanya ketika kebutuhan pengguna dan sumber data benar-benar
mendukungnya.
