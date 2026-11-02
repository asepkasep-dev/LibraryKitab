# AGENTS.md: KitabKu Pesantren

Perpustakaan digital kitab kuning (turats) untuk santri, ustadz, dan pengelola pesantren, dengan katalog publik, e-book reader online, dan dashboard member serta admin.

## Ringkasan Proyek

- Tujuan: memudahkan pencarian, pembacaan, dan pencatatan kitab secara gratis dari perangkat apa pun.
- Pengguna: Pengunjung publik (katalog, detail, baca), Santri dan Ustadz (bookmark, catatan, riwayat), Admin (kelola kitab, kategori, pengarang, syarah, pengguna).
- Fitur inti MVP: katalog dengan pencarian dan filter, E-Book Reader PDF di browser, bookmark dan catatan per halaman, progres baca otomatis, dashboard admin.
- Di luar MVP (jangan dikerjakan): pembayaran, aplikasi mobile native, offline PWA, OCR, forum, multi-tenant, notifikasi WhatsApp atau email.
- Konteks lengkap ada di PRD. Jika PRD bertentangan dengan aturan di file ini, ikuti AGENTS.md dan tanyakan bila ragu.

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui (dikustomisasi token warnanya)
- PostgreSQL + Drizzle ORM
- Autentikasi: Clerk (email dan password, webhook `user.created`)
- Validasi: Zod
- Ikon: Lucide React (stroke 1.75)
- Deploy: Vercel atau VPS

## Perintah

```bash
npm install                  # instal dependensi
npm run dev                  # jalankan server development
npm run build                # build production, wajib lolos sebelum merge
npx tsc --noEmit             # cek tipe TypeScript tanpa build
npm run lint                 # ESLint, wajib nol error
npm test                     # jalankan unit dan integration test
npx drizzle-kit generate     # buat file migration dari perubahan skema # sesuaikan
npx drizzle-kit migrate      # terapkan migration ke database # sesuaikan
npm run db:seed              # seed peran admin awal dan data dummy # sesuaikan
```

## Struktur Proyek

Pola folder yang disarankan (sesuaikan dengan kondisi repo saat ini):

```
app/
  (public)/        beranda, katalog, kitab/[slug], tentang, kontak, faq, legal
  (auth)/          sign-in, sign-up (Clerk)
  (member)/        dashboard, bookmark, catatan, riwayat, profil
  baca/[slug]/     e-book reader (layar penuh, publik untuk melihat)
  admin/           dashboard, kitab, kategori, pengarang, syarah, pengguna
  api/webhooks/    webhook Clerk
components/ui/     komponen shadcn/ui yang sudah dikustomisasi
components/        komponen fitur (katalog, reader, bookmark)
db/schema/         definisi tabel Drizzle
db/migrations/     file migration (jangan diedit manual)
lib/               auth, validasi Zod, utilitas format
```

- Logika akses dan query database ditaruh di `lib/` atau `db/`, bukan langsung di komponen UI.
- Komponen di `components/ui/` hanya berisi kode shadcn/ui dan turunan kustomisasinya.

## Konvensi Kode

- Komponen React maksimal sekitar 200 baris. Pecah bila lebih.
- Gunakan Server Components secara default. Tambahkan `"use client"` hanya bila butuh state, efek, atau event browser.
- Penamaan: komponen PascalCase, fungsi dan variabel camelCase, file komponen kebab-case, tabel dan kolom database snake_case.
- Data fetching: ambil data di Server Components atau Server Actions. Jangan fetch dari client untuk data yang bisa dirender di server.
- Error handling: setiap Server Action dan route handler mengembalikan hasil bertipe (sukses atau error pesan) dan tidak membocorkan stack trace ke client.
- Validasi input dengan Zod di server. Skema Zod yang sama boleh dipakai ulang di form client.
- Format dan lint: ikuti konfigurasi proyek. Jangan menonaktifkan rule ESLint tanpa komentar alasan.
- Import: gunakan path alias proyek. Hindari import relatif yang naik lebih dari dua level.

## Aturan UI/UX

### Prinsip Umum

