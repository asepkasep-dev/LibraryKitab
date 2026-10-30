# KitabKu Pesantren

---

## 1. Ringkasan & Tujuan Aplikasi
*Bagian ini menjelaskan gambaran umum proyek agar dipahami bersama oleh pemilik ide/klien dan tim pengembang.*
- **Nama Aplikasi**: KitabKu Pesantren
- **Penjelasan Singkat**: Perpustakaan digital khusus kitab kuning (turats) untuk pesantren yang memungkinkan santri dan ustadz mencari, membaca, dan memberi catatan pada e-kitab secara gratis dari perangkat apa pun, dengan pengalaman baca yang nyaman di mode gelap.
- **Masalah yang Diselesaikan**:
  - Kitab fisik terbatas jumlahnya dan sulit dibawa atau dibagi ke banyak santri sekaligus.
  - Pencarian kitab berdasarkan fan ilmu, pengarang, atau syarah masih manual dan memakan waktu.
  - Santri kesulitan melacak sampai halaman mana mereka sudah membaca dan menyimpan catatan penting.
  - Pengelola pesantren belum punya cara terpusat untuk mengelola koleksi digital.
- **Pengguna Aplikasi**:
  - **Pengunjung (Publik)**: Menjelajahi katalog, melihat detail kitab, dan mencari kitab tanpa perlu mendaftar.
  - **Santri & Ustadz (Member)**: Membaca e-kitab online, menyimpan bookmark dan catatan pribadi, melihat riwayat baca, dan melanjutkan bacaan dari halaman terakhir.
  - **Admin / Pengelola Perpustakaan**: Mengunggah file PDF kitab, mengelola kategori (fan), pengarang, dan syarah, serta memantau jumlah pengguna dan kitab.
- **Target Keberhasilan**:
  - Minimal 100 kitab tersedia secara digital dalam 3 bulan pertama setelah peluncuran.
  - Minimal 70% santri aktif membaca e-kitab minimal 1 kali dalam seminggu.
  - Waktu pencarian kitab sampai ditemukan berkurang di bawah 10 detik untuk kata kunci yang umum.
  - Rata-rata waktu muat halaman baca di bawah 3 detik pada koneksi 4G.

---

## 2. Batasan Pembuatan Sistem (Versi Awal MVP)
*Menegaskan fitur apa yang dikerjakan di versi awal dan apa yang sengaja ditunda agar aplikasi cepat selesai dan tidak membengkak (mencegah scope creep).*

### ✅ Yang Dikerjakan:
- Registrasi dan login dengan Email & Password (dikelola Clerk).
- Katalog kitab publik dengan pencarian dan filter kategori (fan), pengarang, dan syarah.
- Halaman detail kitab dengan ringkasan metadata.
- E-Book Reader online (baca PDF langsung di browser) dengan navigasi halaman, zoom, dan mode gelap.
- Bookmark halaman dan catatan pribadi per halaman kitab.
- Riwayat baca dan progres membaca (halaman terakhir dan persentase selesai).
- Dashboard member dan profil pengguna.
- Dashboard admin dengan CRUD kitab (termasuk upload PDF), kategori, pengarang, dan syarah.
- Akses seluruh e-kitab gratis untuk semua pengguna.
- SEO dasar (metadata dinamis dan Open Graph) untuk halaman publik.

### ⛔ Yang Tidak Dikerjakan di Versi Awal:
- Sistem pembayaran, langganan, atau paywall (karena seluruh konten gratis).
- Aplikasi mobile native (Android/iOS). Versi web responsif sudah mencakup penggunaan di ponsel.
- Fitur unduh PDF offline (Progressive Web App dengan cache offline ditunda ke rilis berikutnya).
- Fitur OCR atau pencarian teks di dalam isi PDF hasil pindaian (ditunda).
- Forum diskusi, komentar publik, dan fitur sosial antarpengguna.
- Sistem peminjaman fisik dan integrasi dengan inventaris buku cetak.
- Fitur terjemahan otomatis atau kamus Arab-Indonesia terintegrasi.
- Notifikasi WhatsApp dan email marketing.
- Multi-tenant (satu instalasi untuk banyak pesantren sekaligus).

---

## 3. Daftar Halaman & Struktur Menu (Pages & Routing)
*Daftar lengkap halaman yang harus dibuat, dikelompokkan berdasarkan area atau peran pengguna (Role).*

### A. Public Area (Tanpa Login)
- `/` (Beranda): Hero section bernuansa dark premium, kolom pencarian kitab besar, deretan kategori fan ilmu (Nahwu, Sharaf, Fiqih, Tauhid, Tafsir, Hadis, Akhlak), kitab pilihan minggu ini, dan ajakan untuk mendaftar.
- `/katalog` (Katalog Kitab): Grid kartu kitab dengan pencarian, filter kategori, pengarang, dan syarah, pengurutan (terbaru, judul A-Z, terpopuler), dan pagination.
- `/kitab/[slug]` (Detail Kitab): Sampul kitab, judul (Arab dan Latin), pengarang, syarah, kategori, jumlah halaman, deskripsi singkat, dan tombol "Baca Sekarang". Menampilkan kitab terkait di bagian bawah.
- `/tentang` (Tentang Kami): Visi perpustakaan, tujuan pesantren, dan cara kerja platform.
- `/kontak` (Kontak): Formulir pesan ke pengelola perpustakaan dengan validasi Zod.
- `/faq` (Pertanyaan Umum): Daftar tanya jawab seputar akses, cara membaca, dan pendaftaran akun.
- `/sign-in` dan `/sign-up`: Halaman autentikasi Clerk dengan tampilan kustom gelap.
- `/syarat-ketentuan` dan `/kebijakan-privasi`: Halaman informasi legal sederhana.

