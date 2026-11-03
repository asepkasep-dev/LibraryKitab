# Pecah Komponen Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memecah tiga komponen reader yang melewati 200 baris (`reader-shell.tsx` 546, `panel-samping.tsx` 462, `toolbar-baca.tsx` 235) menjadi berkas-berkas fokus di bawah 200 baris tanpa mengubah perilaku satu bit pun.

**Architecture:** Tiga lapis. (1) Keputusan murni yang hari ini terkurung di dalam closure komponen (pengurutan daftar, batas halaman, arah geseran, tombol navigasi, parsing preferensi localStorage, kalimat pil progres, batas lompat halaman) pindah ke `src/lib/baca-alur.ts` dan diuji dengan `node:test`. (2) State dan efek yang hanya relevan bagi satu bagian shell (preferensi zoom/sepia, navigasi halaman, kirim progres, daftar bookmark, daftar catatan) pindah ke custom hook di `src/components/reader/`. (3) JSX pindah utuh ke komponen saudaranya, dan shell tinggal sebagai wadah komposisi. Nama komponen yang diekspor serta tanda tangan prop `ReaderShell`, `PanelSamping`, dan `ToolbarBaca` tidak berubah, jadi tidak ada satu pun berkas `src/app/` yang perlu disentuh.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript, Tailwind v4 dengan token semantik, radix-ui (Tabs/Dialog/Sheet/Tooltip), lucide-react, sonner, Node built-in test runner (`node:test` + `node:assert/strict`) dengan `tsx`.

**Acuan:** `C:\LibraryKitab\AGENTS.md` aturan "Komponen React maksimal sekitar 200 baris. Pecah bila lebih" dan daftar ratchet `daftarDasar` di [tests/ui-higienis.test.ts](../../../tests/ui-higienis.test.ts). Tidak ada dokumen spec terpisah untuk pekerjaan ini; rencana adalah dokumen tertingginya, dan [docs/superpowers/plans/2026-11-02-pecah-komponen-admin.md](2026-11-02-pecah-komponen-admin.md) adalah preseden bentuk sekaligus pola ratchet yang sudah terbukti jalan.