- Desain: dark mode sebagai default, elegan, tenang, religius-modern, dengan banyak ruang kosong.
- Jika PRD bertentangan dengan aturan anti-slop di bawah, aturan anti-slop yang menang. Contoh: glassmorphism, glow, dan fade-in per section dari PRD tidak dipakai.
- Warna dan spacing hanya lewat token Tailwind dan variabel CSS semantik (background, card, foreground, muted, primary, border). Hex atau HSL hardcode di komponen dilarang.
- Token dasar: background navy sangat gelap dengan tint brand, card sedikit lebih terang, primary emas, teks utama dan sekunder dengan kontras minimal WCAG AA.
- Teal dari PRD tidak dipakai sebagai aksen. Badge kategori memakai netral atau emas tipis.
- Radius: satu skala saja, `rounded-xl` untuk tombol dan input, `rounded-2xl` untuk kartu.
- Layout responsif mobile-first. Pada layar kecil, sidebar dashboard menjadi drawer dari bawah.
- Reader mobile menampilkan satu halaman penuh dengan gestur geser kiri dan kanan.
- Teks Arab memakai Amiri atau Noto Naskh Arabic dengan `dir="rtl"` dan line-height 1.9. Ini pengecualian skrip, bukan keluarga font ketiga.
- Pakai ulang komponen shadcn/ui yang sudah ada sebelum membuat komponen baru.

### Aturan anti-slop UI

#### Warna
- Jangan pakai gradien ungu-biru, gradien teks (`bg-clip-text`), atau glow neon sebagai gaya default. Ganti dengan isi solid dari warna brand emas; gradien hanya bila memang bagian identitas brand.
- Jangan menambah warna aksen kedua atau warna berbeda di tiap section. Ganti dengan satu warna brand emas beserta skala turunannya (50 sampai 900); warna lain hanya untuk status nyata (sukses, peringatan, error).
- Jangan pakai abu murni atau `#000`/`#fff` untuk latar luas. Ganti dengan netral yang sedikit di-tint ke hue brand, dipakai lewat token semantik (background, card, foreground, muted).
- Jangan membuat dark mode hitam pekat dengan aksen neon, atau section yang tetap terang di mode gelap. Ganti dengan token yang sama: latar gelap ber-tint brand, permukaan bertingkat sedikit lebih terang, kontras teks minimal WCAG AA.

#### Tipografi
- Jangan membiarkan font bawaan tanpa keputusan atau memakai serif dekoratif sebagai default. Ganti dengan maksimal 2 keluarga font (Plus Jakarta Sans untuk judul, Inter untuk body), dipakai konsisten.
- Jangan pakai ukuran judul dan body yang nyaris sama atau terlalu banyak ukuran. Ganti dengan lompatan ukuran tegas (H1 desktop sekitar 3x body), body 16-18px, line-height sekitar 1.6, maksimal sekitar 70 karakter per baris.
- Jangan pakai font monospace untuk label, harga, atau statistik demi kesan teknis. Ganti dengan mono hanya untuk kode, nama file, dan perintah; angka memakai font sans dengan `tabular-nums`.
- Jangan memberi satu kata di headline warna berbeda, italic, atau gradien. Ganti dengan headline satu warna; beri penekanan lewat ukuran dan pemenggalan baris.
- Jangan menaruh label kecil kapital atau bernomor di atas setiap judul (mis. "01 · FITUR", "BUILT FOR TEAMS"). Ganti dengan label sans dengan kapitalisasi normal, maksimal satu per beberapa section, atau hapus.

#### Layout
- Jangan menyusun fitur sebagai 3 kartu identik (ikon dalam kotak, judul, 2 baris teks) di grid sama besar. Ganti dengan grid asimetris (1 besar + 2 kecil), daftar tanpa kartu, atau kartu berisi screenshot atau output nyata.
- Jangan membuat hero rata tengah dengan latar grid, titik, atau glow, badge kecil, headline panjang, dan dua tombol setara. Ganti dengan headline maksimal 2 baris, subteks singkat, satu CTA utama yang terlihat tanpa scroll, dan visual nyata produk.
- Jangan membuat semua judul section rata tengah. Ganti dengan rata kiri sebagai default; rata tengah hanya untuk CTA penutup atau empty state.
- Jangan mengulang pola "judul + grid kartu", zig-zag gambar-teks, atau "cara kerja 1-2-3" bernomor berturut-turut. Ganti dengan section lebar penuh, daftar, atau satu section kontras; langkah bernomor hanya untuk proses yang memang berurutan.
- Jangan membungkus semua konten dengan kartu atau menaruh kartu di dalam kartu. Ganti dengan kartu hanya untuk item yang bisa diklik atau ditindaklanjuti; konten lain dikelompokkan dengan jarak.