### B. Member/User Area (Setelah Login)
- `/dashboard` (Dasbor Utama): Sapaan personal, kartu "Lanjutkan Membaca" (kitab terakhir dibuka beserta halaman dan persentase), statistik ringkas (kitab dibaca, bookmark, catatan), dan rekomendasi kitab berdasarkan kategori yang sering dibaca.
- `/dashboard/bookmark` (Bookmark Saya): Daftar bookmark yang dikelompokkan per kitab, dengan tombol buka langsung ke halaman tersimpan.
- `/dashboard/catatan` (Catatan Saya): Daftar catatan pribadi dengan filter per kitab dan pencarian isi catatan, serta fitur edit dan hapus.
- `/dashboard/riwayat` (Riwayat Baca): Daftar kitab yang pernah dibuka, diurutkan dari yang terakhir dibaca, lengkap dengan progres dan tanggal akses.
- `/dashboard/profil` (Profil Saya): Menampilkan nama, email, dan peran (Santri/Ustadz) serta pengaturan preferensi baca (ukuran huruf default, mode tampilan reader).
- `/baca/[slug]` (E-Book Reader): Halaman pembaca layar penuh dengan navigasi halaman, lompat ke halaman tertentu, zoom, panel bookmark dan catatan di samping, serta penyimpanan progres otomatis. Dapat diakses publik untuk melihat, tetapi fitur bookmark dan catatan hanya untuk member yang sudah login.

### C. Admin Area (Pengelola Perpustakaan)
- `/admin/dashboard` (Dasbor Admin): Statistik total kitab, total member, kitab paling sering dibaca, dan aktivitas unggahan terbaru.
- `/admin/kitab` (Manajemen Kitab): Tabel kitab dengan kolom judul, pengarang, kategori, status publikasi, dan tanggal unggah. Dilengkapi pencarian, filter kategori, dan aksi edit serta hapus.
- `/admin/kitab/baru` (Unggah Kitab Baru): Formulir metadata lengkap dan unggahan file PDF dengan indikator progres.
- `/admin/kitab/[id]/edit` (Edit Kitab): Mengubah metadata dan mengganti file PDF.
- `/admin/kategori` (Kelola Kategori / Fan): Tabel CRUD kategori fan ilmu dengan slug otomatis.
- `/admin/pengarang` (Kelola Pengarang): Tabel CRUD pengarang dengan nama Arab dan Latin serta wafat tahun.
- `/admin/syarah` (Kelola Syarah / Syarih): Tabel CRUD penyusun syarah atau hasyiyah dengan nama Arab dan Latin serta wafat tahun.
- `/admin/pengguna` (Daftar Pengguna): Tabel member dengan pencarian, filter peran, dan kemampuan menonaktifkan akun.

---

## 4. Pedoman UI/UX & Design System
*Panduan visual konkret agar AI coding assistant tidak membuat UI yang kaku atau default.*
- **Skema Warna** (Dark Mode Premium):
  - Background utama: HSL(222, 47%, 6%) (biru navy sangat gelap)
  - Background kartu: HSL(222, 40%, 10%) dengan transparansi 60% untuk efek glassmorphism
  - Primary (Emas Pesantren): HSL(43, 74%, 56%)
  - Primary Hover: HSL(43, 80%, 65%)
  - Secondary (Teal Lembut): HSL(172, 60%, 45%)
  - Teks Utama: HSL(210, 20%, 96%)
  - Teks Sekunder: HSL(215, 16%, 65%)
  - Border halus: HSL(217, 20%, 22%)
  - Destruktif: HSL(0, 72%, 60%)
  - Sukses: HSL(142, 65%, 50%)
- **Tipografi**:
  - Heading Latin: `Plus Jakarta Sans` (bobot 600 dan 700)
  - Body Latin: `Inter` (bobot 400 dan 500)
  - Teks Arab (judul kitab, ayat, dan istilah): `Amiri` atau `Noto Naskh Arabic`, dengan `dir="rtl"` dan line-height 1.9
  - Ukuran heading: H1 `text-4xl md:text-5xl`, H2 `text-3xl`, H3 `text-xl`
- **Aturan Komponen**:
  - Semua kartu menggunakan `rounded-2xl`, border 1px `border-white/10`, dan `backdrop-blur-xl` dengan background `bg-white/5`.
  - Kartu biasa memakai `shadow-sm`. Saat hover, kartu naik 4px (`-translate-y-1`) dengan `shadow-lg` dan glow emas tipis (`shadow-amber-500/10`).
  - Tombol primer: background emas dengan teks gelap (`text-slate-950`), `rounded-xl`, dan transisi 200ms.
  - Tombol sekunder: outline dengan border `border-white/15` dan efek hover `bg-white/10`.
  - Input dan select: `bg-white/5`, border `border-white/10`, fokus ring emas, `rounded-xl`.
  - Badge kategori fan: pill kecil dengan warna teal transparan (`bg-teal-500/15 text-teal-300`).
  - Komponen dasar memakai shadcn/ui yang sudah dikustomisasi token warnanya.
  - Ikon menggunakan Lucide React dengan stroke 1.75.
- **Reader (E-Book Viewer)**: Latar gelap `bg-slate-950`, halaman PDF ditampilkan dengan sudut membulat dan shadow besar. Toolbar mengambang di bagian bawah dengan efek glassmorphism. Tersedia tombol mode "Sepia Malam" yang mengubah filter halaman menjadi nuansa kertas kuning gelap.
- **Nuansa & Vibe**: Elegan, tenang, dan religius-modern. Banyak ruang kosong (whitespace), animasi halus (fade-in dan slide-up saat scroll), micro-interaction pada tombol, dan skeleton loading saat data dimuat. Hindari warna terlalu mencolok dan ornamen berlebihan.
- **Responsivitas**: Mobile-first. Pada layar kecil, sidebar dashboard berubah menjadi drawer dari bawah. Reader pada mobile menampilkan satu halaman penuh dengan gestur geser kiri dan kanan.

---

## 5. Pembagian Hak Akses Pengguna
*Tabel hak akses yang menentukan siapa saja yang boleh melihat, mengedit, atau mengelola data.*

Aplikasi ini memiliki area publik yang dapat diakses tanpa login, tetapi fitur personal dan pengelolaan konten dibatasi berdasarkan peran.

| Menu / Halaman | Publik (Tanpa Login) | Santri / Ustadz (Login) | Admin / Pengelola |
| :--- | :---: | :---: | :---: |
| Beranda, Katalog, Detail Kitab | ✅ | ✅ | ✅ |
| Baca Kitab (Reader) | ✅ | ✅ | ✅ |
| Bookmark dan Catatan di Reader | ❌ | ✅ | ✅ |
| Dashboard, Riwayat, Profil Pribadi | ❌ | ✅ | ✅ |
| Dashboard Admin | ❌ | ❌ | ✅ |
| Unggah, Edit, Hapus Kitab | ❌ | ❌ | ✅ |
| Kelola Kategori, Pengarang, Syarah | ❌ | ❌ | ✅ |
| Kelola Pengguna (Nonaktifkan Akun) | ❌ | ❌ | ✅ |
| Halaman Kontak dan FAQ | ✅ | ✅ | ✅ |