**Di luar lingkup:** 10 berkas non-admin, non-reader yang masih di atas 200 baris di `daftarDasar` (halaman publik, dashboard member/admin, `form-profil`, `kerja-catatan`, `katalog-explorer`, `kontak-form`, `sidebar-shell`), utang visual reader yang menunggu uji live (label kapital "Panel baca" di [panel-samping.tsx:157](../../../src/components/reader/panel-samping.tsx#L157) dan `backdrop-blur-xl` yang hanya dipindah, tidak dihapus), `halaman-pdf.tsx` (164 baris, sudah fokus), serta #25 perpanjangan URL tanda tangan saat sesi baca berjalan.

## Global Constraints

Setiap tugas di bawah implicitly mengikuti baris-baris ini, dikutip apa adanya dari `AGENTS.md`:

- "Komponen React maksimal sekitar 200 baris. Pecah bila lebih."
- "Gunakan Server Components secara default. Tambahkan `\"use client\"` hanya bila butuh state, efek, atau event browser."
- "Buat perubahan kecil dan fokus. Jangan refactor, rename, atau memformat ulang kode di luar lingkup tugas."
- "Setiap perubahan logika wajib disertai atau diperbarui test."
- "Verifikasi sebelum selesai: jalankan `npx tsc --noEmit`, `npm run lint`, dan `npm test` yang relevan. Laporkan perintah yang dijalankan dan hasilnya. Jangan mengklaim berhasil tanpa menjalankan."
- "Git: dilarang `git commit` atau `git push` kecuali diminta eksplisit."
- "DILARANG menulis UI, copy, atau data dengan bahasa selain Bahasa Indonesia baku yang natural (istilah teknis umum boleh)."
- "DILARANG memakai em-dash atau en-dash di teks UI (judul, tombol, label, body)."
- "DILARANG memakai `any` tanpa alasan tertulis di komentar."
- "Pakai ulang komponen shadcn/ui yang sudah ada sebelum membuat komponen baru."
- "Gunakan path alias proyek. Hindari import relatif yang naik lebih dari dua level."
- "Di akhir tugas, laporkan daftar file yang berubah dan ringkasan perubahannya."

### Aturan teknis yang berlaku di semua tugas

1. **Batas 200 baris ditegakkan oleh test, bukan oleh opini.** `tests/ui-higienis.test.ts` punya ratchet "jumlah komponen di atas 200 baris" berisi peta `jalur -> jumlah baris` untuk setiap `.tsx` di atas 200 (`split("\n").length`, jadi 1 lebih besar dari `wc -l`). Berkas yang sudah turun ke 200 atau kurang **harus dihapus dari `daftarDasar`**; kalau tidak, test gagal karena entri itu tidak muncul lagi di hasil pemindaian.
2. **Ada ratchet kedua yang ikut bergerak: peta glassmorphism.** Test "utang permukaan glassmorphism" mengunci `{ "src/components/reader/reader-shell.tsx": 1 }` untuk pola `/backdrop-blur/g` di seluruh `src/**`. Satu-satunya `backdrop-blur` di shell ada di header [:396](../../../src/components/reader/reader-shell.tsx#L396). Saat header pindah, kuncinya ikut pindah: entri diganti menjadi jalur berkas barunya (`kop-baca.tsx`), jumlahnya tetap 1. Menghapus entri tanpa mengganti jalur berarti utang hilang dari catatan, dan itu bukan hasil yang diterima.
3. **Transkripsi, jangan tebak.** Angka baseline baru diambil dari output test yang gagal, disalin apa adanya. Teks UI, kelas Tailwind, `aria-label`, `id`, dan urutan cabang dipindah kata demi kata.
4. **Akhiri setiap tugas dengan tiga gerbang dan exit code nyata** (jangan menyimpulkan hijau dari pipe atau notifikasi latar):

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npm run lint; echo "lint exit=$?"
npm test; echo "test exit=$?"
```

Target: ketiganya `exit=0`. Tidak ada perintah `format:check` di `package.json`, jadi jangan mengarangnya. `npm run build` keluar 1 di mesin ini karena `DATABASE_URL` masih placeholder; jangan menjalankannya dan jangan memakainya sebagai gerbang.

5. **Akhiri setiap tugas dengan checkpoint ratchet:**

```bash
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

6. **Akhiri setiap tugas dengan bukti struktur:**

```bash
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){console.log(f.split('/').pop(), fs.readFileSync(f,'utf8').split('\n').length)}" src/components/reader/<hasil-pecah>.tsx
```

7. **Baris akhir.** Semua berkas `src/**` memakai CRLF; semua berkas `tests/**` memakai LF. `Write` menghasilkan LF, jadi setiap berkas baru di `src/` dinormalisasi lalu diverifikasi:

```bash
node -e "const fs=require('fs'),p=process.argv[1];const s=fs.readFileSync(p,'utf8');fs.writeFileSync(p,s.replace(/\r\n/g,'\n').replace(/\n/g,'\r\n'))" src/components/reader/kop-baca.tsx
node -e "const s=require('fs').readFileSync(process.argv[1],'utf8');const n=(s.match(/\n/g)||[]).length,c=(s.match(/\r\n/g)||[]).length;console.log(n===c&&n>0?'CRLF oke':'LF: perbaiki')" src/components/reader/kop-baca.tsx
```

Perintah cek yang benar membandingkan jumlah `\n` dengan jumlah `\r\n`; pola `/(^|\r)\n/g` menghitung CRLF dua kali dan menyatakan semua berkas oke.

8. **Jangan pernah commit.** HEAD dibiarkan di `0403174` sampai pengguna meminta secara eksplisit.
9. **Jangan ubah `src/app/**`.** Reader hanya dipakai satu tempat, [src/app/(reader)/baca/[slug]/page.tsx:3](../../../src/app/(reader)/baca/[slug]/page.tsx#L3). Kalau sebuah tugas sampai menyentuh halaman itu, artinya tanda tangan prop berubah dan tugas itu harus dibatalkan, bukan halamannya yang disesuaikan.
10. **Tidak ada uji render.** Harness proyek ini `node:test` tanpa jsdom maupun testing-library, jadi JSX hasil pemindahan tidak bisa diuji perilakunya dari test. Yang diuji hanyalah logika murni di `src/lib/baca-alur.ts`. Untuk JSX, bukti yang diterima: (a) diff transkripsi, (b) `tsc` dan `lint` lolos, (c) tanda tangan prop publik tidak berubah, (d) jumlah baris. Kesetaraan visual dan interaktif menunggu uji live (#4/#28) dan harus dilaporkan sebagai batasan, bukan sebagai keberhasilan.
11. **Hook disimpan di `src/components/reader/`, bukan `src/lib/`.** `src/lib/**` dipakai bersama sisi server (misalnya `src/lib/baca.ts` diimpor `src/actions/baca.ts`), jadi hook client tidak boleh mampir ke sana. AGENTS melarang "logika akses dan query database" di komponen UI; hook ini tidak menyentuh database, hanya merangkai state dengan server action yang sudah tervalidasi.

### Invarian perilaku yang tidak boleh berubah

Daftar jebakan yang sudah dibaca dari sumbernya. Melanggarnya membuat test tetap hijau padahal pengguna merasakan perbedaan.

1. **Keadaan suntingan tidak boleh turun ke anak.** `draft`, `sedangSunting`, `teksSunting`, dan `labelDiusulkan` ([panel-samping.tsx:110-114](../../../src/components/reader/panel-samping.tsx#L110)) harus tetap dimiliki `panel-samping.tsx`. Radix `TabsContent` meng-unmount tab yang tidak aktif, jadi memindahkan salah satu state itu ke `papan-bookmark.tsx` atau `papan-catatan.tsx` akan menghapus suntingan yang sedang berjalan setiap kali pengguna berpindah tab. Hari ini suntingan itu bertahan. Nilai dan setter dioper lewat prop.
2. **Fokus textarea catatan punya dependensi persis.** Efek [:119-122](../../../src/components/reader/panel-samping.tsx#L119) berdep `[tab, bolehSimpan, halaman]` dan memfokuskan `textareaRef`. Efek dan ref tinggal di `panel-samping.tsx`; hanya `<Textarea ref={textareaRef}>` yang pindah. Memindahkan efek ke anak mengubah kapan fokus terjadi.
3. **`bukaPanel` adalah toggle, `pilihPanel` bukan.** Tombol toolbar memakai `bukaPanel` [shell:246-253](../../../src/components/reader/reader-shell.tsx#L246) yang menutup panel kalau tabnya sama. Sehabis menambah bookmark, `tandaiHalaman` memanggil `setTabPanel("bookmark"); setPanel("bookmark")` [:225-226](../../../src/components/reader/reader-shell.tsx#L225) tanpa logika toggle. Toolbar tetap memakai `bukaPanel` (toggle) dan jalur itu tinggal di shell. Yang dioper ke hook bookmark hanya jalur non-toggle, sebagai `onPilihPanel`. Keduanya tidak boleh dipertukarkan.
4. **`halamanTersimpan` diinisialisasi dari `halamanAwal` yang belum dibatasi.** [shell:84](../../../src/components/reader/reader-shell.tsx#L84) memakai `useState(halamanAwal)` sementara `halaman` memakai `batasiHalaman(halamanAwal, total)`. Kalau `halamanAwal` di luar rentang, keduanya memang berbeda hari ini dan pil progres menampilkan nilai yang belum dibatasi. Pertahankan, termasuk di hook.
5. **`preventDefault` hanya untuk tombol navigasi.** Rantai `else if` di [shell:155-177](../../../src/components/reader/reader-shell.tsx#L155) memanggil `e.preventDefault()` untuk ArrowLeft/ArrowRight/Home/End saja; Escape tidak. Penulisan ulang boleh menyusun cabang, tidak boleh menambah atau mengurangi `preventDefault`.
6. **Progres dikirim ditunda 2 detik dan dibatalkan saat halaman berubah.** [shell:121-137](../../../src/components/reader/reader-shell.tsx#L121) pindah apa adanya ke `use-progres-baca.ts`, termasuk `return () => clearTimeout(jeda)` dan guard `halaman === halamanTersimpan`.
7. **Setiap mutasi optimistik punya jalan balik.** `tandaiHalaman`, `hapusBookmark`, `hapusCatatan`, dan `gantiLabel` mengembalikan daftar lama kalau server menolak, dan toast keberhasilan membawa aksi "Urungkan" yang memanggil `pulihkanBookmark` / `pulihkanCatatan` (yang menambah ulang lewat server, bukan hanya menaruh kembali di layar). Bentuk ini disalin utuh ke hook.
8. **Satu dialog konfirmasi untuk dua tab.** `konfirmasi` dan `<Dialog>` di [:114, :437-458](../../../src/components/reader/panel-samping.tsx#L437) dimiliki panel. Anak hanya mengajukan objek `{ judul, penjelasan, lakukan }`; dialognya satu, di panel.
9. **Copy dan angka tidak disentuh.** Ambang geser 64px/90px, `maxLength={80}` input label, `MAKS_ISI_CATATAN`, istilah "muraja'ah", dan seluruh `aria-label` dipindah verbatim. Apa pun yang menggoda di sekitarnya adalah task lain.
10. **`StatusProgres` pindah, tidak diduplikasi.** Tipe di [shell:40](../../../src/components/reader/reader-shell.tsx#L40) pindah ke `src/lib/baca-alur.ts` dan diimpor oleh shell, hook progres, dan `kop-baca.tsx`.
11. **State yang boleh ikut komponennya hanya yang benar-benar privat.** `saranLanjutDitutup` ([shell:85](../../../src/components/reader/reader-shell.tsx#L85), hanya dibaca banner itu) dan `teksLompat` ([toolbar:96](../../../src/components/reader/toolbar-baca.tsx#L96), hanya dibaca form lompat) boleh dimiliki komponen baru. Yang lain tidak.

---

## Peta Berkas

| Berkas | Nasib | Tanggung jawab |
|---|---|---|
| `src/lib/baca-alur.ts` | baru | `StatusProgres`, `Titik`, `AksiTombolBaca`, `PreferensiBacaTersimpan`; `urutBookmark`, `urutCatatan`, `batasiHalaman`, `arahGeser`, `aksiTombolBaca`, `tujuanLompatBaca`, `bacaPreferensiBaca`, `tulisPreferensiBaca`, `teksPillProgres`, `AMBANG_GESER_X_PX`, `MAKS_LARI_GESER_Y_PX` |
| `tests/baca-alur.test.ts` | baru | uji semua fungsi di atas, ditulis sebelum implementasinya |
| `src/components/reader/tombol-toolbar-baca.tsx` | baru | `TombolToolbar`: tombol ikon ber-tooltip dengan state aktif/tertekan |
| `src/components/reader/lompat-halaman-baca.tsx` | baru | form lompat halaman + state teksnya |
| `src/components/reader/toolbar-baca.tsx` | ubah 235→±175 | komposisi toolbar: navigasi, zoom, sepia, bookmark, panel |
| `src/components/reader/chip-halaman.tsx` | baru | tombol nomor halaman yang dipakai kedua tab |
| `src/components/reader/dialog-konfirmasi-baca.tsx` | baru | Dialog hapus generik reader + tipe `Konfirmasi` |
| `src/components/reader/papan-bookmark.tsx` | baru | tab bookmark: tombol tandai, daftar baris, sunting label inline, empty state |
| `src/components/reader/papan-catatan.tsx` | baru | tab catatan: komposer, daftar baris, sunting inline, empty state |
| `src/components/reader/panel-samping.tsx` | ubah 462→±190 | wadah: progres, tabs, inset anonim, state suntingan, validator, dialog |
| `src/components/reader/use-preferensi-baca.ts` | baru | state zoom/sepia + pulih dan simpan localStorage |
| `src/components/reader/use-navigasi-baca.ts` | baru | state halaman + `pindah` + efek tombol keyboard |
| `src/components/reader/use-progres-baca.ts` | baru | state status + halaman tersimpan + kirim tertunda 2 detik |
| `src/components/reader/use-bookmark-baca.ts` | baru | daftar bookmark + tandai, label, hapus, urungan |
| `src/components/reader/use-catatan-baca.ts` | baru | daftar catatan + tambah, ubah, hapus, urungan |
| `src/components/reader/kanvas-baca.tsx` | baru | wadah scroll, gestur sentuh, `<HalamanPdf>` |
| `src/components/reader/kop-baca.tsx` | baru | header: kembali, judul, pil progres, avatar/Masuk |
| `src/components/reader/saran-lanjut-baca.tsx` | baru | banner "Melanjutkan dari halaman N" + state ditutupnya |
| `src/components/reader/wadah-panel-baca.tsx` | baru | aside layar lebar vs Sheet layar kecil |
| `src/components/reader/reader-shell.tsx` | ubah 546→±170 | wadah komposisi: props, panel/tab, layar, sesi baca, menyusun semuanya |
| `tests/ui-higienis.test.ts` | ubah | `daftarDasar` ukuran menyusut per tugas; kunci `backdrop-blur` diganti jalur |

Angka di kolom "ubah" adalah perkiraan hasil hitung manual, bukan target yang harus ditepati. Gerbang sebenarnya hanya dua: setiap `.tsx`/`.ts` hasil pemecahan ≤ 200 baris (`split("\n").length`) dan tidak ada lagi berkas reader di `daftarDasar` ukuran. Ukur dengan perintah bukti baris di Aturan teknis 6, jangan menyesuaikan kode supaya cocok dengan angka di tabel ini. Kalau perkiraan meleset, langkah fallback yang tersedia disebut di dalam task-nya.

## Urutan Tugas dan Alasannya

`baca-alur` (lib + test) → `toolbar-baca` (235) → `panel-samping` (462) → hook shell (546 bagian logika) → JSX shell (bagian tampilan) → sapuan akhir.

Task 1 lebih dulu karena Task 2 dan Task 4 mengimpor darinya, dan ia sendiri belum mengubah perilaku apa pun. `toolbar-baca` berikutnya karena paling kecil dan memperkenalkan pola "JSX + state privat ikut komponennya". `panel-samping` kemudian karena ia satu-satunya yang punya jebakan unmount tab (Invarian 1 dan 2), dan tanda tangan prop-nya tidak berubah sehingga shell tidak ikut bergerak. Shell dipecah dua tahap karena 546 baris tidak bisa turun ke ≤ 200 dalam satu ronde yang bisa direview: Task 4 memindahkan state dan efek ke hook, Task 5 memindahkan JSX. Kalau digabung, diff-nya 546 baris berubah sekaligus dan reviewer tidak bisa membedakan transkripsi dari perubahan perilaku.

Setiap tugas adalah satu deliverable yang bisa diterima sendiri: reviewer bisa menyetujui Task 2 dan menolak Task 3 tanpa merusak Task 2.

---

## Task 1: Logika murni reader ke `src/lib/baca-alur.ts`

**Files:**
- Create: `src/lib/baca-alur.ts`
- Create: `tests/baca-alur.test.ts`
- Modify: `src/components/reader/reader-shell.tsx` (buang helper lokal, pakai lib)
- Modify: `src/components/reader/toolbar-baca.tsx` (buang `kirimLompat` lokal, pakai lib)
- Modify: `tests/ui-higienis.test.ts` (baseline ukuran reader)

**Interfaces:**
- Consumes: `ZOOM_BAKU`, `batasiZoom` dari `@/lib/baca` ([src/lib/baca.ts:11,41-46](../../../src/lib/baca.ts#L41)); `hitungPersentase` dari `@/lib/format` [src/lib/format.ts:90](../../../src/lib/format.ts#L90); tipe `BookmarkVe`, `CatatanVe` dari `@/db/queries`.
- Produces (semua diekspor dari `@/lib/baca-alur`, dipakai Task 2 dan Task 4/5):
  - `type StatusProgres = "diam" | "menyimpan" | "tersimpan" | "gagal"`
  - `type Titik = { x: number; y: number }`
  - `type AksiTombolBaca = { jenis: "halaman"; tujuan: number } | null`
  - `type PreferensiBacaTersimpan = { zoom: number; sepia: boolean; rusak: boolean }`
  - `urutBookmark(daftar: BookmarkVe[]): BookmarkVe[]`
  - `urutCatatan(daftar: CatatanVe[]): CatatanVe[]`
  - `batasiHalaman(nilai: number, batas: number): number`
  - `AMBANG_GESER_X_PX: number` (64), `MAKS_LARI_GESER_Y_PX: number` (90)
  - `arahGeser(awal: Titik | null, akhir: Titik | null): 1 | -1 | null`
  - `aksiTombolBaca(kunci: string, halaman: number, total: number): AksiTombolBaca`
  - `tujuanLompatBaca(teks: string, total: number): number | null`
  - `bacaPreferensiBaca(mentah: string | null): PreferensiBacaTersimpan`
  - `tulisPreferensiBaca(p: { zoom: number; sepia: boolean }): string`
  - `teksPillProgres(status: StatusProgres, halamanTersimpan: number, total: number): string`

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/baca-alur.test.ts` (LF). Fixture memakai `satisfies BookmarkVe` dan `satisfies CatatanVe` supaya TypeScript menolak kalau bentuknya menyimpang dari skema.

```ts
import assert from "node:assert/strict"
import { test } from "node:test"
import type { BookmarkVe, CatatanVe } from "../src/db/queries"
import {
  AMBANG_GESER_X_PX,
  MAKS_LARI_GESER_Y_PX,
  aksiTombolBaca,
  arahGeser,
  bacaPreferensiBaca,
  batasiHalaman,
  teksPillProgres,
  tujuanLompatBaca,
  tulisPreferensiBaca,
  urutBookmark,
  urutCatatan,
} from "../src/lib/baca-alur"

const KITAB = "6f0f6f9c-3f5e-4c1a-9b7a-2d5c8e1a4b77"

function bookmark(halaman: number, id = `b${halaman}`) {
  return {
    id,
    userId: "u1",
    kitabId: KITAB,
    halaman,
    label: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
  } satisfies BookmarkVe
}

function catatan(halaman: number, id = `c${halaman}`) {
  const waktu = new Date("2026-01-01T00:00:00Z")
  return {
    id,
    userId: "u1",
    kitabId: KITAB,
    halaman,
    isi: "isi",
    createdAt: waktu,
    updatedAt: waktu,
  } satisfies CatatanVe
}

/* ------------------------------ daftar dan batas ------------------------------ */

test("bookmark diurutkan dari halaman terdepan tanpa mengubah masukan", () => {
  const awal = [bookmark(40), bookmark(3), bookmark(12)]
  assert.deepEqual(
    urutBookmark(awal).map((b) => b.halaman),
    [3, 12, 40],
  )
  assert.deepEqual(
    awal.map((b) => b.halaman),
    [40, 3, 12],
    "Daftar asal tidak boleh diurutkan di tempat.",
  )
})

test("catatan terbaru ada di depan", () => {
  assert.deepEqual(
    urutCatatan([catatan(2), catatan(77), catatan(30)]).map((c) => c.halaman),
    [77, 30, 2],
  )
})

test("nomor halaman jatuh ke rentang 1 sampai batas", () => {
  assert.equal(batasiHalaman(0, 100), 1)
  assert.equal(batasiHalaman(-7, 100), 1)
  assert.equal(batasiHalaman(480, 100), 100)
  assert.equal(batasiHalaman(12.6, 100), 13, "Pembulatan terdekat, bukan ke bawah.")
})

/* -------------------------------- geseran sentuh -------------------------------- */

test("geseran lebih pendek dari ambang diabaikan", () => {
  assert.equal(arahGeser({ x: 100, y: 100 }, { x: 100 + AMBANG_GESER_X_PX - 1, y: 100 }), null)
})

test("geseran persis di ambang dihitung, ke kiri maju satu halaman", () => {
  assert.equal(arahGeser({ x: 100, y: 100 }, { x: 100 - AMBANG_GESER_X_PX, y: 100 }), 1)
  assert.equal(arahGeser({ x: 100, y: 100 }, { x: 100 + AMBANG_GESER_X_PX, y: 100 }), -1)
})

test("geseran yang melewati batas vertikal dianggap scroll, bukan pindah halaman", () => {
  assert.equal(
    arahGeser({ x: 100, y: 100 }, { x: -100, y: 100 + MAKS_LARI_GESER_Y_PX + 1 }),
    null,
  )
  assert.equal(
    arahGeser({ x: 100, y: 100 }, { x: -100, y: 100 + MAKS_LARI_GESER_Y_PX }),
    1,
    "Pas di batas masih dihitung geseran.",
  )
})

test("sentuhan tanpa titik awal atau akhir tidak berpindah halaman", () => {
  assert.equal(arahGeser(null, { x: 0, y: 0 }), null)
  assert.equal(arahGeser({ x: 0, y: 0 }, null), null)
})

/* --------------------------------- keyboard --------------------------------- */

test("panah, Home, dan End memberi tujuan mentah tanpa membatasi", () => {
  assert.deepEqual(aksiTombolBaca("ArrowRight", 4, 10), { jenis: "halaman", tujuan: 5 })
  assert.deepEqual(aksiTombolBaca("ArrowLeft", 4, 10), { jenis: "halaman", tujuan: 3 })
  assert.deepEqual(aksiTombolBaca("Home", 4, 10), { jenis: "halaman", tujuan: 1 })
  assert.deepEqual(aksiTombolBaca("End", 4, 10), { jenis: "halaman", tujuan: 10 })
  assert.deepEqual(
    aksiTombolBaca("ArrowRight", 10, 10),
    { jenis: "halaman", tujuan: 11 },
    "Pemanggil yang membatasi, persis seperti `pindah` hari ini.",
  )
})

test("Escape dan tombol lain bukan navigasi halaman", () => {
  assert.equal(aksiTombolBaca("Escape", 4, 10), null)
  assert.equal(aksiTombolBaca("a", 4, 10), null)
})

/* ------------------------------- lompat halaman ------------------------------- */

test("nomor valid dilompat, teks kosong dan bukan angka ditolak", () => {
  assert.equal(tujuanLompatBaca("42", 100), 42)
  assert.equal(tujuanLompatBaca("", 100), null)
  assert.equal(tujuanLompatBaca("abc", 100), null)
  assert.equal(tujuanLompatBaca("999", 100), 100)
  assert.equal(tujuanLompatBaca("0", 100), 1)
})

/* ------------------------------ preferensi baca ------------------------------ */

test("tanpa simpanan, preferensi memakai bawaan dan tidak rusak", () => {
  assert.deepEqual(bacaPreferensiBaca(null), { zoom: 100, sepia: false, rusak: false })
})

test("simpanan lengkap dipulihkan apa adanya", () => {
  assert.deepEqual(bacaPreferensiBaca('{"zoom":150,"sepia":true}'), {
    zoom: 150,
    sepia: true,
    rusak: false,
  })
})

test("zoom tersimpan dipaksa masuk rentang, tipe lain jatuh ke bawaan", () => {
  assert.equal(bacaPreferensiBaca('{"zoom":900}').zoom, 250)
  assert.equal(bacaPreferensiBaca('{"zoom":"150"}').zoom, 100)
  assert.equal(bacaPreferensiBaca('{"zoom":null}').zoom, 100)
  assert.equal(bacaPreferensiBaca('{"sepia":"ya"}').sepia, false)
})

test("JSON rusak ditandai supaya kuncinya dibuang, bukan dibiarkan membekas", () => {
  assert.deepEqual(bacaPreferensiBaca("bukan json"), { zoom: 100, sepia: false, rusak: true })
  assert.deepEqual(bacaPreferensiBaca("null"), { zoom: 100, sepia: false, rusak: true })
})

test("preferensi ditulis dengan bentuk yang sama seperti hari ini", () => {
  assert.equal(tulisPreferensiBaca({ zoom: 110, sepia: true }), '{"zoom":110,"sepia":true}')
})

/* --------------------------------- pil progres --------------------------------- */

test("pil progres punya satu kalimat per status", () => {
  assert.equal(teksPillProgres("menyimpan", 41, 160), "Menyimpan progres…")
  assert.equal(teksPillProgres("gagal", 41, 160), "Progres belum tersimpan")
  assert.equal(teksPillProgres("tersimpan", 41, 160), "Progres di halaman 41 · 26%")
  assert.equal(teksPillProgres("diam", 41, 160), "Progres di halaman 41 · 26%")
})
```

- [ ] **Step 2: Jalankan test dan lihat ia gagal karena modulnya belum ada**

```bash
node --import tsx --experimental-test-module-mocks --test tests/baca-alur.test.ts; echo "exit=$?"
```

Expected: `Cannot find module ... src/lib/baca-alur`, `exit` bukan 0. Kalau ada test yang lolos sekarang, ia menguji perilaku yang sudah ada; perbaiki testnya, bukan kodenya.

- [ ] **Step 3: Tulis `src/lib/baca-alur.ts`**

```ts
/**
 * Keputusan murni reader: urutan daftar, batas halaman, arah geseran, tombol
 * navigasi, lompat halaman, preferensi tersimpan, dan kalimat pil progres.
 * Tidak ada React dan tidak ada DOM di sini, jadi semuanya bisa diuji tanpa
 * perender. State dan efeknya tetap di komponen.
 */

import { ZOOM_BAKU, batasiZoom } from "@/lib/baca"
import { hitungPersentase } from "@/lib/format"
import type { BookmarkVe, CatatanVe } from "@/db/queries"

/** Status kirim progres baca di pil header reader. */
export type StatusProgres = "diam" | "menyimpan" | "tersimpan" | "gagal"

/** Titik sentuh pada layar, tanpa membungkus Touch. */
export type Titik = { x: number; y: number }

/** Tujuan mentah dari tombol navigasi; yang membatasi adalah `pindah`, seperti hari ini. */
export type AksiTombolBaca = { jenis: "halaman"; tujuan: number } | null

/** Preferensi baca di localStorage; `rusak` menandai JSON yang tidak bisa dibaca. */
export type PreferensiBacaTersimpan = { zoom: number; sepia: boolean; rusak: boolean }

/** Bookmark dibaca dari halaman paling depan. */
export function urutBookmark(daftar: BookmarkVe[]) {
  return [...daftar].sort((a, b) => a.halaman - b.halaman)
}

/** Catatan terbaru lebih dulu, mengikuti halaman terakhir yang ditulis. */
export function urutCatatan(daftar: CatatanVe[]) {
  return [...daftar].sort((a, b) => b.halaman - a.halaman)
}

/** Nomor halaman jatuh ke rentang 1..batas, dibulatkan ke terdekat. */
export function batasiHalaman(nilai: number, batas: number) {
  return Math.min(batas, Math.max(1, Math.round(nilai)))
}

/** Jarak horizontal minimum supaya sentuhan biasa tidak berpindah halaman. */
export const AMBANG_GESER_X_PX = 64

/** Lari vertikal maksimum; lebih dari ini pengguna sedang menggulir, bukan menggeser. */
export const MAKS_LARI_GESER_Y_PX = 90

/** Arah halaman dari dua titik sentuh; null berarti geseran diabaikan. */
export function arahGeser(awal: Titik | null, akhir: Titik | null): 1 | -1 | null {
  if (!awal || !akhir) return null
  const geserX = akhir.x - awal.x
  const geserY = akhir.y - awal.y
  if (Math.abs(geserX) < AMBANG_GESER_X_PX || Math.abs(geserY) > MAKS_LARI_GESER_Y_PX) return null
  return geserX < 0 ? 1 : -1
}

export function aksiTombolBaca(kunci: string, halaman: number, total: number): AksiTombolBaca {
  if (kunci === "ArrowRight") return { jenis: "halaman", tujuan: halaman + 1 }
  if (kunci === "ArrowLeft") return { jenis: "halaman", tujuan: halaman - 1 }
  if (kunci === "Home") return { jenis: "halaman", tujuan: 1 }
  if (kunci === "End") return { jenis: "halaman", tujuan: total }
  return null
}

/** Nomor dari kolom lompat halaman; null berarti teksnya tidak dipakai. */
export function tujuanLompatBaca(teks: string, total: number): number | null {
  const tujuan = Number.parseInt(teks, 10)
  if (Number.isNaN(tujuan)) return null
  return batasiHalaman(tujuan, total)
}

export function bacaPreferensiBaca(mentah: string | null): PreferensiBacaTersimpan {
  const bawaan = { zoom: ZOOM_BAKU, sepia: false }
  if (!mentah) return { ...bawaan, rusak: false }
  try {
    const data = JSON.parse(mentah) as { zoom?: unknown; sepia?: unknown }
    return {
      zoom: typeof data.zoom === "number" ? batasiZoom(data.zoom) : ZOOM_BAKU,
      sepia: typeof data.sepia === "boolean" ? data.sepia : false,
      rusak: false,
    }
  } catch {
    return { ...bawaan, rusak: true }
  }
}

export function tulisPreferensiBaca(p: { zoom: number; sepia: boolean }) {
  return JSON.stringify({ zoom: p.zoom, sepia: p.sepia })
}

/** Satu kalimat pil progres di header; persen ikut dihitung di sini. */
export function teksPillProgres(
  status: StatusProgres,
  halamanTersimpan: number,
  total: number,
) {
  if (status === "menyimpan") return "Menyimpan progres…"
  if (status === "gagal") return "Progres belum tersimpan"
  return `Progres di halaman ${halamanTersimpan} · ${hitungPersentase(halamanTersimpan, total)}%`
}
```

`tujuanLompatBaca` memakai `batasiHalaman` dan itu setara dengan `Math.min/Math.max` inline di [:109](../../../src/components/reader/toolbar-baca.tsx#L109): `parseInt` sudah menghasilkan bilangan bulat, jadi `Math.round` tidak mengubah apa pun.

- [ ] **Step 4: Normalisasi baris akhir lalu jalankan test**

```bash
node -e "const fs=require('fs'),p='src/lib/baca-alur.ts';const s=fs.readFileSync(p,'utf8');fs.writeFileSync(p,s.replace(/\r\n/g,'\n').replace(/\n/g,'\r\n'))"
node --import tsx --experimental-test-module-mocks --test tests/baca-alur.test.ts; echo "exit=$?"
```

Expected: semua test baru lolos, `exit=0`. Kalau gagal pada angka persen atau urutan, yang salah adalah salinan fungsinya, bukan testnya.

- [ ] **Step 5: Pakai lib di `reader-shell.tsx`**

Hapus helper modul [:40-52](../../../src/components/reader/reader-shell.tsx#L40) (`StatusProgres`, `urutBookmark`, `urutCatatan`, `batasiHalaman`) dan ganti blok impornya. `batasiZoom` dan `hitungPersentase` tidak dipakai lagi di shell (sudah terserap lib); `inisialNama` dan `langkahZoom`/`ZOOM_BAKU` tetap. Handler lama masih memanggil `urutBookmark` dan `urutCatatan`, jadi keduanya diimpor sampai Task 4 memindahkan handler:

```ts
import { hitungPersentase, inisialNama } from "@/lib/format"
// diganti menjadi:
import { inisialNama } from "@/lib/format"

import {
  JEDA_SIMPAN_PROGRES_MS,
  KUNCI_PREFERENSI_BACA,
  ZOOM_BAKU,
  batasiZoom,
  langkahZoom,
} from "@/lib/baca"
// diganti menjadi:
import {
  JEDA_SIMPAN_PROGRES_MS,
  KUNCI_PREFERENSI_BACA,
  ZOOM_BAKU,
  langkahZoom,
} from "@/lib/baca"
import {
  aksiTombolBaca,
  arahGeser,
  bacaPreferensiBaca,
  batasiHalaman,
  teksPillProgres,
  tulisPreferensiBaca,
  urutBookmark,
  urutCatatan,
  type StatusProgres,
} from "@/lib/baca-alur"
```

Lalu empat blok ditulis ulang menjadi pemanggilan lib; cabang lain tidak boleh ikut berubah:

```tsx
  /* Preferensi zoom dan Sepia Malam dipulihkan dari localStorage (Bab 6.C). */
  useEffect(() => {
    const hasil = bacaPreferensiBaca(localStorage.getItem(KUNCI_PREFERENSI_BACA))
    if (hasil.rusak) localStorage.removeItem(KUNCI_PREFERENSI_BACA)
    setZoom(hasil.zoom)
    setSepia(hasil.sepia)
  }, [])

  useEffect(() => {
    localStorage.setItem(KUNCI_PREFERENSI_BACA, tulisPreferensiBaca({ zoom, sepia }))
  }, [zoom, sepia])
```

`setZoom`/`setSepia` yang dulu bersyarat kini selalu dipanggil. Itu setara: nilai bawaan state sama dengan nilai bawaan `bacaPreferensiBaca`, dan `useState` tidak me-render ulang untuk nilai yang identik.

```tsx
  useEffect(() => {
    function padaTombol(e: KeyboardEvent) {
      const sasaran = e.target as HTMLElement | null
      if (sasaran?.closest("input, textarea, select, [contenteditable='true']")) return
      if (e.key === "Escape") {
        if (panel) setPanel(null)
        return
      }
      const aksi = aksiTombolBaca(e.key, halaman, total)
      if (!aksi) return
      e.preventDefault()
      pindah(aksi.tujuan)
    }
    window.addEventListener("keydown", padaTombol)
    return () => window.removeEventListener("keydown", padaTombol)
  }, [halaman, total, panel, pindah])
```

```tsx
  function padaSentuhanAkhir(e: TouchEvent) {
    const awal = sentuhan.current
    sentuhan.current = null
    const titik = e.changedTouches[0]
    const arah = arahGeser(awal, titik ? { x: titik.clientX, y: titik.clientY } : null)
    if (arah === null) return
    pindah(arah === 1 ? halaman + 1 : halaman - 1)
  }
```

Dan isi pil progres [:431-435](../../../src/components/reader/reader-shell.tsx#L431) menjadi satu panggilan (JSX header baru pindah di Task 5):

```tsx
                {teksPillProgres(statusProgres, halamanTersimpan, total)}
```

- [ ] **Step 6: Pakai lib di `toolbar-baca.tsx`**

Tambahkan `import { tujuanLompatBaca } from "@/lib/baca-alur"` dan ganti isi `kirimLompat` [:102-110](../../../src/components/reader/toolbar-baca.tsx#L102):

```tsx
  function kirimLompat(berkas: React.FormEvent) {
    berkas.preventDefault()
    const tujuan = tujuanLompatBaca(teksLompat, totalHalaman)
    if (tujuan === null) {
      setTeksLompat(String(halaman))
      return
    }
    onLompat(tujuan)
  }
```

`tujuanLompatBaca` tidak menerima `halaman` karena angka itu hanya dipakai untuk mereset input, dan reset tetap di komponen.

- [ ] **Step 7: Perbarui baseline ukuran lalu gerbang penuh**

```bash
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

Expected: test ukuran gagal dengan angka reader baru di diff-nya. Salin angka itu apa adanya ke `daftarDasar` untuk `src/components/reader/reader-shell.tsx` dan `src/components/reader/toolbar-baca.tsx`. `panel-samping.tsx` tidak bergerak.

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npm run lint; echo "lint exit=$?"
npm test; echo "test exit=$?"
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

Expected: keempatnya `exit=0`. Jumlah test naik dari 261; laporkan angka sebenarnya.

- [ ] **Step 8: Bukti gigi (mutation check)**

Untuk tiap mutasi di bawah: jalankan `node --import tsx --experimental-test-module-mocks --test tests/baca-alur.test.ts`, catat test mana yang gagal, kembalikan, lalu pastikan suite hijau lagi.

| Mutasi sementara | Expected |
|---|---|
| `Math.abs(geserX) < AMBANG_GESER_X_PX` menjadi `<=` | tepat satu test gagal: "geseran persis di ambang dihitung, ke kiri maju satu halaman" |
| `Math.round` dihapus dari `batasiHalaman` | "nomor halaman jatuh ke rentang 1 sampai batas" gagal |
| `hitungPersentase(halamanTersimpan, total)` menjadi `hitungPersentase(halamanTersimpan, total + 1)` | "pil progres punya satu kalimat per status" gagal. Fixture memakai `(41, 160)` justru supaya mutasi ini kelihatan: `round(41/160*100)` = 26 sedangkan `round(41/161*100)` = 25. Dengan `(40, 160)` mutasinya tidak mematikan apa pun karena 25 persen di kedua penyebut. |
| `rusak: false` pada cabang `!mentah` menjadi `rusak: true` | "tanpa simpanan, preferensi memakai bawaan dan tidak rusak" gagal |

Catat keempat hasil di laporan. Jangan tinggalkan berkas dalam keadaan termutasi.

---

## Task 2: Pecah `toolbar-baca.tsx`

**Files:**
- Create: `src/components/reader/tombol-toolbar-baca.tsx`
- Create: `src/components/reader/lompat-halaman-baca.tsx`
- Modify: `src/components/reader/toolbar-baca.tsx`
- Modify: `tests/ui-higienis.test.ts` (hapus entri `toolbar-baca.tsx` dari `daftarDasar` ukuran)

**Interfaces:**
- Consumes: `tujuanLompatBaca` dari `@/lib/baca-alur` (Task 1); ui `Tooltip`, `TooltipContent`, `TooltipTrigger`, `Button`, `Separator`; `ZOOM_BAKU`, `ZOOM_LANGKAH` dari `@/lib/baca`; `cn`.
- Produces: `TombolToolbar({ label, aktif, tertekan, onClick, children })` dan `LompatHalamanBaca({ halaman, totalHalaman, onLompat })`. `ToolbarBaca` tetap mengekspor `type PanelBaca` dan tanda tangan prop-nya tidak berubah, sehingga [shell:507-521](../../../src/components/reader/reader-shell.tsx#L507) tidak tersentuh.

- [ ] **Step 1: Buat `tombol-toolbar-baca.tsx`**

Salin [toolbar-baca.tsx:26-63](../../../src/components/reader/toolbar-baca.tsx#L26) apa adanya, hanya tambah `export`:

```tsx
"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/** Tombol ikon reader dengan tooltip; `aktif` memberi warna emas, `tertekan` sekadar tanda. */
export function TombolToolbar({
  label,
  aktif,
  tertekan,
  onClick,
  children,
}: {
  label: string
  aktif?: boolean
  tertekan?: boolean
  onClick: () => void
  children: ReactNode
}) {
  /* body [:39-62] dipindah utuh: Tooltip>TooltipTrigger asChild>Button, aria-label,
     aria-pressed, className cn(...) dan TooltipContent side="top" border-white/10 bg-popover */
}
```

- [ ] **Step 2: Buat `lompat-halaman-baca.tsx`**

Salin [toolbar-baca.tsx:96-110](../../../src/components/reader/toolbar-baca.tsx#L96) (state `teksLompat`, efek sinkronisasi, `kirimLompat`) dan [:122-137](../../../src/components/reader/toolbar-baca.tsx#L122) (`<form>` beserta `label.sr-only`, `input#lompat-halaman`, `/ {totalHalaman}`) apa adanya. State ini memang privat bagi form (Invarian 11), jadi boleh ikut pindah:

```tsx
"use client"

import { useEffect, useState } from "react"
import { tujuanLompatBaca } from "@/lib/baca-alur"

/** Kolom nomor halaman: teks bebas di layar, tujuan terbates saat dikirim. */
export function LompatHalamanBaca({
  halaman,
  totalHalaman,
  onLompat,
}: {
  halaman: number
  totalHalaman: number
  onLompat: (halaman: number) => void
}) {
  /* [:96-110] dipindah utuh, termasuk `berkas: React.FormEvent` yang tetap
     memakai namespace React global seperti di berkas asalnya */
  return (
    /* [:122-137] dipindah utuh: id, className, inputMode, onChange, onBlur */
  )
}
```

- [ ] **Step 3: Rongangkan `toolbar-baca.tsx`**

Tempat `<form>` diganti satu baris panggilan, tempat definisi `TombolToolbar` dihapus dan diimpor:

```tsx
        <LompatHalamanBaca halaman={halaman} totalHalaman={totalHalaman} onLompat={onLompat} />
```

Impor baru: `TombolToolbar` dari `@/components/reader/tombol-toolbar-baca`, `LompatHalamanBaca` dari `@/components/reader/lompat-halaman-baca`. Hapus dari berkas ini: `useEffect`, `useState` (impor `react` tinggal `type ReactNode` bila masih dipakai; kalau tidak, hapus barisnya), definisi `TombolToolbar`, `teksLompat`, dan `kirimLompat`. `Tooltip*` masih diimpor karena tooltip reset zoom [:157-174](../../../src/components/reader/toolbar-baca.tsx#L157) memang tinggal di sini. Sisanya (dua `Separator`, grup zoom, sepia, bookmark, catatan, panel) tidak disentuh.

- [ ] **Step 4: Normalisasi baris akhir, ukur, gerbang**

```bash
node -e "const fs=require('fs');for(const p of ['src/components/reader/tombol-toolbar-baca.tsx','src/components/reader/lompat-halaman-baca.tsx']){const s=fs.readFileSync(p,'utf8');fs.writeFileSync(p,s.replace(/\r\n/g,'\n').replace(/\n/g,'\r\n'))}"
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){console.log(f.split('/').pop(), fs.readFileSync(f,'utf8').split('\n').length)}" src/components/reader/toolbar-baca.tsx src/components/reader/tombol-toolbar-baca.tsx src/components/reader/lompat-halaman-baca.tsx
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

Expected: `toolbar-baca.tsx` ≤ 200, sehingga ratchet gagal karena entri itu tidak muncul lagi; hapus baris `"src/components/reader/toolbar-baca.tsx": ...,` dari `daftarDasar` lalu jalankan sampai `ratchet exit=0`. Kalau `toolbar-baca.tsx` masih di atas 200, jatuhannya: keluarkan grup zoom [:151-177](../../../src/components/reader/toolbar-baca.tsx#L151) ke `grup-zoom-baca.tsx` dengan prop `zoom`, `onZoom`, `onResetZoom` (murni JSX, tidak ada state).

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npm run lint; echo "lint exit=$?"
npm test; echo "test exit=$?"
```

Expected: `exit=0`. Tidak ada test render baru yang bisa ditambahkan (Aturan teknis 10); laporkan itu apa adanya.

---

## Task 3: Pecah `panel-samping.tsx`

**Files:**
- Create: `src/components/reader/chip-halaman.tsx`
- Create: `src/components/reader/dialog-konfirmasi-baca.tsx`
- Create: `src/components/reader/papan-bookmark.tsx`
- Create: `src/components/reader/papan-catatan.tsx`
- Modify: `src/components/reader/panel-samping.tsx`
- Modify: `tests/ui-higienis.test.ts` (hapus entri `panel-samping.tsx` dari `daftarDasar` ukuran)

**Interfaces:**
- Consumes: `ChipHalaman`, `Konfirmasi`, `DialogKonfirmasiBaca`, `PapanBookmark`, `PapanCatatan`; tipe `BookmarkVe`, `CatatanVe`, `KitabVe`; `MAKS_ISI_CATATAN`, `skemaIsiCatatan`, `skemaLabelBookmark` dari `@/lib/baca`; `ProgresBar` dari `@/components/site/primitives`; `hitungPersentase`, `waktuRelatif`, `formatTanggalSingkat` dari `@/lib/format`.
- Produces: `PanelSamping` dengan tanda tangan prop **identik** dengan hari ini ([panel-samping.tsx:75-109](../../../src/components/reader/panel-samping.tsx#L75)); shell tidak berubah di task ini.

- [ ] **Step 1: Buat `chip-halaman.tsx`**

Salin [:49-73](../../../src/components/reader/panel-samping.tsx#L49) apa adanya dengan ekspor baru:

```tsx
"use client"

import { cn } from "@/lib/utils"

/** Nomor halaman yang bisa diklik; dipakai daftar bookmark dan daftar catatan. */
export function ChipHalaman({
  nomor,
  aktif,
  onClick,
}: {
  nomor: number
  aktif?: boolean
  onClick: () => void
}) {
  /* body [:58-72] utuh, termasuk aria-label `Pergi ke halaman ${nomor}` */
}
```

- [ ] **Step 2: Buat `dialog-konfirmasi-baca.tsx`**

Salin [:43-47](../../../src/components/reader/panel-samping.tsx#L43) (tipe `Konfirmasi`) dan [:437-458](../../../src/components/reader/panel-samping.tsx#L437) (Dialog) apa adanya:

```tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type Konfirmasi = {
  judul: string
  penjelasan: string
  lakukan: () => void
} | null

/** Satu dialog hapus untuk kedua tab panel; pemanggil yang menyusun judul dan penjelasannya. */
export function DialogKonfirmasiBaca({
  konfirmasi,
  onTutup,
}: {
  konfirmasi: Konfirmasi
  onTutup: () => void
}) {
  return (
    <Dialog open={konfirmasi !== null} onOpenChange={(buka) => !buka && onTutup()}>
      {/* DialogContent [:438-457] utuh; `setKonfirmasi(null)` → `onTutup()`;
          tombol "Ya, hapus" tetap memanggil konfirmasi?.lakukan() lalu onTutup() */}
    </Dialog>
  )
}
```

- [ ] **Step 3: Buat `papan-bookmark.tsx`**

Salin [:199-216](../../../src/components/reader/panel-samping.tsx#L199) (tombol "Tandai halaman ini") dan [:218-304](../../../src/components/reader/panel-samping.tsx#L218) (wadah scroll, empty state, baris bookmark dengan input label inline) apa adanya. Keadaan suntingan **tidak** ikut pindah (Invarian 1), jadi nilainya dioper:

```tsx
"use client"

import { Bookmark, Check, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChipHalaman } from "@/components/reader/chip-halaman"
import type { Konfirmasi } from "@/components/reader/dialog-konfirmasi-baca"
import type { BookmarkVe } from "@/db/queries"

/** Tab bookmark: tandai halaman ini, daftar penanda, dan label yang bisa diubah di tempat. */
export function PapanBookmark({
  bookmark,
  halaman,
  bolehSimpan,
  judulKitab,
  labelDiusulkan,
  onLabelDiusulkan,
  onSimpanLabel,
  onLompat,
  onTandaiHalamanIni,
  onAjukanHapus,
  onHapusBookmark,
}: {
  bookmark: BookmarkVe[]
  halaman: number
  bolehSimpan: boolean
  judulKitab: string
  labelDiusulkan: { id: string; teks: string } | null
  onLabelDiusulkan: (nilai: { id: string; teks: string } | null) => void
  onSimpanLabel: (id: string) => void
  onLompat: (nomor: number) => void
  onTandaiHalamanIni: () => void
  onAjukanHapus: (k: NonNullable<Konfirmasi>) => void
  onHapusBookmark: (id: string) => void
}) {
  const bookmarkHalamanIni = bookmark.find((b) => b.halaman === halaman)
  return (
    /* [:199-304] utuh. Pemetaan yang berubah:
       setLabelDiusulkan(...) → onLabelDiusulkan(...)   [:245, :249, :279]
       simpanLabel(item.id) → onSimpanLabel(item.id)    [:248, :258]
       kitab.judulLatin → judulKitab                    [:292]
       setKonfirmasi({ judul, penjelasan, lakukan }) → onAjukanHapus({ judul, penjelasan, lakukan }),
         isi objeknya disalin kata demi kata            [:290-294]
       `input` tetap autoFocus, maxLength 80, Enter → onSimpanLabel, Escape → onLabelDiusulkan(null) */
  )
}
```

`bookmarkHalamanIni` dihitung ulang di papan (persis [:117](../../../src/components/reader/panel-samping.tsx#L117)) karena hanya blok ini yang memakainya; shell sudah punya perhitungan sendiri untuk toolbar dan keduanya memang `find` atas daftar yang sama.

- [ ] **Step 4: Buat `papan-catatan.tsx`**

Salin [:308-336](../../../src/components/reader/panel-samping.tsx#L308) (komposer: `label[htmlFor=catatan-baru]`, `Textarea#catatan-baru` dengan `ref={textareaRef}`, penghitung `{draft.length}/{MAKS_ISI_CATATAN}`, tombol "Simpan catatan") dan [:338-433](../../../src/components/reader/panel-samping.tsx#L338) (wadah scroll, empty state `Inbox`, baris catatan dengan sunting inline) apa adanya:

```tsx
"use client"

import { type RefObject } from "react"
import { Check, FilePenLine, Inbox, Pencil, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChipHalaman } from "@/components/reader/chip-halaman"
import { Textarea } from "@/components/ui/textarea"
import type { Konfirmasi } from "@/components/reader/dialog-konfirmasi-baca"
import type { CatatanVe } from "@/db/queries"
import { MAKS_ISI_CATATAN } from "@/lib/baca"
import { formatTanggalSingkat, waktuRelatif } from "@/lib/format"

/** Tab catatan: komposer untuk halaman aktif dan daftar catatan yang bisa disunting. */
export function PapanCatatan({
  catatan,
  halaman,
  bolehSimpan,
  draft,
  onDraft,
  textareaRef,
  onKirimCatatan,
  sedangSunting,
  onSedangSunting,
  teksSunting,
  onTeksSunting,
  onSimpanSuntingan,
  onLompat,
  onAjukanHapus,
  onHapusCatatan,
}: {
  catatan: CatatanVe[]
  halaman: number
  bolehSimpan: boolean
  draft: string
  onDraft: (nilai: string) => void
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onKirimCatatan: () => void
  sedangSunting: string | null
  onSedangSunting: (id: string | null) => void
  teksSunting: string
  onTeksSunting: (nilai: string) => void
  onSimpanSuntingan: (id: string) => void
  onLompat: (nomor: number) => void
  onAjukanHapus: (k: NonNullable<Konfirmasi>) => void
  onHapusCatatan: (id: string) => void
}) {
  return (
    /* [:308-433] utuh. Pemetaan yang berubah:
       setDraft(...) → onDraft(...)                                        [:320]
       kirimCatatan() → onKirimCatatan()                                   [:330]
       setSedangSunting(...) → onSedangSunting(...)                        [:373, :386]
       setTeksSunting(...) → onTeksSunting(...)                            [:387, :414]
       simpanSuntingan(item.id) → onSimpanSuntingan(item.id)               [:364]
       setKonfirmasi({...}) → onAjukanHapus({...}) isi objek utuh          [:398-402]
       placeholder, rows, maxLength, kelas min-h tetap seperti aslinya */
  )
}
```

Tipe `textareaRef` harus sama dengan yang dihasilkan `useRef<HTMLTextAreaElement>(null)` di panel; kalau `tsc` menolak `RefObject<HTMLTextAreaElement | null>`, pakai `MutableRefObject<HTMLTextAreaElement | null>` sesuai React 19 yang terpasang, jangan melonggarkan tipe dengan `any`.

- [ ] **Step 5: Rongangkan `panel-samping.tsx`**

Berkas induk menyimpan: tanda tangan prop yang tidak berubah, empat state suntingan + `konfirmasi`, `textareaRef`, efek fokus, tiga validator (`kirimCatatan`, `simpanSuntingan`, `simpanLabel`), kepala progres, `Tabs`, inset anonim, dua `TabsContent` yang memanggil papan, dan dialog.

```tsx
        <TabsContent value="bookmark" className="mt-3 min-h-0 space-y-2">
          <PapanBookmark
            bookmark={bookmark}
            halaman={halaman}
            bolehSimpan={bolehSimpan}
            judulKitab={kitab.judulLatin}
            labelDiusulkan={labelDiusulkan}
            onLabelDiusulkan={setLabelDiusulkan}
            onSimpanLabel={simpanLabel}
            onLompat={onLompat}
            onTandaiHalamanIni={onTandaiHalamanIni}
            onAjukanHapus={setKonfirmasi}
            onHapusBookmark={onHapusBookmark}
          />
        </TabsContent>

        <TabsContent value="catatan" className="mt-3 min-h-0 space-y-3">
          <PapanCatatan
            catatan={catatan}
            halaman={halaman}
            bolehSimpan={bolehSimpan}
            draft={draft}
            onDraft={setDraft}
            textareaRef={textareaRef}
            onKirimCatatan={kirimCatatan}
            sedangSunting={sedangSunting}
            onSedangSunting={setSedangSunting}
            teksSunting={teksSunting}
            onTeksSunting={setTeksSunting}
            onSimpanSuntingan={simpanSuntingan}
            onLompat={onLompat}
            onAjukanHapus={setKonfirmasi}
            onHapusCatatan={onHapusCatatan}
          />
        </TabsContent>
```

`onAjukanHapus={setKonfirmasi}` sah karena papan mengirim objek `Konfirmasi` utuh, jadi tidak ada state yang bocor sebagai setter bertipe salah. Dialog paling bawah diganti:

```tsx
      <DialogKonfirmasiBaca konfirmasi={konfirmasi} onTutup={() => setKonfirmasi(null)} />
```

Bersihkan impor yang jadi tidak terpakai di panel (`Bookmark`, `Check`, `Pencil`, `Trash2`, `X`, `Inbox`, `FilePenLine`, `Textarea`, `Dialog*`, `waktuRelatif`, `formatTanggalSingkat`, `MAKS_ISI_CATATAN`, `ChipHalaman` bila tak dipakai lagi di sini). Jangan tebak: biarkan `tsc` dan `lint` yang menunjuk, lalu hapus persis yang ditunjuk.

Kalau `panel-samping.tsx` masih di atas 200: keluarkan kepala progres [:156-165](../../../src/components/reader/panel-samping.tsx#L156) dan inset anonim [:183-196](../../../src/components/reader/panel-samping.tsx#L183) ke `kepala-panel-baca.tsx` dengan prop `judulKitab`, `halaman`, `totalHalaman`, `bolehSimpan` (murni JSX). Kalau `papan-catatan.tsx` yang kelebihan: keluarkan komposer [:308-336](../../../src/components/reader/panel-samping.tsx#L308) ke `komposer-catatan.tsx` dengan prop `draft`, `onDraft`, `textareaRef`, `onKirimCatatan`, `halaman`, `bolehSimpan`; state `draft` tetap di panel (Invarian 1).

- [ ] **Step 6: Normalisasi baris akhir, ukur, gerbang**

```bash
node -e "const fs=require('fs');for(const p of ['src/components/reader/chip-halaman.tsx','src/components/reader/dialog-konfirmasi-baca.tsx','src/components/reader/papan-bookmark.tsx','src/components/reader/papan-catatan.tsx']){const s=fs.readFileSync(p,'utf8');fs.writeFileSync(p,s.replace(/\r\n/g,'\n').replace(/\n/g,'\r\n'))}"
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){console.log(f.split('/').pop(), fs.readFileSync(f,'utf8').split('\n').length)}" src/components/reader/panel-samping.tsx src/components/reader/chip-halaman.tsx src/components/reader/dialog-konfirmasi-baca.tsx src/components/reader/papan-bookmark.tsx src/components/reader/papan-catatan.tsx
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

Expected: lima berkas ≤ 200 dan `panel-samping.tsx` ≤ 200; ratchet gagal karena entri panel hilang dari pemindaian, hapus entri itu, lalu `ratchet exit=0`.

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npm run lint; echo "lint exit=$?"
npm test; echo "test exit=$?"
git diff --stat -- src/app; echo "diff app exit=$?"
node -e "const s=require('fs').readFileSync('src/components/reader/panel-samping.tsx','utf8');console.log('useState', (s.match(/useState(?:<[^>]*>)?\(/g)||[]).length, 'useRef', (s.match(/useRef(?:<[^>]*>)?\(/g)||[]).length)"
```

Expected: `exit=0` semuanya; `git diff --stat -- src/app` kosong; panel masih punya **5 `useState`** (draft, sedangSunting, teksSunting, labelDiusulkan, konfirmasi) dan **1 `useRef`** (textareaRef). Angka itu adalah bukti state suntingan tidak turun ke anak.

---

## Task 4: State dan efek shell ke lima hook

**Files:**
- Create: `src/components/reader/use-preferensi-baca.ts`
- Create: `src/components/reader/use-navigasi-baca.ts`
- Create: `src/components/reader/use-progres-baca.ts`
- Create: `src/components/reader/use-bookmark-baca.ts`
- Create: `src/components/reader/use-catatan-baca.ts`
- Modify: `src/components/reader/reader-shell.tsx`
- Modify: `tests/ui-higienis.test.ts` (baseline ukuran shell menyusut)

**Interfaces:**
- Consumes: `@/lib/baca-alur` (Task 1), `@/lib/baca`, `@/actions/baca`, tipe `BookmarkVe`/`CatatanVe`, `PanelBaca` dari `@/components/reader/toolbar-baca`.
- Produces (dipakai Task 5 yang merangkai JSX):
  - `usePreferensiBaca(): { zoom, sepia, ubahZoom, aturZoomBaku, beralihSepia }` dengan `ubahZoom: (arah: 1 | -1) => void`
  - `useNavigasiBaca({ halamanAwal, total, panel, onTutupPanel }): { halaman, pindah }`
  - `useProgresBaca({ kitabId, halaman, masuk, halamanAwal }): { statusProgres, halamanTersimpan }`
  - `useBookmarkBaca({ kitabId, penggunaId, halaman, masuk, bookmarkAwal, onPilihPanel }): { bookmark, bookmarkHalamanIni, tandaiHalaman, gantiLabel, hapusBookmark }`
  - `useCatatanBaca({ kitabId, penggunaId, halaman, catatanAwal }): { catatan, tambahCatatan, ubahCatatan, hapusCatatan }`

- [ ] **Step 1: Buat `use-preferensi-baca.ts`**

State [:83-84](../../../src/components/reader/reader-shell.tsx#L83) (`zoom`, `sepia`), dua efek [:92-111](../../../src/components/reader/reader-shell.tsx#L92), dan `ubahZoom` [:181-183](../../../src/components/reader/reader-shell.tsx#L181) pindah apa adanya:

```ts
"use client"

import { useEffect, useState } from "react"
import { KUNCI_PREFERENSI_BACA, ZOOM_BAKU, langkahZoom } from "@/lib/baca"
import { bacaPreferensiBaca, tulisPreferensiBaca } from "@/lib/baca-alur"

/** Zoom dan Sepia Malam: dipulihkan dari localStorage, ditulis ulang tiap berubah. */
export function usePreferensiBaca() {
  const [zoom, setZoom] = useState(ZOOM_BAKU)
  const [sepia, setSepia] = useState(false)

  /* efek pulih [:93-104] dan efek simpan [:106-111] utuh, memakai bacaPreferensiBaca/
     tulisPreferensiBaca hasil Task 1 */

  return {
    zoom,
    sepia,
    ubahZoom: (arah: 1 | -1) => setZoom((sekarang) => langkahZoom(sekarang, arah)),
    aturZoomBaku: () => setZoom(ZOOM_BAKU),
    beralihSepia: () => setSepia((s) => !s),
  }
}
```

`onZoom={() => setZoom(ZOOM_BAKU)}` di toolbar [:517](../../../src/components/reader/reader-shell.tsx#L517) menjadi `onZoom={aturZoomBaku}` dan `onSepia={() => setSepia((s) => !s)}` menjadi `onSepia={beralihSepia}`. Kedua callback itu dibuat di render shell hari ini; memindah pembuatannya ke hook tidak mengubah perilaku (keduanya hanya memanggil setter).

- [ ] **Step 2: Buat `use-navigasi-baca.ts`**

State `halaman` [:78](../../../src/components/reader/reader-shell.tsx#L78), `pindah` [:145-153](../../../src/components/reader/reader-shell.tsx#L145), dan efek keyboard [:155-177](../../../src/components/reader/reader-shell.tsx#L155) pindah utuh:

```ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { aksiTombolBaca, batasiHalaman } from "@/lib/baca-alur"
import type { PanelBaca } from "@/components/reader/toolbar-baca"

/** Halaman aktif plus navigasi keyboard; Escape menutup panel lewat callback pemanggil. */
export function useNavigasiBaca({
  halamanAwal,
  total,
  panel,
  onTutupPanel,
}: {
  halamanAwal: number
  total: number
  panel: PanelBaca | null
  onTutupPanel: () => void
}) {
  const [halaman, setHalaman] = useState(() => batasiHalaman(halamanAwal, total))

  const pindah = useCallback(
    (tujuan: number) => {
      setHalaman((sekarang) => {
        const aman = Math.min(total, Math.max(1, Math.round(tujuan)))
        return aman === sekarang ? sekarang : aman
      })
    },
    [total],
  )

  useEffect(() => {
    function padaTombol(e: KeyboardEvent) {
      const sasaran = e.target as HTMLElement | null
      if (sasaran?.closest("input, textarea, select, [contenteditable='true']")) return
      if (e.key === "Escape") {
        if (panel) onTutupPanel()
        return
      }
      const aksi = aksiTombolBaca(e.key, halaman, total)
      if (!aksi) return
      e.preventDefault()
      pindah(aksi.tujuan)
    }
    window.addEventListener("keydown", padaTombol)
    return () => window.removeEventListener("keydown", padaTombol)
  }, [halaman, total, panel, pindah, onTutupPanel])

  return { halaman, pindah }
}
```

Satu-satunya perbedaan struktural dari aslinya: `setPanel(null)` diganti `onTutupPanel()` dan karena itu masuk ke daftar dependensi efek. Shell memanggilnya dengan `() => setPanel(null)`, jadi setiap render membuat closure baru dan listener keyboard dipasang ulang setiap render persis seperti hari ini (dep `panel` juga sudah berubah tiap panel berpindah). Kalau reviewer mempertanyakan `onTutupPanel` di deps, jawabannya: tanpa itu efek menutupi nilai lama, dan itu justru mengubah perilaku.

- [ ] **Step 3: Buat `use-progres-baca.ts`**

State `statusProgres` [:83](../../../src/components/reader/reader-shell.tsx#L83) dan `halamanTersimpan` [:84](../../../src/components/reader/reader-shell.tsx#L84) beserta efek [:121-137](../../../src/components/reader/reader-shell.tsx#L121) pindah utuh (Invarian 4 dan 6):

```ts
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { simpanProgresBacaAksi } from "@/actions/baca"
import { JEDA_SIMPAN_PROGRES_MS } from "@/lib/baca"
import type { StatusProgres } from "@/lib/baca-alur"

/** Progres baca dikirim dengan jeda 2 detik; status dan halaman tersimpan dipakai pil header. */
export function useProgresBaca({
  kitabId,
  halaman,
  masuk,
  halamanAwal,
}: {
  kitabId: string
  halaman: number
  masuk: boolean
  halamanAwal: number
}) {
  const [statusProgres, setStatusProgres] = useState<StatusProgres>("diam")
  const [halamanTersimpan, setHalamanTersimpan] = useState(halamanAwal)

  /* efek [:122-137] dipindah kata demi kata, termasuk clearTimeout dan toast.error */

  return { statusProgres, halamanTersimpan }
}
```

- [ ] **Step 4: Buat `use-bookmark-baca.ts`**

Handler [:179](../../../src/components/reader/reader-shell.tsx#L179), [:185-244](../../../src/components/reader/reader-shell.tsx#L185), [:318-356](../../../src/components/reader/reader-shell.tsx#L318) dan state `bookmark` [:87](../../../src/components/reader/reader-shell.tsx#L87) pindah utuh. Perbedaan mekanis: `kitab.id` jadi `kitabId`, `setTabPanel`+`setPanel` jadi satu `onPilihPanel` (Invarian 3), dan `useRouter` ikut ke sini karena hanya `tandaiHalaman` yang memakainya.

```ts
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  hapusBookmarkHalaman,
  hapusBookmarkId,
  tambahBookmark,
} from "@/actions/baca"
import type { BookmarkVe } from "@/db/queries"
import { urutBookmark } from "@/lib/baca-alur"
import type { PanelBaca } from "@/components/reader/toolbar-baca"

/**
 * Daftar bookmark satu kitab beserta mutasinya. Perubahan langsung tampil dan
 * dikembalikan kalau server menolak; keberhasilan menghapus membawa urungan yang
 * ikut tersimpan di server, bukan hanya di layar.
 */
export function useBookmarkBaca({
  kitabId,
  penggunaId,
  halaman,
  masuk,
  bookmarkAwal,
  onPilihPanel,
}: {
  kitabId: string
  penggunaId: string
  halaman: number
  masuk: boolean
  bookmarkAwal: BookmarkVe[]
  onPilihPanel: (tab: PanelBaca) => void
}) {
  const router = useRouter()
  const [bookmark, setBookmark] = useState(() => urutBookmark(bookmarkAwal))
  const bookmarkHalamanIni = bookmark.find((b) => b.halaman === halaman)

  /* tandaiHalaman [:185-230], pulihkanBookmark [:232-244], gantiLabel [:318-338],
     hapusBookmark [:340-356] dipindah kata demi kata. */

  return { bookmark, bookmarkHalamanIni, tandaiHalaman, gantiLabel, hapusBookmark }
}
```

Rincian yang tidak boleh "dirapikan":
- Guard `if (!masuk)` tetap `toast.info("Masuk untuk menyimpan bookmark", { description: ..., action: { label: "Masuk", onClick: () => router.push("/sign-in") } })`.
- Cabang hapus: buang optimistik lebih dulu, `hapusBookmarkHalaman({ kitabId, halaman })`; gagal maka item lama dimasukkan lagi dan `toast.error`. Berhasil maka toast "Bookmark halaman N dihapus" dengan aksi Urungkan → `pulihkanBookmark(yangAda)`.
- Cabang tambah: `tambahBookmark({ kitabId, halaman })`, susun `baru: BookmarkVe` dengan `id: hasil.id ?? ""`, `userId: penggunaId`, `createdAt: new Date()`, lalu `onPilihPanel("bookmark")`, lalu toast "Halaman N ditandai" dengan deskripsi muraja'ah.
- `pulihkanBookmark` memakai `label: item.label` dan `hasil.id ?? item.id`.
- `gantiLabel` tetap memakai `tambahBookmark` untuk menimpa label, kosong → `null`, dan **tanpa** `urutBookmark` pada `setBookmark` di jalur optimistik ([:322-324](../../../src/components/reader/reader-shell.tsx#L322)) maupun rollback ([:331-333](../../../src/components/reader/reader-shell.tsx#L331)) karena urutan tidak berubah.
- `hapusBookmark` (dari daftar) memakai `hapusBookmarkId(id)` dan urungan `pulihkanBookmark(tersimpan)`.

- [ ] **Step 5: Buat `use-catatan-baca.ts`**

[:88](../../../src/components/reader/reader-shell.tsx#L88), [:255-316](../../../src/components/reader/reader-shell.tsx#L255) pindah utuh:

```ts
"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  hapusCatatanId,
  tambahCatatan as tambahCatatanAksi,
  ubahCatatanIsi,
} from "@/actions/baca"
import type { CatatanVe } from "@/db/queries"
import { urutCatatan } from "@/lib/baca-alur"

/** Daftar catatan satu kitab; mutasinya optimistik dan membawa urungan. */
export function useCatatanBaca({
  kitabId,
  penggunaId,
  halaman,
  catatanAwal,
}: {
  kitabId: string
  penggunaId: string
  halaman: number
  catatanAwal: CatatanVe[]
}) {
  const [catatan, setCatatan] = useState(() => urutCatatan(catatanAwal))

  /* tambahCatatan [:255-273], ubahCatatan [:275-285], hapusCatatan [:287-303],
     pulihkanCatatan [:305-316] dipindah apa adanya. */

  return { catatan, tambahCatatan, ubahCatatan, hapusCatatan }
}
```

Nama fungsi internal tetap `tambahCatatan`; `tambahCatatanAksi` hanyalah alias impor untuk aksi server, sama seperti di shell hari ini. `ubahCatatan` tetap memetakan lewat `urutCatatan(...)` sehingga catatan yang diedit bisa ikut berpindah urutan, persis seperti aslinya.

- [ ] **Step 6: Rangkai ulang `reader-shell.tsx` tanpa JSX yang berubah**

Shell tinggal: props, `total`, state `panel`/`tabPanel`/`layarLebar`, `sesiTerbuka`, efek media, efek sesi, `bukaPanel`, panggilan lima hook, `panelBaca`, dan JSX yang isinya persis seperti sebelumnya. `useRouter` dihapus dari shell (sudah di hook bookmark), `sentuhan`/`padaSentuhanAkhir` tetap di shell sampai Task 5.

```tsx
  const [panel, setPanel] = useState<PanelBaca | null>(null)
  const [tabPanel, setTabPanel] = useState<PanelBaca>("bookmark")
  const { zoom, sepia, ubahZoom, aturZoomBaku, beralihSepia } = usePreferensiBaca()
  const { halaman, pindah } = useNavigasiBaca({
    halamanAwal,
    total,
    panel,
    onTutupPanel: () => setPanel(null),
  })
  const { statusProgres, halamanTersimpan } = useProgresBaca({
    kitabId: kitab.id,
    halaman,
    masuk,
    halamanAwal,
  })
  const { bookmark, bookmarkHalamanIni, tandaiHalaman, gantiLabel, hapusBookmark } =
    useBookmarkBaca({
      kitabId: kitab.id,
      penggunaId,
      halaman,
      masuk,
      bookmarkAwal,
      onPilihPanel: (tab) => {
        setTabPanel(tab)
        setPanel(tab)
      },
    })
  const { catatan, tambahCatatan, ubahCatatan, hapusCatatan } = useCatatanBaca({
    kitabId: kitab.id,
    penggunaId,
    halaman,
    catatanAwal,
  })
```

Prop `ToolbarBaca` disesuaikan ke nama baru: `onZoom={ubahZoom}` (tetap), `onResetZoom={aturZoomBaku}`, `onSepia={beralihSepia}`. Tidak ada perubahan JSX lain di task ini.

- [ ] **Step 7: Gerbang dan baseline baru**

```bash
node -e "const fs=require('fs');for(const p of ['src/components/reader/use-preferensi-baca.ts','src/components/reader/use-navigasi-baca.ts','src/components/reader/use-progres-baca.ts','src/components/reader/use-bookmark-baca.ts','src/components/reader/use-catatan-baca.ts']){const s=fs.readFileSync(p,'utf8');fs.writeFileSync(p,s.replace(/\r\n/g,'\n').replace(/\n/g,'\r\n'))}"
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){console.log(f.split('/').pop(), fs.readFileSync(f,'utf8').split('\n').length)}" src/components/reader/reader-shell.tsx src/components/reader/use-preferensi-baca.ts src/components/reader/use-navigasi-baca.ts src/components/reader/use-progres-baca.ts src/components/reader/use-bookmark-baca.ts src/components/reader/use-catatan-baca.ts
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

Expected: ratchet gagal dengan angka shell yang mengecil (±300); salin angka itu ke `daftarDasar`, `ratchet exit=0`. Kalau salah satu hook melewati 200, pecah hook itu dua (mis. `use-bookmark-baca.ts` menjadi daftar + mutasi) dan catat sebagai deviasi di laporan.

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npm run lint; echo "lint exit=$?"
npm test; echo "test exit=$?"
```

Expected: `exit=0`. `react-hooks/rules-of-hooks` akan menegur kalau nama fungsi hook tidak diawali `use` atau hook dipanggil bersyarat; kalau itu muncul, bentuknya yang salah, jangan rule-nya yang dibungkam (AGENTS: "Jangan menonaktifkan rule ESLint tanpa komentar alasan").

---

## Task 5: Pecah JSX `reader-shell.tsx`

**Files:**
- Create: `src/components/reader/kanvas-baca.tsx`
- Create: `src/components/reader/kop-baca.tsx`
- Create: `src/components/reader/saran-lanjut-baca.tsx`
- Create: `src/components/reader/wadah-panel-baca.tsx`
- Modify: `src/components/reader/reader-shell.tsx`
- Modify: `tests/ui-higienis.test.ts` (hapus entri `reader-shell.tsx` dari `daftarDasar` ukuran; ganti kunci `backdrop-blur` menjadi `kop-baca.tsx`)

**Interfaces:**
- Consumes: hook Task 4, `HalamanPdf`, `arahGeser`/`Titik`/`StatusProgres` dari `@/lib/baca-alur`, `inisialNama`, ui `Sheet*`, `Avatar`, `Button`, `Link`, ikon lucide.
- Produces: `KanvasBaca`, `KopBaca`, `SaranLanjutBaca`, `WadahPanelBaca`; `ReaderShell` dengan tanda tangan prop **identik** dengan hari ini.

- [ ] **Step 1: Buat `kanvas-baca.tsx`**

Salin wadah scroll [:487-505](../../../src/components/reader/reader-shell.tsx#L487), `sentuhan` [:89](../../../src/components/reader/reader-shell.tsx#L89), dan `padaSentuhanAkhir` hasil Task 1 [:358-368](../../../src/components/reader/reader-shell.tsx#L358) apa adanya. Ref sentuhan adalah keadaan privat bagi blok ini (Invarian 11), jadi boleh ikut pindah:

```tsx
"use client"

import { useRef, type TouchEvent } from "react"
import { HalamanPdf } from "@/components/reader/halaman-pdf"
import { arahGeser } from "@/lib/baca-alur"

/** Kanvas baca: wadah gulir, gestur geser kiri/kanan, dan halaman PDF yang dirender. */
export function KanvasBaca({
  url,
  slug,
  judul,
  halaman,
  zoom,
  sepia,
  onLompat,
}: {
  url: string | null
  slug: string
  judul: string
  halaman: number
  zoom: number
  sepia: boolean
  onLompat: (tujuan: number) => void
}) {
  /* useRef<{ x: number; y: number } | null>(null) + onTouchStart + padaSentuhanAkhir,
     geseran dipetakan: arah === 1 ? onLompat(halaman + 1) : onLompat(halaman - 1)
     div luar dan dalam [:487-505] utuh termasuk kelas dan children HalamanPdf */
}
```

Tidak ada prop `total` di sini: yang membatasi nomor halaman adalah `pindah` milik shell, sama seperti hari ini.

- [ ] **Step 2: Buat `kop-baca.tsx`**

Salin [:396-455](../../../src/components/reader/reader-shell.tsx#L396) apa adanya, termasuk `backdrop-blur-xl` (Aturan teknis 2):

```tsx
"use client"

import Link from "next/link"
import { AlertTriangle, ArrowLeft, CircleCheck, LoaderCircle, LogIn } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { KitabVe } from "@/db/queries"
import { inisialNama } from "@/lib/format"
import { teksPillProgres, type StatusProgres } from "@/lib/baca-alur"
import { cn } from "@/lib/utils"

/** Bilah atas reader: kembali ke detail, judul kitab, pil progres, identitas pembaca. */
export function KopBaca({
  kitab,
  masuk,
  namaPengguna,
  statusProgres,
  halamanTersimpan,
  total,
}: {
  kitab: KitabVe
  masuk: boolean
  namaPengguna: string | null
  statusProgres: StatusProgres
  halamanTersimpan: number
  total: number
}) {
  return (
    /* <header> [:396-455] utuh: Link Detail kitab + dua span sr-only/hidden, judul dan
       subjudul, pil status (ikon tiga cabang + teksPillProgres), Avatar atau tombol Masuk */
  )
}
```

`hitungPersentase` tidak diimpor di sini karena sudah terserap `teksPillProgres`. Kelas warna pil (peringatan/sukses/netral) dan `ring-*` disalin kata demi kata; keputusan visual anti-slop untuk permukaan blur bukan bagian task ini.

- [ ] **Step 3: Buat `saran-lanjut-baca.tsx`**

Salin [:457-485](../../../src/components/reader/reader-shell.tsx#L457) dan bawa state `saranLanjutDitutup` [:85](../../../src/components/reader/reader-shell.tsx#L85) ke dalam komponen ini (Invarian 11, hanya banner ini yang membacanya):

```tsx
"use client"

import { useState } from "react"
import { History } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Anjuran melanjutkan dari halaman terakhir; hanya untuk pembaca yang datang dari riwayat. */
export function SaranLanjutBaca({
  sumberAwal,
  halamanAwal,
  onMulaiDariAwal,
}: {
  sumberAwal: "riwayat" | "tautan"
  halamanAwal: number
  onMulaiDariAwal: () => void
}) {
  const [ditutup, setDitutup] = useState(false)
  if (sumberAwal !== "riwayat" || halamanAwal <= 2 || ditutup) return null
  return (
    /* [:458-484] utuh; "Mulai dari awal" memanggil onMulaiDariAwal() lalu setDitutup(true),
       "Tutup" hanya setDitutup(true) */
  )
}
```

Urutan kondisi harus sama seperti aslinya (`sumberAwal === "riwayat" && halamanAwal > 2 && !ditutup`), hanya dibalik menjadi guard return. `onMulaiDariAwal` dipanggil **lebih dulu**, lalu `setDitutup(true)`, sama seperti [:469-470](../../../src/components/reader/reader-shell.tsx#L469).

- [ ] **Step 4: Buat `wadah-panel-baca.tsx`**

Salin [:524-542](../../../src/components/reader/reader-shell.tsx#L524). Keduanya tetap bersyarat pada `panel`, supaya Sheet tidak pernah ter-mount saat panel tertutup:

```tsx
"use client"

import type { ReactNode } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

/** Panel samping menempel di layar lebar, menjadi Sheet dari kanan di layar kecil. */
export function WadahPanelBaca({
  terbuka,
  layarLebar,
  onTutup,
  children,
}: {
  terbuka: boolean
  layarLebar: boolean
  onTutup: () => void
  children: ReactNode
}) {
  if (!terbuka) return null
  return layarLebar ? (
    /* <aside className="hidden w-[22rem] ..."> [:525] utuh, isinya {children} */
  ) : (
    /* <Sheet open onOpenChange={(buka) => !buka && onTutup()}> [:531-541] utuh,
       termasuk SheetHeader sr-only dan SheetTitle "Bookmark dan catatan" */
  )
}
```

Tetap `<Sheet open>` tanpa nilai eksplisit, persis seperti aslinya; `className` `w-[min(24rem,94vw)]` dan `pt-14` tidak diubah.

- [ ] **Step 5: Rongangkan `reader-shell.tsx`**

JSX shell menjadi komposisi lima baris besar:

```tsx
  return (
    <div className="flex h-full min-h-0">
      <main className="relative flex min-w-0 flex-1 flex-col">
        <KopBaca
          kitab={kitab}
          masuk={masuk}
          namaPengguna={namaPengguna}
          statusProgres={statusProgres}
          halamanTersimpan={halamanTersimpan}
          total={total}
        />
        <SaranLanjutBaca
          sumberAwal={sumberAwal}
          halamanAwal={halamanAwal}
          onMulaiDariAwal={() => pindah(1)}
        />
        <KanvasBaca
          url={pdfBaca}
          slug={kitab.slug}
          judul={kitab.judulLatin}
          halaman={halaman}
          zoom={zoom}
          sepia={sepia}
          onLompat={pindah}
        />
        <ToolbarBaca
          halaman={halaman}
          totalHalaman={total}
          zoom={zoom}
          sepia={sepia}
          sudahBookmark={Boolean(bookmarkHalamanIni)}
          panelTerbuka={panel}
          bolehSimpan={masuk}
          onLompat={pindah}
          onZoom={ubahZoom}
          onResetZoom={aturZoomBaku}
          onSepia={beralihSepia}
          onBookmark={tandaiHalaman}
          onPanel={bukaPanel}
        />
      </main>

      <WadahPanelBaca terbuka={panel !== null} layarLebar={layarLebar} onTutup={() => setPanel(null)}>
        {panelBaca}
      </WadahPanelBaca>
    </div>
  )
```

`panelBaca` tetap elemen `<PanelSamping ... />` dengan dua belas prop yang sama seperti [:370-391](../../../src/components/reader/reader-shell.tsx#L370). Yang tersisa di shell: blok props, `total`, tiga state (`panel`, `tabPanel`, `layarLebar`), `sesiTerbuka`, efek media, efek sesi, `bukaPanel`, lima panggilan hook, `panelBaca`, dan JSX di atas.

Kalau shell masih di atas 200 setelah ini: pindahkan efek sesi baca [:139-143](../../../src/components/reader/reader-shell.tsx#L139) dan ref `sesiTerbuka` ke `use-sesi-baca.ts({ kitabId, masuk })`, lalu keluarkan `panelBaca` menjadi `<PanelSamping>` langsung di dalam `WadahPanelBaca` (children) agar tidak perlu variabel perantara. Catat pilihan itu di laporan.

- [ ] **Step 6: Perbarui dua ratchet lalu gerbang**

```bash
node -e "const fs=require('fs');for(const p of ['src/components/reader/kanvas-baca.tsx','src/components/reader/kop-baca.tsx','src/components/reader/saran-lanjut-baca.tsx','src/components/reader/wadah-panel-baca.tsx']){const s=fs.readFileSync(p,'utf8');fs.writeFileSync(p,s.replace(/\r\n/g,'\n').replace(/\n/g,'\r\n'))}"
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){console.log(f.split('/').pop(), fs.readFileSync(f,'utf8').split('\n').length)}" src/components/reader/reader-shell.tsx src/components/reader/kanvas-baca.tsx src/components/reader/kop-baca.tsx src/components/reader/saran-lanjut-baca.tsx src/components/reader/wadah-panel-baca.tsx
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

Expected: ratchet ukuran gagal karena `reader-shell.tsx` tidak lagi > 200 → hapus entri itu. Ratchet glassmorphism gagal karena `backdrop-blur` pindah jalur → ganti kunci `"src/components/reader/reader-shell.tsx": 1` menjadi `"src/components/reader/kop-baca.tsx": 1`. Setelah keduanya, `ratchet exit=0`. Buktikan jumlah `backdrop-blur` di seluruh `src/**` tidak berubah:

```bash
git grep -c backdrop-blur -- src | sort
```

Expected: `kop-baca.tsx:1` ada, `reader-shell.tsx` tidak muncul, dan berkas lain persis seperti sebelum task.

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npm run lint; echo "lint exit=$?"
npm test; echo "test exit=$?"
```

- [ ] **Step 7: Sapuan sisa impor shell**

Sapuan ini memeriksa nama yang sudah pasti pindah ke komponen atau hook lain di Task 4 dan Task 5. Sengaja tidak memasukkan `bukaSesiBaca`: efek sesi baca memang tetap di shell kecuali jalur cadangan di Step 5 dipakai.

```bash
grep -nE "inisialNama|hitungPersentase|teksPillProgres|HalamanPdf|arahGeser|Avatar|ArrowLeft|LogIn|History|LoaderCircle|AlertTriangle|CircleCheck|SheetContent|SheetHeader|SheetTitle|batasiHalaman|urutBookmark|urutCatatan|bacaPreferensiBaca|tulisPreferensiBaca|langkahZoom|JEDA_SIMPAN_PROGRES_MS|KUNCI_PREFERENSI_BACA|hapusBookmarkHalaman|hapusBookmarkId|tambahBookmark|tambahCatatanAksi|ubahCatatanIsi|hapusCatatanId|simpanProgresBacaAksi|useRouter|toast" src/components/reader/reader-shell.tsx; echo "grep exit=$?"
```

Expected: tidak ada baris yang cocok dan `grep exit=1` (kode 1 berarti "tidak ada kecocokan", bukan error). Setiap nama di atas muncul 0 kali karena tanggung jawabnya sudah pindah: `inisialNama` sampai `CircleCheck` ke `kop-baca.tsx`, `HalamanPdf` dan `arahGeser` ke `kanvas-baca.tsx`, `History` ke `saran-lanjut-baca.tsx`, `Sheet*` ke `wadah-panel-baca.tsx`, sisanya ke lima hook. Kalau grep keluar dengan kode 0, masih ada potongan logika atau JSX yang tertinggal di shell; pindahkan, jangan hapus impornya saja.

---

## Task 6: Sapuan akhir dan laporan

**Files:** tidak ada, kecuali `daftarDasar` masih menyimpan berkas reader.

- [ ] **Step 1: Pastikan tidak ada satu pun `src/app/**` yang berubah**

```bash
git status --short src/app; echo "exit=$?"
```

Expected: keluaran kosong. Satu-satunya konsumen reader adalah `src/app/(reader)/baca/[slug]/page.tsx`, dan tanda tangan `ReaderShell` tidak boleh berubah.

- [ ] **Step 2: Ukur ulang seluruh folder reader**

```bash
node -e "const fs=require('fs');for(const f of fs.readdirSync('src/components/reader')){const s=fs.readFileSync('src/components/reader/'+f,'utf8').split('\n').length;console.log(String(s).padStart(4),f)}"
```

Expected: tidak ada berkas di atas 200, dan `halaman-pdf.tsx` (164) tidak tersentuh.

- [ ] **Step 3: Gerbang penuh**

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npm run lint; echo "lint exit=$?"
npm test; echo "test exit=$?"
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

Expected: keempatnya `exit=0`. Baseline 261 test naik dengan test Task 1; laporkan angka sebenarnya.

- [ ] **Step 4: CRLF sweep untuk seluruh `src/**` baru**

```bash
node -e "const fs=require('fs'),p=require('child_process').execSync('git ls-files -o --exclude-standard src',{encoding:'utf8'}).trim().split('\n').filter(Boolean);for(const f of p){const s=fs.readFileSync(f,'utf8');const n=(s.match(/\n/g)||[]).length,c=(s.match(/\r\n/g)||[]).length;console.log(c===n?'CRLF oke':'LF PERBAIKI',f)}"
```

Expected: `CRLF oke` untuk setiap berkas. Berkas `tests/**` dikecualikan (harus LF).

- [ ] **Step 5: Tidak ada dash yang menyelinap**

```bash
git grep -nE "[—–]" -- src; echo "exit=$?"
```

Expected: hanya komentar lama yang sudah tercatat di ratchet dash (`db/queries.ts`, `db/seed.ts`, `lib/auth.ts`, `lib/bunny.ts`); tidak ada berkas reader yang muncul. Test ratchet sudah mengunci ini, jadi langkah ini formalitas dan tetap dijalankan.

- [ ] **Step 6: Laporkan ke pengguna**

Daftar berkas baru dan berkas ubah, jumlah baris tiap komponen reader sebelum/sesudah, perintah gerbang dengan exit code-nya, hasil empat mutasi Task 1, dan satu kalimat jujur bahwa kesetaraan visual dan interaktif pasca-pemecahan **belum** dibuktikan lewat uji live: gestur geser, fokus keyboard antar tab, Sheet di layar 360px, dan pil progres diverifikasi dari transkripsi, tipe, lint, dan test logika murni, bukan dari render browser (#4/#28 masih terblokir kredensial `DATABASE_URL`). Sebutkan pula keputusan yang sengaja diambil: state suntingan tetap di `panel-samping.tsx` (Invarian 1) dan shell dipecah dua tahap supaya reviewer bisa membedakan transkripsi dari perubahan perilaku.