#### Komponen & Ikon
- Jangan pakai emoji atau ikon sparkle sebagai ikon fitur atau penanda "AI". Ganti dengan satu set ikon Lucide yang konsisten dengan makna yang sesuai.
- Jangan menaburkan badge atau pill berwarna, titik status, atau label NEW atau BETA sebagai dekorasi. Ganti dengan badge hanya untuk status nyata (Aktif, Gagal, Gratis) dan rilis yang memang baru.
- Jangan pakai glassmorphism, glow, atau shadow tebal di semua elemen. Ganti dengan permukaan solid, border 1px tipis, dan shadow halus hanya untuk elemen yang melayang (dropdown, modal).
- Jangan menaruh dua tombol berbobot sama berdampingan. Ganti dengan satu tombol utama solid, aksi kedua sebagai tombol outline atau link teks yang jelas lebih ringan.
- Jangan membuat terminal, editor kode, atau dashboard palsu dari div kosong sebagai ilustrasi. Ganti dengan screenshot asli, komponen yang benar-benar berfungsi, atau placeholder netral yang jelas terlihat sebagai placeholder.

#### Copy & Konten
- Jangan pakai kata pengisi seperti Revolusioner, Seamless, Unlock, Elevate, Unleash, atau "Tingkatkan produktivitasmu". Ganti dengan kata kerja konkret dan hasil spesifik (mis. "Cari kitab nahwu dalam 2 detik").
- Jangan pakai em-dash atau en-dash di teks UI (judul, tombol, label, body). Ganti dengan tanda hubung biasa, koma, titik dua, kurung, atau pecah jadi dua kalimat.
- Jangan pakai Lorem Ipsum, nama generik (John Doe), avatar inisial, atau angka palsu yang terlalu presisi (99,99%, 10k+). Ganti dengan data dummy realistis dan beragam sesuai pengguna proyek; angka di halaman publik hanya dari data asli.
- Jangan membuat testimoni karangan, logo "Dipercaya oleh" tanpa kerja sama nyata, atau statistik pengguna fiktif. Ganti dengan bukti nyata (nama lengkap, peran, tautan) atau hilangkan section itu sampai datanya ada.

#### Animasi
- Jangan menambah fade atau slide-up di setiap section saat scroll. Ganti dengan konten tampil langsung; maksimal satu momen animasi per halaman yang menjelaskan hierarki atau memberi umpan balik.
- Jangan memaksakan animasi ke semua pengguna. Ganti dengan setiap animasi punya fallback `prefers-reduced-motion` yang tampil statis atau instan.
- Jangan pakai `transition-all`, efek bounce atau elastic, atau animasi width, height, dan top. Ganti dengan animasi transform dan opacity, 150-300ms untuk interaksi, dengan satu easing yang konsisten.
- Jangan memberi efek hover (naik, membesar, glow) pada kartu atau elemen yang tidak bisa diklik. Ganti dengan hover dan `:active` hanya pada elemen interaktif, dengan umpan balik yang jelas tapi halus.

#### State & Interaksi
- Jangan hanya mendesain kondisi ideal saat data lengkap. Ganti dengan setiap komponen interaktif punya state hover, focus yang terlihat, active, disabled, loading, empty, dan error.
- Jangan menampilkan "Tidak ada data" atau ilustrasi kosong saja. Ganti dengan judul, satu kalimat konteks, dan satu tombol untuk langkah berikutnya.
- Jangan pakai spinner layar penuh atau skeleton untuk konten yang statis. Ganti dengan render konten statis langsung; skeleton hanya untuk data yang dimuat, ukurannya sama dengan konten akhir agar tidak ada layout shift.