**Aturan tambahan:**
- Peran Admin disimpan pada kolom `role` di tabel `users` dan disinkronkan dengan `publicMetadata` di Clerk. Pemberian peran admin hanya dapat dilakukan oleh admin lain atau melalui skrip seed awal.
- Pendaftaran baru secara default memberikan peran `member`. Pilihan jenis peran (Santri atau Ustadz) ditentukan pada profil dan tidak memengaruhi hak akses.

---

## 6. Alur Kerja dan Fitur Utama
*Menjelaskan cara kerja setiap fitur utama dalam bahasa yang mudah dipahami serta aturan logikanya.*

### A. Pendaftaran dan Login
1. **Cara Kerja**: Pengunjung menekan tombol "Daftar". Clerk menampilkan formulir Email dan Password. Setelah verifikasi email, pengguna diarahkan ke `/dashboard`. Sistem otomatis membuat baris baru di tabel `users` melalui webhook Clerk (`user.created`).
2. **Aturan Sistem**:
   - Email wajib unik dan valid.
   - Password minimal 8 karakter dengan kombinasi huruf dan angka (diatur di pengaturan Clerk).
   - Setelah registrasi, pengguna wajib mengisi nama lengkap dan jenis peran (Santri atau Ustadz) pada profil sebelum dapat menyimpan bookmark atau catatan.
   - Akun yang dinonaktifkan admin tidak dapat mengakses area member dan akan diarahkan ke halaman pemberitahuan.

### B. Pencarian dan Katalog Kitab
1. **Cara Kerja**: Pengguna mengetik kata kunci di kolom pencarian. Hasil diperbarui secara langsung (debounce 300 ms). Pengguna dapat menambahkan filter kategori, pengarang, atau syarah. Parameter pencarian disimpan di URL (contoh: `/katalog?q=nahwu&kategori=nahwu-dasar&urut=terbaru`) sehingga dapat dibagikan.
2. **Aturan Sistem**:
   - Pencarian mencakup judul Latin, judul Arab, nama pengarang, dan nama syarah.
   - Hasil pencarian menampilkan maksimal 12 kitab per halaman.
   - Jika tidak ada hasil, tampilkan pesan ramah dan saran kata kunci lain.
   - Hanya kitab dengan status `published` yang tampil di katalog publik.

### C. E-Book Reader (Baca Online)
1. **Cara Kerja**: Pengguna membuka `/baca/[slug]`. Reader memuat file PDF dari CDN Bunny menggunakan `pdfjs-dist` yang dijalankan di sisi klien. Halaman pertama ditampilkan. Pengguna dapat berpindah halaman dengan tombol panah, gestur geser, atau mengetik nomor halaman. Progres disimpan otomatis setiap kali pengguna berpindah halaman, dengan jeda 2 detik agar tidak membebani server.
2. **Aturan Sistem**:
   - Jika pengguna belum login, reader tetap dapat dibuka, tetapi tombol bookmark dan catatan tampil dengan keterangan "Masuk untuk menyimpan".
   - Jika pengguna sudah login dan membuka kitab yang pernah dibaca, reader otomatis melompat ke halaman terakhir (dengan opsi "Mulai dari awal").
   - Zoom tersedia dalam rentang 50% hingga 250%.
   - Mode "Sepia Malam" bersifat preferensi lokal yang disimpan di `localStorage`.
   - Persentase progres dihitung dari `halaman_terakhir / total_halaman * 100`, dibulatkan ke bilangan bulat.

### D. Bookmark
1. **Cara Kerja**: Saat membaca, pengguna menekan ikon bookmark pada halaman yang sedang dibuka. Ikon berubah menjadi terisi. Bookmark juga dapat diberi label opsional (contoh: "Bab Jual Beli").
2. **Aturan Sistem**:
   - Satu pengguna tidak dapat memiliki bookmark ganda pada halaman dan kitab yang sama (dijaga dengan unique constraint).
   - Label bookmark maksimal 80 karakter.
   - Bookmark dapat dihapus dari reader maupun dari halaman `/dashboard/bookmark`.

### E. Catatan Pribadi
1. **Cara Kerja**: Pengguna membuka panel catatan di samping reader, menulis catatan untuk halaman tertentu, lalu menyimpannya. Catatan tersimpan dan dapat dilihat kembali di `/dashboard/catatan`.
2. **Aturan Sistem**:
   - Isi catatan wajib diisi, maksimal 2.000 karakter.
   - Catatan bersifat privat dan hanya dapat dilihat oleh pemiliknya.
   - Input catatan disanitasi untuk mencegah XSS. Teks ditampilkan sebagai teks biasa, bukan HTML.
   - Catatan dapat diedit dan dihapus. Penghapusan memerlukan konfirmasi dialog.

### F. Riwayat Baca dan Progres
1. **Cara Kerja**: Setiap kali pengguna membuka reader, sistem mencatat kitab tersebut ke riwayat. Halaman `/dashboard/riwayat` menampilkan daftar kitab dengan progres dan waktu terakhir dibaca.
2. **Aturan Sistem**:
   - Riwayat disimpan per pasangan pengguna dan kitab (satu baris per kombinasi).
   - Riwayat dapat dihapus satu per satu oleh pengguna tanpa menghapus bookmark dan catatan.
   - Kitab yang sudah selesai dibaca (progres 100%) mendapat label "Selesai" dengan ikon centang.

### G. Manajemen Kitab (Admin)
1. **Cara Kerja**: Admin membuka `/admin/kitab/baru`, mengisi metadata (judul Latin, judul Arab, pengarang, syarah, kategori, tahun, jumlah halaman, deskripsi), lalu mengunggah file PDF. Sistem mengunggah PDF ke Bunny Storage dan menyimpan URL-nya. Jumlah halaman dibaca otomatis dari PDF. Admin dapat menyimpan sebagai draf atau langsung mempublikasikan.
2. **Aturan Sistem**:
   - File wajib berformat PDF dengan ukuran maksimal 150 MB.
   - Judul Latin wajib diisi (3 hingga 150 karakter). Slug dibuat otomatis dari judul dan wajib unik.
   - Kategori (fan) wajib dipilih. Pengarang wajib dipilih. Syarah bersifat opsional.
   - Mengganti file PDF pada kitab yang sudah ada tidak menghapus bookmark dan catatan, tetapi halaman yang melebihi jumlah baru akan ditandai untuk ditinjau admin.
   - Menghapus kitab bersifat soft delete (status `archived`) agar riwayat pengguna tidak rusak. Penghapusan permanen hanya dapat dilakukan dari menu khusus.
   - Setiap perubahan dicatat pada log aktivitas admin.

### H. Manajemen Kategori, Pengarang, dan Syarah (Admin)
1. **Cara Kerja**: Admin membuka halaman masing-masing, lalu menambah, mengubah, atau menghapus data melalui modal form.
2. **Aturan Sistem**:
   - Nama kategori, pengarang, dan syarah wajib unik (case-insensitive).
   - Entitas yang masih dipakai oleh kitab tidak dapat dihapus. Sistem menampilkan jumlah kitab yang terkait.
   - Pengarang dan syarah memiliki kolom nama Arab (opsional), nama Latin (wajib), dan tahun wafat (opsional, berupa Hijriah atau Masehi dengan keterangan).

### I. Manajemen Pengguna (Admin)
1. **Cara Kerja**: Admin melihat daftar member, mencari berdasarkan nama atau email, lalu dapat menonaktifkan atau mengaktifkan kembali akun.
2. **Aturan Sistem**:
   - Admin tidak dapat menonaktifkan akunnya sendiri.
   - Penonaktifan akun menyinkronkan status ke Clerk agar sesi aktif dicabut.

---

## 7. Alur Navigasi & Arsitektur Layout
*Peta navigasi alur halaman dan struktur tata letak (layout).*

### Arsitektur Layout (Persisten)
- **Public Layout**: Menggunakan Header (navbar transparan dengan efek glassmorphism saat di-scroll, berisi logo, menu Katalog, Tentang, FAQ, serta tombol Masuk dan Daftar) dan Footer (tautan legal, kontak, dan hak cipta).
- **Reader Layout**: Layout layar penuh tanpa header dan footer. Hanya memiliki toolbar mengambang di bawah dan tombol kembali di pojok kiri atas.
- **Dashboard Layout**: Menggunakan Sidebar di kiri (fixed, lebar 260 px di desktop) dan Header kecil di atas berisi judul halaman, pencarian cepat, dan avatar pengguna. Pada mobile, sidebar berubah menjadi drawer.
- **Admin Layout**: Sama seperti Dashboard Layout, tetapi menu sidebar berbeda dan diberi label "Panel Pengelola" dengan aksen emas.

### Bagan Alur (Flowchart)
```mermaid
flowchart TD
    A[Pengunjung] --> B[Beranda]
    B --> C[Katalog Kitab]
    B --> D[Tentang / FAQ / Kontak]
    C --> E[Detail Kitab]
    E --> F[Baca Kitab - Reader]
    F --> G{Sudah Login?}
    G -- Tidak --> H[Sign-In / Sign-Up Clerk]
    H --> I[Webhook Sinkron User]
    I --> J[Dashboard Member]
    G -- Ya --> K[Simpan Bookmark / Catatan]
    K --> L[Riwayat & Progres]
    J --> M[Lanjutkan Membaca]
    J --> N[Bookmark Saya]
    J --> O[Catatan Saya]
    J --> P[Riwayat Baca]
    J --> Q[Profil Saya]
    J --> R{Role = Admin?}
    R -- Ya --> S[Dashboard Admin]
    S --> T[Kelola Kitab]
    T --> U[Upload PDF ke Bunny Storage]
    U --> V{Validasi Metadata & PDF}
    V -- Gagal --> T
    V -- Berhasil --> W[Status Published / Draft]
    S --> X[Kelola Kategori / Pengarang / Syarah]
    S --> Y[Kelola Pengguna]
    R -- Tidak --> J
```

---

## 8. Kebutuhan Non-Fungsional (SEO, Keamanan, & Performa)
*Syarat wajib agar website siap rilis ke publik (production-ready).*
- **SEO**:
  - Wajib menggunakan tag `<title>` dinamis, meta description, dan Open Graph (OG) tags di setiap halaman publik. Untuk halaman detail kitab, judul menggunakan format "[Judul Kitab] - [Pengarang] | KitabKu Pesantren".
  - Setiap halaman detail kitab memiliki data terstruktur JSON-LD tipe `Book`.
  - Menyediakan `sitemap.xml` dan `robots.txt` yang dihasilkan otomatis dari data kitab yang berstatus published.
  - Halaman reader dan dashboard diberi `noindex` karena bersifat personal atau interaktif.
  - Gambar sampul menggunakan atribut `alt` yang deskriptif.
- **Keamanan**:
  - Wajib implementasi proteksi CSRF (Server Actions Next.js dengan validasi origin) dan sanitasi input untuk mencegah XSS. Catatan pengguna ditampilkan sebagai teks biasa.
  - Validasi sisi server wajib di setiap Server Action menggunakan Zod, termasuk validasi tipe MIME dan ukuran file PDF.
  - Rate limiting pada endpoint pencarian dan unggah (menggunakan Upstash Redis atau middleware in-memory untuk MVP).
  - File PDF di Bunny Storage hanya dapat diakses melalui URL CDN bertanda tangan (signed URL) dengan masa berlaku terbatas untuk mencegah hotlink bebas. Akses reader dibuat melalui Route Handler yang memvalidasi status publikasi.
  - Header keamanan: `Content-Security-Policy`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
  - Webhook Clerk diverifikasi menggunakan signature Svix sebelum diproses.
  - Semua rahasia disimpan di environment variable dan tidak pernah dikirim ke klien kecuali yang berawalan `NEXT_PUBLIC_`.