## Aturan Kerja Agent

- Baca file terkait sebelum mengubah. Telusuri pola yang sudah ada dan ikuti.
- Untuk perubahan besar (lebih dari satu modul, skema database, atau alur auth), tulis rencana singkat lalu tunggu persetujuan.
- Buat perubahan kecil dan fokus. Jangan refactor, rename, atau memformat ulang kode di luar lingkup tugas.
- Bertanya bila kebutuhan ambigu atau aksi bersifat merusak.
- Setiap perubahan logika wajib disertai atau diperbarui test.
- Verifikasi sebelum selesai: jalankan `npx tsc --noEmit`, `npm run lint`, dan `npm test` yang relevan. Laporkan perintah yang dijalankan dan hasilnya. Jangan mengklaim berhasil tanpa menjalankan.
- Git: dilarang `git commit` atau `git push` kecuali diminta eksplisit. Dilarang force push, `reset --hard`, menghapus branch, atau menulis ulang history. Jangan commit file `.env` atau secret.
- Di akhir tugas, laporkan daftar file yang berubah dan ringkasan perubahannya.

## Keamanan & Data

- Secret (kunci Clerk, koneksi database, dan kredensial lain) hanya di environment variable. Jangan kirim ke client, jangan di-log, dan jangan hardcode.
- Validasi semua input dengan Zod di server, termasuk form, query string, dan payload webhook.
- Cek otorisasi di server untuk setiap aksi. Route admin dan Server Action admin wajib memverifikasi peran dari sumber server (kolom `role` di `users`), bukan dari data client.
- Jangan percaya data dari client untuk harga, peran, atau user id. Ambil user id dari sesi Clerk.
- Verifikasi signature webhook Clerk sebelum memproses `user.created`.
- Query database hanya lewat Drizzle dengan parameter. Dilarang menyusun SQL dengan string concatenation.
- Upload PDF: validasi tipe dan ukuran di server, simpan dengan nama acak, dan jangan percaya nama file dari client.
- Perubahan skema hanya lewat migration. Dilarang `DROP`, `TRUNCATE`, atau `DELETE` massal, dan dilarang mengubah data production tanpa konfirmasi eksplisit.
- Gunakan transaksi untuk perubahan multi-langkah.
- Perubahan skema harus kompatibel mundur: tambah kolom nullable dulu, baru migrasi data, lalu batasi.
- Email, nama, dan data pribadi pengguna tidak boleh muncul di log atau URL.

## Larangan

- DILARANG menulis UI, copy, atau data dengan bahasa selain Bahasa Indonesia baku yang natural (istilah teknis umum boleh).
- DILARANG memakai format angka atau tanggal selain format Indonesia: Rupiah (Rp 150.000), tanggal Indonesia, nomor telepon +62.
- DILARANG membuat kitab, pengarang, atau syarah palsu di data produksi. Data dummy hanya untuk seed dan development.
- DILARANG menampilkan kitab berstatus selain `published` di katalog atau halaman publik.
- DILARANG memberi akses admin lewat UI publik atau kode client. Pemberian peran hanya oleh admin lain atau skrip seed.
- DILARANG mengimplementasikan fitur di luar MVP (pembayaran, offline PWA, OCR, forum, notifikasi WhatsApp atau email, multi-tenant).
- DILARANG memakai `dangerouslySetInnerHTML` dengan data dari user.
- DILARANG memakai `any` tanpa alasan tertulis di komentar.

## Definition of Done

- [ ] Perubahan sesuai lingkup tugas dan tidak menyentuh kode di luar lingkup.
- [ ] `npx tsc --noEmit`, `npm run lint`, dan `npm test` lolos, dengan hasil dilaporkan.
- [ ] Test ditambahkan atau diperbarui untuk logika yang berubah.
- [ ] Setiap aksi baru memiliki cek otorisasi di server dan validasi Zod.
- [ ] UI baru memiliki state hover, focus, disabled, loading, empty, dan error, serta lolos aturan anti-slop dan aksesibilitas (label input, keyboard, kontras AA).
- [ ] Daftar file yang berubah dan hasil verifikasi dilaporkan ke user.