- **Performa**:
  - Wajib optimasi gambar (`next/image`) untuk sampul kitab dengan format WebP atau AVIF.
  - Lazy loading komponen berat, terutama `pdfjs-dist` dan komponen reader, menggunakan `next/dynamic` dengan `ssr: false`.
  - Caching data publik (katalog dan detail kitab) menggunakan `unstable_cache` atau revalidasi ISR dengan `revalidateTag` saat admin mengubah data.
  - Pagination server-side untuk seluruh tabel admin dan katalog.
  - Target Core Web Vitals: LCP di bawah 2,5 detik, CLS di bawah 0,1, dan INP di bawah 200 ms.
  - Penyimpanan progres baca dilakukan dengan debounce agar tidak membebani database.
- **Aksesibilitas**: Kontras teks minimal WCAG AA, seluruh tombol memiliki `aria-label` jika hanya berupa ikon, dan navigasi keyboard tersedia di reader (panah kiri dan kanan untuk berpindah halaman).

---

## 9. Panduan Bahasa, Copywriting, & Data Dummy
*Panduan nada bicara (Tone of Voice) dan contoh data agar prototipe terasa nyata.*
- **Gaya Bahasa**: Hangat, sopan, dan religius namun tetap modern. Menggunakan kata "Anda" untuk pengguna dan "Kami" untuk tim pengelola. Sapaan opsional seperti "Assalamu'alaikum" dapat digunakan pada beranda dan email selamat datang. Hindari istilah teknis di antarmuka pengguna.
- **Instruksi Data Dummy**: JANGAN PERNAH MENGGUNAKAN "Lorem Ipsum". Selalu gunakan data dummy berbahasa Indonesia dan kitab yang relevan dengan konteks pesantren.

**Contoh Data Kategori (Fan):**
- Nahwu (Tata Bahasa Arab)
- Sharaf (Morfologi Arab)
- Fiqih
- Tauhid (Akidah)
- Tafsir
- Hadis
- Akhlak dan Tasawuf
- Ushul Fiqih

**Contoh Data Pengarang:**
- Nama Arab: ابن مالك, Nama Latin: Ibnu Malik, Wafat: 672 H
- Nama Arab: الإمام النووي, Nama Latin: Imam An-Nawawi, Wafat: 676 H
- Nama Arab: الإمام الغزالي, Nama Latin: Imam Al-Ghazali, Wafat: 505 H

**Contoh Data Kitab:**
- Judul Latin: Al-Ajurrumiyyah, Pengarang: Ibnu Ajurrum, Kategori: Nahwu, Jumlah Halaman: 24, Status: published
- Judul Latin: Alfiyah Ibnu Malik, Pengarang: Ibnu Malik, Syarah: Ibnu Aqil, Kategori: Nahwu, Jumlah Halaman: 186, Status: published
- Judul Latin: Matan Ghayah wa Taqrib, Pengarang: Abu Syuja', Kategori: Fiqih, Jumlah Halaman: 52, Status: published
- Judul Latin: Riyadhus Shalihin, Pengarang: Imam An-Nawawi, Kategori: Akhlak dan Tasawuf, Jumlah Halaman: 410, Status: published
- Judul Latin: Ihya' Ulumiddin, Pengarang: Imam Al-Ghazali, Kategori: Akhlak dan Tasawuf, Jumlah Halaman: 1.024, Status: draft

**Contoh Data Pengguna:**
- Ahmad Fauzi (Santri, Kelas Lanjutan), progres Al-Ajurrumiyyah 78%
- Ustadz Abdul Rahman (Ustadz), bookmark 12 halaman pada Riyadhus Shalihin
- Siti Maryam (Santri, Kelas Dasar), catatan tentang i'rab fa'il pada Alfiyah

---

## 10. Fondasi Teknis (Untuk Tim Pengembang / Programmer & AI)
*Petunjuk arsitektur teknis spesifik.*
- **Bahasa & Framework**: Next.js 15 (App Router) dengan TypeScript, React 19, Server Components sebagai default, Server Actions untuk mutasi data, dan Route Handlers untuk webhook dan signed URL.
- **Tampilan Antarmuka (UI)**: Tailwind CSS v4, shadcn/ui (dikustomisasi dengan token dark mode premium), Lucide Icons, dan Framer Motion untuk animasi halus.
- **Autentikasi**: Clerk Authentication dengan metode Email & Password. Sinkronisasi pengguna ke database melalui webhook `user.created`, `user.updated`, dan `user.deleted`. Pemeriksaan peran menggunakan `publicMetadata.role` dan kolom `role` di database.
- **Basis Data (Database)**: Neon PostgreSQL dengan Drizzle ORM dan Drizzle Kit untuk migrasi. Pencarian menggunakan `ILIKE` pada MVP dan `pg_trgm` dengan indeks GIN untuk optimasi.
- **Penyimpanan File & CDN**: Bunny Storage untuk menyimpan file PDF kitab dan sampul. Bunny CDN (Pull Zone) untuk distribusi file dengan token authentication.
- **Pustaka Reader**: `pdfjs-dist` untuk merender PDF di browser, dijalankan di sisi klien dengan `next/dynamic`.
- **Validasi**: Zod untuk seluruh skema input (form dan Server Actions).
- **Form**: React Hook Form dengan resolver Zod.
- **State Klien**: Zustand untuk preferensi reader (zoom, mode tampilan) dan TanStack Query hanya jika diperlukan pada data real-time.
- **Hosting**: Vercel untuk aplikasi dan Neon untuk database.

### Struktur Skema Database Nyata
*(Skema Drizzle ORM untuk Neon PostgreSQL, disimpan di `src/db/schema.ts`)*
```typescript
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ENUM
export const roleEnum = pgEnum("role", ["member", "admin"]);
export const jenisPerananEnum = pgEnum("jenis_peran", ["santri", "ustadz"]);
export const statusKitabEnum = pgEnum("status_kitab", ["draft", "published", "archived"]);
export const statusPengguna = pgEnum("status_pengguna", ["aktif", "nonaktif"]);

// USERS (disinkronkan dari Clerk via webhook)
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    namaLengkap: varchar("nama_lengkap", { length: 150 }),
    jenisPeran: jenisPerananEnum("jenis_peran"),
    role: roleEnum("role").notNull().default("member"),
    status: statusPengguna("status").notNull().default("aktif"),
    fontSizePreferensi: integer("font_size_preferensi").notNull().default(16),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_users_role").on(t.role)]
);

// KATEGORI (FAN ILMU)
export const kategori = pgTable(
  "kategori",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nama: varchar("nama", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    deskripsi: text("deskripsi"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_kategori_nama").on(t.nama)]
);

// PENGARANG & SYARAH (satu tabel, dibedakan oleh peran di tabel kitab)
export const pengarang = pgTable(
  "pengarang",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    namaArab: varchar("nama_arab", { length: 200 }),
    namaLatin: varchar("nama_latin", { length: 200 }).notNull(),
    tahunWafat: varchar("tahun_wafat", { length: 40 }),
    biografiSingkat: text("biografi_singkat"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_pengarang_latin").on(t.namaLatin)]
);

// KITAB (E-BOOK)
export const kitab = pgTable(
  "kitab",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    judulLatin: varchar("judul_latin", { length: 200 }).notNull(),
    judulArab: varchar("judul_arab", { length: 300 }),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    deskripsi: text("deskripsi"),
    kategoriId: uuid("kategori_id")
      .notNull()
      .references(() => kategori.id, { onDelete: "restrict" }),
    pengarangId: uuid("pengarang_id")
      .notNull()
      .references(() => pengarang.id, { onDelete: "restrict" }),
    syarahId: uuid("syarah_id").references(() => pengarang.id, { onDelete: "set null" }),
    tahunTerbit: varchar("tahun_terbit", { length: 40 }),
    jumlahHalaman: integer("jumlah_halaman").notNull().default(0),
    urlSampul: text("url_sampul"),
    urlPdf: text("url_pdf").notNull(),
    ukuranPdfByte: integer("ukuran_pdf_byte").notNull().default(0),
    status: statusKitabEnum("status").notNull().default("draft"),
    jumlahDibuka: integer("jumlah_dibuka").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_kitab_status").on(t.status),
    index("idx_kitab_kategori").on(t.kategoriId),
    index("idx_kitab_pengarang").on(t.pengarangId),
  ]
);

// RIWAYAT BACA & PROGRES (satu baris per user per kitab)
export const riwayatBaca = pgTable(
  "riwayat_baca",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kitabId: uuid("kitab_id")
      .notNull()
      .references(() => kitab.id, { onDelete: "cascade" }),
    halamanTerakhir: integer("halaman_terakhir").notNull().default(1),
    persentaseSelesai: integer("persentase_selesai").notNull().default(0),
    terakhirDibukaAt: timestamp("terakhir_dibuka_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_riwayat_user_kitab").on(t.userId, t.kitabId),
    index("idx_riwayat_user_terakhir").on(t.userId, t.terakhirDibukaAt),
  ]
);

// BOOKMARK
export const bookmark = pgTable(
  "bookmark",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kitabId: uuid("kitab_id")
      .notNull()
      .references(() => kitab.id, { onDelete: "cascade" }),
    halaman: integer("halaman").notNull(),
    label: varchar("label", { length: 80 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_bookmark_user_kitab_halaman").on(t.userId, t.kitabId, t.halaman)]
);

// CATATAN PRIBADI
export const catatan = pgTable(
  "catatan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kitabId: uuid("kitab_id")
      .notNull()
      .references(() => kitab.id, { onDelete: "cascade" }),
    halaman: integer("halaman").notNull(),
    isi: varchar("isi", { length: 2000 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_catatan_user_kitab").on(t.userId, t.kitabId)]
);

// LOG AKTIVITAS ADMIN
export const logAdmin = pgTable("log_admin", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  aksi: varchar("aksi", { length: 100 }).notNull(),
  targetTabel: varchar("target_tabel", { length: 60 }).notNull(),
  targetId: varchar("target_id", { length: 60 }),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// RELASI
export const kitabRelations = relations(kitab, ({ one, many }) => ({
  kategori: one(kategori, { fields: [kitab.kategoriId], references: [kategori.id] }),
  pengarang: one(pengarang, {
    fields: [kitab.pengarangId],
    references: [pengarang.id],
    relationName: "pengarangKitab",
  }),
  syarah: one(pengarang, {
    fields: [kitab.syarahId],
    references: [pengarang.id],
    relationName: "syarahKitab",
  }),
  riwayat: many(riwayatBaca),
  bookmark: many(bookmark),
  catatan: many(catatan),
}));

export const usersRelations = relations(users, ({ many }) => ({
  riwayat: many(riwayatBaca),
  bookmark: many(bookmark),
  catatan: many(catatan),
}));
```

**Catatan Skema:**
- Kolom `status` pada `kitab` menentukan visibilitas katalog publik. Hanya `published` yang tampil.
- Kolom `jumlahDibuka` diperbarui secara batch untuk mendukung metrik "kitab paling sering dibaca" tanpa menghitung ulang dari seluruh riwayat.
- Tabel `riwayat_baca` dan `bookmark` menggunakan unique index untuk mencegah duplikasi.

### Variabel Lingkungan (`.env.example`)
```env
# Aplikasi
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="KitabKu Pesantren"

# Clerk Authentication (Email & Password)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REPLACE_ME
CLERK_SECRET_KEY=sk_test_REPLACE_ME
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard/profil
CLERK_WEBHOOK_SECRET=whsec_REPLACE_ME

# Database Neon PostgreSQL
DATABASE_URL=postgresql://user:password@ep-xxxx.ap-southeast-1.aws.neon.tech/kitabku?sslmode=require

# Bunny Storage (penyimpanan PDF & sampul)
BUNNY_STORAGE_ZONE_NAME=kitabku-storage
BUNNY_STORAGE_ACCESS_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
BUNNY_STORAGE_REGION=sg

# Bunny CDN (Pull Zone + Token Authentication)
BUNNY_CDN_HOSTNAME=kitabku.b-cdn.net
BUNNY_CDN_TOKEN_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
BUNNY_SIGNED_URL_EXPIRY_SECONDS=900

# Batas Unggahan
MAX_PDF_SIZE_MB=150
ALLOWED_PDF_MIME=application/pdf

# Rate Limiting (opsional untuk produksi)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 11. Tahapan Pengerjaan & Task Breakdown (Actionable Work Breakdown Structure)
*Daftar tugas terstruktur dan terurut (Atomic Tasks) dengan format checklist markdown `- [ ] **Task X.Y**`. Dirancang khusus agar pengguna dapat menginstruksikan AI Coding Assistant (Antigravity, Cursor, Claude Code, Roo Code, dll.) untuk mengeksekusi proyek langkah demi langkah secara terukur, modular, dan bebas dari kehabisan context window.*

### Tahap 1: Fondasi Proyek, UI/UX, & Semua Halaman (Dummy Data)
*Tujuan: Membangun seluruh antarmuka visual secara 100% lengkap dan responsif menggunakan data dummy sebelum menyentuh database.*
- [ ] **Task 1.1 (Foundations & Design System)**: Setup Tailwind CSS v4 dengan token warna dark mode premium (background navy, emas `amber`, teal) di `globals.css`, konfigurasi font Plus Jakarta Sans, Inter, dan Amiri melalui `next/font`, serta install komponen shadcn/ui (Button, Card, Input, Dialog, Table, Badge, Dropdown Menu, Tabs, Select, Sheet, Skeleton, Tooltip, Textarea).
- [ ] **Task 1.2 (Layouts & Persistent Navigation)**: Buat `app/layout.tsx` (Root Layout dengan tema gelap default), `app/(public)/layout.tsx` (Navbar glassmorphism dan Footer), `app/(reader)/layout.tsx` (layar penuh tanpa header), `app/(member)/layout.tsx` (Sidebar fixed `/dashboard` dengan drawer mobile), dan `app/(admin)/layout.tsx` (Sidebar Panel Pengelola dengan aksen emas).
- [ ] **Task 1.3 (Public Pages)**: Buat halaman `/` (hero, kolom pencarian, kategori fan, kitab pilihan), `/katalog` (grid kartu, filter kategori, pengarang, syarah, pengurutan, pagination dummy), `/kitab/[slug]` (detail lengkap dengan kitab terkait), `/tentang`, `/kontak` (formulir dengan validasi Zod di sisi klien), `/faq` (accordion), `/syarat-ketentuan`, dan `/kebijakan-privasi` menggunakan data dummy dari `src/lib/dummy-data.ts`.
- [ ] **Task 1.4 (Reader Page UI)**: Buat halaman `/baca/[slug]` dengan toolbar mengambang (navigasi halaman, input lompat halaman, zoom 50% hingga 250%, tombol mode Sepia Malam, tombol bookmark, dan tombol catatan). Gunakan placeholder halaman berbentuk kanvas dummy yang mensimulasikan halaman PDF tanpa memuat file asli. Tambahkan panel samping untuk bookmark dan catatan dengan state dummy.
- [ ] **Task 1.5 (Member Area Pages)**: Buat halaman `/dashboard` (sapaan, kartu Lanjutkan Membaca dengan progress bar, statistik, rekomendasi), `/dashboard/bookmark` (dikelompokkan per kitab, dengan aksi hapus), `/dashboard/catatan` (filter per kitab, pencarian, modal edit dan hapus dengan konfirmasi), `/dashboard/riwayat` (daftar dengan label Selesai), dan `/dashboard/profil` (form nama, jenis peran, dan preferensi ukuran huruf) menggunakan state dummy dari `src/lib/dummy-data.ts`.
- [ ] **Task 1.6 (Admin Area Pages)**: Buat halaman `/admin/dashboard` (kartu statistik dan tabel aktivitas dummy), `/admin/kitab` (tabel dengan pencarian, filter status, dan aksi edit serta hapus), `/admin/kitab/baru` dan `/admin/kitab/[id]/edit` (formulir lengkap dengan area unggah PDF dan progress bar dummy), `/admin/kategori`, `/admin/pengarang`, `/admin/syarah` (tabel CRUD dengan modal form), dan `/admin/pengguna` (tabel dengan filter peran dan toggle status) dengan data dummy.
- [ ] **Task 1.7 (Auth Pages UI)**: Buat halaman `/sign-in` dan `/sign-up` sebagai wrapper komponen Clerk dengan tampilan kustom gelap (appearance variables sesuai design system), termasuk halaman pemberitahuan akun nonaktif di `/akun-nonaktif`.

### Tahap 2: Database, Autentikasi, & Integrasi Data Dinamis
*Tujuan: Menghidupkan aplikasi dengan database Neon, autentikasi Clerk, penyimpanan Bunny, dan Server Actions.*
- [ ] **Task 2.1 (Database Schema & Migrations)**: Buat `src/db/schema.ts` sesuai Bab 10 (tabel `users`, `kategori`, `pengarang`, `kitab`, `riwayat_baca`, `bookmark`, `catatan`, `log_admin` beserta enum dan relasi), konfigurasi `drizzle.config.ts`, jalankan `drizzle-kit generate` dan `drizzle-kit migrate` ke Neon, lalu buat `src/db/seed.ts` yang mengisi kategori, pengarang, dan minimal 5 kitab contoh dari Bab 9.
- [ ] **Task 2.2 (Authentication & Route Middleware)**: Pasang Clerk pada `app/layout.tsx` dengan `ClerkProvider`, buat `middleware.ts` yang melindungi `/dashboard/*` (role member atau admin) dan `/admin/*` (role admin hanya jika `role = admin`), serta membatasi `/akun-nonaktif` untuk status nonaktif.
- [ ] **Task 2.3 (Webhook Clerk Sinkronisasi)**: Buat `app/api/webhooks/clerk/route.ts` yang memverifikasi signature Svix dan memproses event `user.created`, `user.updated`, dan `user.deleted` ke tabel `users`.
- [ ] **Task 2.4 (Server Actions Kitab, Kategori, Pengarang, Syarah)**: Buat `src/actions/kitab.ts`, `src/actions/kategori.ts`, dan `src/actions/pengarang.ts` yang berisi operasi Create, Read, Update, Delete dengan validasi Zod, pengecekan role admin, pembuatan slug otomatis, proteksi penghapusan entitas yang masih terpakai, dan pencatatan ke `log_admin`.
- [ ] **Task 2.5 (Upload PDF ke Bunny Storage)**: Buat `src/lib/bunny.ts` dan Route Handler `app/api/admin/upload-pdf/route.ts` yang memvalidasi MIME type dan ukuran file (maksimal `MAX_PDF_SIZE_MB`), mengunggah ke Bunny Storage, lalu mengembalikan URL dan jumlah byte. Jumlah halaman dibaca dari PDF di sisi server menggunakan `pdf-lib` atau `pdfjs-dist`.
- [ ] **Task 2.6 (Server Actions Member: Bookmark, Catatan, Riwayat)**: Buat `src/actions/bookmark.ts`, `src/actions/catatan.ts`, dan `src/actions/riwayat.ts` dengan fungsi tambah, ubah, hapus, dan simpan progres (`upsert` pada `riwayat_baca`). Validasi label bookmark maksimal 80 karakter dan isi catatan maksimal 2.000 karakter.
- [ ] **Task 2.7 (Frontend Data Binding Publik)**: Ganti data dummy pada `/`, `/katalog`, dan `/kitab/[slug]` dengan query Drizzle nyata (hanya status `published`), termasuk pencarian `ILIKE` pada judul Latin, judul Arab, pengarang, dan syarah, filter kategori, dan pagination server-side.
- [ ] **Task 2.8 (Frontend Data Binding Member & Admin)**: Hubungkan seluruh halaman `/dashboard/*` dan `/admin/*` dengan data dan Server Actions nyata, termasuk kartu Lanjutkan Membaca, daftar bookmark, catatan, riwayat, serta statistik admin dari agregasi database.
- [ ] **Task 2.9 (Reader Data Binding & Signed URL)**: Buat Route Handler `app/api/kitab/[slug]/signed-url/route.ts` yang memvalidasi status publikasi dan membuat signed URL Bunny CDN dengan masa berlaku `BUNNY_SIGNED_URL_EXPIRY_SECONDS`. Hubungkan `/baca/[slug]` dengan `pdfjs-dist` yang dimuat melalui `next/dynamic` (`ssr: false`), dengan progres otomatis tersimpan dengan debounce 2 detik.

### Tahap 3: Integrasi Lanjutan, Keamanan, SEO, & Deployment
*Tujuan: Menyempurnakan optimasi performa, keamanan, SEO, pengujian, dan rilis ke production.*
- [ ] **Task 3.1 (Dynamic SEO & Metadata)**: Pasang `generateMetadata` pada `/`, `/katalog`, `/kitab/[slug]`, `/tentang`, `/faq`, dan `/kontak` dengan `<title>`, meta description, dan Open Graph tags (termasuk gambar sampul kitab). Tambahkan JSON-LD tipe `Book` pada halaman detail, serta buat `app/sitemap.ts` dan `app/robots.ts`. Tandai `/baca/*`, `/dashboard/*`, dan `/admin/*` dengan `noindex`.
- [ ] **Task 3.2 (Keamanan & Rate Limiting)**: Pasang header keamanan (CSP, X-Frame-Options, Referrer-Policy) pada `next.config.ts`, pastikan sanitasi input untuk seluruh teks pengguna (terutama catatan), aktifkan rate limiting pada endpoint pencarian dan unggah menggunakan Upstash Redis, dan verifikasi bahwa seluruh Server Action memvalidasi sesi dan peran.
- [ ] **Task 3.3 (Optimasi Performa & Caching)**: Terapkan `unstable_cache` atau `revalidateTag` pada katalog dan detail kitab, pastikan `next/image` digunakan untuk seluruh sampul dengan format WebP atau AVIF, verifikasi lazy loading pada komponen reader, dan tambahkan indeks database `pg_trgm` untuk pencarian judul serta pengarang.
- [ ] **Task 3.4 (Pengujian End-to-End & Bugfix)**: Uji alur pengguna lengkap, mulai dari registrasi, melengkapi profil, membuka kitab, menambah bookmark dan catatan, melanjutkan bacaan, hingga admin mengunggah kitab baru dan menonaktifkan pengguna. Perbaiki error, glitch responsif pada mobile, serta pastikan reader berfungsi dengan keyboard dan gestur sentuh.
- [ ] **Task 3.5 (Production Build & Deployment)**: Konfigurasi environment production di Vercel, isi seluruh variabel dari Bab 10, jalankan migrasi ke database produksi Neon, verifikasi kelulusan `npm run build` tanpa error TypeScript atau ESLint, konfigurasi domain dan SSL, serta daftarkan webhook Clerk ke URL produksi.

---

## 12. Master Starter Prompt (Siap Coding untuk AI Agent)
*Salin prompt di bawah ini ke AI Coding Assistant (Google Antigravity / Cursor / Claude Code / GitHub Copilot / Roo Code / dll.) untuk memulai pengerjaan:*
```markdown
Halo! Kamu berperan sebagai Senior Fullstack Architect dan Lead Developer.
Saya ingin membangun aplikasi "KitabKu Pesantren" berdasarkan dokumen PRD ini.

Silakan baca file @PRD.md

ATURAN EKSEKUSI (WAJIB DIPATUHI):
1. Kerjakan proyek secara BERTAHAP PER FASE (Milestone). Dalam satu putaran kerja, selesaikan SELURUH task dalam satu fase secara mandiri dan tuntas, mulai dari Fase 1 (Tahap 1: UI Frontend dengan data dummy).
2. JANGAN membuat halaman placeholder atau bertuliskan "sedang dalam pengembangan". Setiap halaman di Bab 3 wajib dibuat UI/UX lengkapnya dengan data dummy berbahasa Indonesia sesuai Bab 9.
3. Patuhi 100% Tech Stack (Next.js 15 App Router, Clerk, Neon PostgreSQL + Drizzle ORM, Bunny Storage/CDN, Tailwind CSS, shadcn/ui), skema database Bab 10, Pedoman UI/UX Dark Mode Premium Bab 4, dan hak akses Bab 5.
4. Setelah SELURUH task dalam Fase 1 selesai, laporkan ringkasan hasil pekerjaan (daftar file yang dibuat dan halaman yang sudah berfungsi), lalu BERHENTI dan MENUNGGU instruksi konfirmasi saya sebelum memulai Fase 2.
5. Jangan lanjut ke Fase 2 sebelum saya memberikan persetujuan eksplisit.

Jika kamu sudah membaca dan memahami PRD, silakan berikan ringkasan singkat pemahamanmu dan tanyakan kesiapan saya untuk mulai mengerjakan Fase 1 (Tahap 1: Task 1.1 hingga Task 1.7)!
```
