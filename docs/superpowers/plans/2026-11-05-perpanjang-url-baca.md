# Perpanjang URL Baca Saat Sesi Panjang Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reader tidak lagi buntu ketika sesi membaca melewati masa berlaku URL PDF bertanda tangan.

**Architecture:** Masa berlaku bawaan token CDN dinaikkan dari 900 ke 3600 detik, lalu ditambah satu jalur pemulihan: aksi server publik `perpanjangUrlBaca(slug)` menandatangani ulang URL, sebuah hook kecil di sisi klien menyimpan URL aktif dan menukarnya saat pemuatan gagal, dan keputusan "boleh tukar atau tidak" diangkat menjadi fungsi murni yang bisa diuji. Tidak ada proxy, tidak ada route baru, tidak ada perubahan skema.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript, Server Actions, Zod, pdfjs-dist, Bunny CDN token auth (HMAC-SHA256), `node:test` + `node:assert/strict` lewat tsx.

**Spec:** Tidak ada dokumen spec terpisah. Rencana ini berargumen dari `AGENTS.md` (aturan keamanan, validasi Zod di server, batas 200 baris per komponen, Bahasa Indonesia, larangan menampilkan kitab non-`published`) dan dari temuan review #25 "Reader 3.3: perpanjang URL tanda tangan saat sesi baca berjalan". Executor SDD wajib mencatat di ledger bahwa plan ini tidak punya spec yang bisa dijangkau, jadi putusan yang diambil bersifat provisional.

## Global Constraints

Salinan mengikat dari `AGENTS.md`. Setiap task tunduk pada bagian ini tanpa perlu diulang.

- Komponen React maksimal sekitar 200 baris. Pecah bila lebih.
- `tests/ui-higienis.test.ts` mengunci nol toleransi: setiap berkas langsung di `src/components/reader/` plus `src/lib/baca-alur.ts` wajib di bawah 200 baris. Tidak ada daftar dasar untuk aturan ini.
- Validasi semua input dengan Zod di server, termasuk query string dan nilai dari klien.
- Cek otorisasi di server untuk setiap aksi. Aksi ini sengaja publik karena reader boleh dibuka anonim; penyaringnya adalah `kitabTayangBySlug`.
- DILARANG menampilkan kitab berstatus selain `published` di katalog atau halaman publik.
- Secret hanya di environment variable. Jangan kirim ke client, jangan di-log, jangan hardcode. `BUNNY_CDN_TOKEN_KEY` tidak pernah meninggalkan server.
- Error handling: setiap Server Action mengembalikan hasil bertipe dan tidak membocorkan stack trace ke client. Pakai `pesanAman` dari `src/actions/tipe.ts`.
- DILARANG memakai em-dash (U+2014) atau en-dash (U+2013) di teks UI maupun di sumber baru.
- DILARANG menulis UI atau copy dengan bahasa selain Bahasa Indonesia baku.
- DILARANG memakai `any` tanpa alasan tertulis di komentar.
- Gunakan path alias `@/...`. Hindari import relatif yang naik lebih dari dua level.
- Setiap perubahan logika wajib disertai atau diperbarui test.
- Akhir baris: `src/**` CRLF, `tests/**` LF, `docs/**` LF. Tidak ada `.gitattributes`; `core.autocrlf=true`.
- Gerbang wajib, semuanya dengan exit code asli dari perintah yang dijalankan sendiri, bukan dari pipe atau notifikasi latar:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm test`
  - `node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts`
- Dilarang `git commit` atau `git push` kecuali pengguna memintanya secara eksplisit. Langkah commit di tiap task hanya dijalankan bila izin itu sudah diberikan untuk rencana ini; bila belum, lewati dan laporkan.
- Repo ini tidak punya jsdom maupun testing-library. JSX dan hook tidak bisa diuji render. Logika yang bisa diuji wajib diangkat ke modul murni di `src/lib/`, mengikuti preseden `src/lib/unggah-pdf-klien.ts`.
- Keluaran `npm test` yang normal dan bukan temuan: `ExperimentalWarning: Module mocking`, `DeprecationWarning: mock.module(): options.namedExports`, dan jejak `[aksi] kegagalan teknis:` dari test yang sengaja memicu error teknis.

## Keadaan yang mendorong rencana ini

- `BUNNY_SIGNED_URL_EXPIRY_SECONDS=900` di `.env.local`, dan default di `src/lib/bunny.ts:41` juga 900.
- `src/app/(reader)/baca/[slug]/page.tsx:57` menandatangani URL sekali di server lewat `urlBaca(kitab.urlPdf)` lalu meneruskannya sebagai prop.
- `src/components/reader/halaman-pdf.tsx:42` memanggil `getDocument({ url })`. pdf.js mengikat URL itu untuk seluruh umur dokumen, termasuk range request halaman-halaman berikutnya.
- Setelah 15 menit, range request ditolak CDN. Efek render menangkapnya di `halaman-pdf.tsx:91-99` dan memasang `status = "gagal"`.
- Tombol "Muat ulang" di `halaman-pdf.tsx:148` hanya menaikkan `percobaan`, yang menjalankan ulang `getDocument` dengan URL yang sama dan sudah mati. Reader buntu sampai halaman dimuat ulang penuh.

## File Structure

| Berkas | Tanggung jawab | Aksi |
|---|---|---|
| `src/lib/bunny.ts` | Penanda-tanganan URL CDN dan masa berlakunya | Ubah default 900 ke 3600 |
| `src/lib/validasi.ts` | Skema Zod bersama | Tambah `skemaSlug`, pakai ulang di `skemaKategori` |
| `src/actions/baca.ts` | Aksi server alur baca | Tambah tipe `HasilUrlBaca` dan aksi `perpanjangUrlBaca` |
| `src/lib/baca-alur.ts` | Logika murni alur baca | Tambah `KeputusanSegarkanUrl` dan `putuskanSegarkanUrl` |
| `src/components/reader/use-url-pdf-segar.ts` | Penyimpan URL aktif, penjaga satu kali penyegaran otomatis | Baru |
| `src/components/reader/halaman-pdf.tsx` | Pemuatan dan render PDF | Pakai hook, segarkan di dua jalur gagal |
| `tests/bunny-url.test.ts` | Test penanda-tanganan URL | Tambah satu test default 3600 |
| `tests/aksi-baca-url.test.ts` | Test aksi `perpanjangUrlBaca` | Baru |
| `tests/baca-alur.test.ts` | Test logika murni reader | Tambah empat test keputusan penyegaran |

Urutan task mengikuti dependensi: constant dulu, lalu aksi server, lalu logika murni, lalu klien yang memakai keduanya, lalu sapuan.

---

### Task 1: Masa berlaku bawaan URL baca naik ke 3600 detik

**Files:**
- Modify: `src/lib/bunny.ts:38-42`
- Test: `tests/bunny-url.test.ts` (tambah satu test di akhir berkas)

**Interfaces:**
- Consumes: helper `denganEnv` dan konstanta `HOST`, `PATH`, `TERSIMPAN`, `SEKARANG` yang sudah ada di `tests/bunny-url.test.ts:5-44`.
- Produces: `urlBaca(urlSimpan: string, sekarang?: number): string | null` dan `urlTtd(path: string, sekarang?: number): string` memakai masa berlaku bawaan 3600 detik bila `BUNNY_SIGNED_URL_EXPIRY_SECONDS` tidak diset. Task 2 mengandalkannya saat membiarkan `src/lib/bunny` asli di dalam test.

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan di akhir `tests/bunny-url.test.ts`, sesudah test `cdnSiapPublikasi` yang berakhir di baris 136. Jangan ubah test yang sudah ada; `KONFIG_CDN` di baris 46-51 sengaja memasang `BUNNY_SIGNED_URL_EXPIRY_SECONDS` eksplisit, jadi test baru ini tidak boleh memakainya.

```ts
test("masa berlaku bawaan URL tanda tangan adalah 3600 detik", () => {
  // `denganEnv` menghapus semua kunci Bunny lebih dulu, jadi yang terbaca di sini
  // adalah default di src/lib/bunny.ts, bukan nilai dari .env.local.
  denganEnv({ BUNNY_CDN_HOSTNAME: HOST, BUNNY_CDN_TOKEN_KEY: "token-cdn-dummy" }, () => {
    const hasil = urlBaca(TERSIMPAN, SEKARANG)
    assert.ok(hasil)

    const hex = (Math.floor(SEKARANG / 1000) + 3600).toString(16)
    assert.ok(hasil.startsWith(`https://${HOST}/${hex}${PATH}?token=`), hasil)
    assert.match(hasil, /token=[0-9a-f]{64}$/)
  })
})
```

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run: `node --import tsx --experimental-test-module-mocks --test tests/bunny-url.test.ts; echo "exit=$?"`

Expected: `exit=1`, tepat satu test gagal yaitu `masa berlaku bawaan URL tanda tangan adalah 3600 detik`. Pesan gagalnya memuat URL dengan segmen hex hasil `+ 900`, bukan `+ 3600`. Delapan test lain tetap lulus. Bila yang gagal lebih dari satu, berhenti dan periksa apakah `denganEnv` ikut terubah.

- [ ] **Step 3: Ubah default di `src/lib/bunny.ts`**

Ganti blok `return` di dalam `bacaKonfigurasiCdn` (baris 38-42) menjadi persis seperti ini. Komentar satu baris itu wajib ada karena angka 3600 tanpa alasan akan terlihat seperti angka acak.

```ts
  return {
    hostname,
    token: process.env.BUNNY_CDN_TOKEN_KEY ?? "",
    // pdf.js mengikat URL sekali saat dokumen dibuka, jadi masa berlaku harus
    // lebih panjang dari satu sesi baca wajar; 15 menit terbukti terlalu sempit.
    kedaluwarsaDetik: angkaLingkungan("BUNNY_SIGNED_URL_EXPIRY_SECONDS", 3600),
  }
```

Jangan sentuh `angkaLingkungan`, `bacaKonfigurasiStorage`, maupun fungsi lain di berkas itu.

- [ ] **Step 4: Jalankan test dan pastikan lulus**

Run: `node --import tsx --experimental-test-module-mocks --test tests/bunny-url.test.ts; echo "exit=$?"`

Expected: `exit=0`, sembilan test lulus, nol gagal.

- [ ] **Step 5: Buktikan test itu bergigi**

Bukti bahwa test baru benar-benar mengunci default, bukan sekadar lulus kebetulan. Salin `src/lib/bunny.ts` ke direktori sementara di luar repo, kembalikan default ke 900 di salinan itu, lalu jalankan test terhadap salinan. Cara termudah tanpa menyentuh berkas asli:

```bash
cp src/lib/bunny.ts "$TEMP/bunny-cadangan.ts"
node -e "const fs=require('fs');const p='src/lib/bunny.ts';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('BUNNY_SIGNED_URL_EXPIRY_SECONDS\", 3600','BUNNY_SIGNED_URL_EXPIRY_SECONDS\", 900'))"
node --import tsx --experimental-test-module-mocks --test tests/bunny-url.test.ts; echo "mutasi exit=$?"
cp "$TEMP/bunny-cadangan.ts" src/lib/bunny.ts
node --import tsx --experimental-test-module-mocks --test tests/bunny-url.test.ts; echo "pulih exit=$?"
```

Expected: `mutasi exit=1` dengan hanya test default 3600 yang gagal, lalu `pulih exit=0`. Laporkan kedua angka itu apa adanya. Jangan lanjut ke Step 6 sebelum `pulih exit=0`.

- [ ] **Step 6: Pastikan `src/lib/bunny.ts` kembali CRLF**

```bash
node -e "const s=require('fs').readFileSync('src/lib/bunny.ts','utf8');const n=(s.match(/\n/g)||[]).length,c=(s.match(/\r\n/g)||[]).length;console.log(c===n?'CRLF oke':'LF PERBAIKI')"
```

Expected: `CRLF oke`. Bila `LF PERBAIKI`, jalankan `node -e "const fs=require('fs');const p='src/lib/bunny.ts';const s=fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');fs.writeFileSync(p,s.replace(/\n/g,'\r\n'))"` lalu ulangi pemeriksaan.

- [ ] **Step 7: Commit (hanya bila pengguna sudah meminta commit untuk rencana ini)**

```bash
git add src/lib/bunny.ts tests/bunny-url.test.ts
git commit -m "fix: masa berlaku bawaan URL baca naik ke 3600 detik"
```

**Catatan non-kode untuk dilaporkan ke pengguna:** `.env.local` masih memuat `BUNNY_SIGNED_URL_EXPIRY_SECONDS=900`, dan nilai environment selalu menang atas default. Pengguna yang mengubah atau menghapus baris itu sendiri, termasuk di environment Vercel. Jangan pernah mencetak atau mengisi nilai dari berkas kredensial.

---

### Task 2: Aksi server `perpanjangUrlBaca` dan `skemaSlug`

**Files:**
- Modify: `src/lib/validasi.ts` (tambah `skemaSlug` sesudah `skemaId` di baris 7; pakai ulang di `skemaKategori.slug` baris 101-106)
- Modify: `src/actions/baca.ts` (tambah import, tipe hasil, dan satu aksi di akhir berkas)
- Test: `tests/aksi-baca-url.test.ts` (baru)

**Interfaces:**
- Consumes: `kitabTayangBySlug(slug: string): Promise<KitabVe | null>` dari `src/db/queries.ts:258`; `urlBaca(urlSimpan: string, sekarang?: number): string | null` dari `src/lib/bunny.ts:159`; `pesanAman(error: unknown, baku?: string): string` dari `src/actions/tipe.ts:21`; `PESAN_TIPE` dari `src/lib/validasi.ts:15`.
- Produces:
  - `export const skemaSlug: ZodString` di `src/lib/validasi.ts`, menerima string 3-60 karakter berpola `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
  - `export type HasilUrlBaca = { ok: true; url: string | null } | { ok: false; pesan: string }` di `src/actions/baca.ts`.
  - `export async function perpanjangUrlBaca(slugMentah: string): Promise<HasilUrlBaca>` di `src/actions/baca.ts`. Task 4 memanggil fungsi ini dari hook klien dengan tanda tangan persis seperti itu.

- [ ] **Step 1: Tulis berkas test baru**

Buat `tests/aksi-baca-url.test.ts` dengan isi persis berikut. Akhir baris LF. Pola mock mengikuti `tests/aksi-kitab.test.ts:90-175`: semua `mock.module` didaftarkan sebelum modul aksi diimpor, karena tsx mengemas berkas test sebagai CJS sehingga `await` di puncak tidak tersedia.

```ts
import assert from "node:assert/strict"
import { mock, test } from "node:test"

/**
 * Test `perpanjangUrlBaca`: aksi publik yang menandatangani ulang URL baca saat
 * sesi membaca lebih panjang dari masa berlaku token CDN.
 *
 * `src/db/queries` dan `next/cache` ditukar. `src/lib/bunny` dan `src/lib/validasi`
 * dibiarkan asli supaya yang diuji adalah tanda tangan HMAC sungguhan dan penolakan
 * Zod sungguhan, bukan string karangan.
 */

const HOST = "cdn.pustakakitab.id"
const TOKEN = "token-cdn-dummy"
const SLUG = "tafsir-al-jalalain"
const PATH = "/pdf/tafsir-al-jalalain-ab12cd34.pdf"
const URL_TERSIMPAN = `https://${HOST}${PATH}`
const PESAN_BAKU = "Naskah belum dapat dimuat ulang. Coba lagi sebentar lagi."

const KUNCI_ENV = [
  "BUNNY_CDN_HOSTNAME",
  "BUNNY_CDN_TOKEN_KEY",
  "BUNNY_SIGNED_URL_EXPIRY_SECONDS",
] as const

/** mock.module berlaku untuk satu file penuh, jadi kondisinya lewat objek yang direset. */
const D = {
  kitab: null as { urlPdf: string } | null,
  slugDitanya: [] as string[],
  lempar: null as Error | null,
  revalid: [] as string[],
}

function aturUlang() {
  D.kitab = null
  D.slugDitanya = []
  D.lempar = null
  D.revalid = []
}

/** Kunci Bunny dibersihkan per test supaya nilai dari .env tidak ikut terpakai. */
async function denganEnv<T>(
  isi: Record<string, string>,
  jalankan: () => T | Promise<T>,
): Promise<T> {
  const semula = new Map<string, string | undefined>(
    KUNCI_ENV.map((kunci) => [kunci, process.env[kunci]]),
  )
  for (const kunci of KUNCI_ENV) delete process.env[kunci]
  Object.assign(process.env, isi)

  try {
    return await jalankan()
  } finally {
    for (const [kunci, nilai] of semula) {
      if (nilai === undefined) delete process.env[kunci]
      else process.env[kunci] = nilai
    }
  }
}

async function daftarkanMock() {
  mock.module("../src/db/queries", {
    namedExports: {
      kitabTayangBySlug: async (slug: string) => {
        D.slugDitanya.push(slug)
        if (D.lempar) throw D.lempar
        return D.kitab
      },
    },
  })

  mock.module("next/cache", {
    namedExports: {
      revalidatePath: (path: string) => {
        D.revalid.push(path)
      },
    },
  })
}

type HasilUrlBaca = { ok: true; url: string | null } | { ok: false; pesan: string }
type ModulAksi = { perpanjangUrlBaca: (slugMentah: string) => Promise<HasilUrlBaca> }

let penyiapan: Promise<void> | null = null
async function aksi(): Promise<ModulAksi> {
  if (!penyiapan) penyiapan = daftarkanMock()
  await penyiapan
  return (await import("../src/actions/baca")) as unknown as ModulAksi
}

const ENV_CDN = { BUNNY_CDN_HOSTNAME: HOST, BUNNY_CDN_TOKEN_KEY: TOKEN }

test("perpanjangUrlBaca menandatangani ulang url_pdf kitab yang tayang", async () => {
  aturUlang()
  D.kitab = { urlPdf: URL_TERSIMPAN }
  const { perpanjangUrlBaca } = await aksi()

  const hasil = await denganEnv(ENV_CDN, () => perpanjangUrlBaca(SLUG))

  assert.equal(hasil.ok, true)
  if (!hasil.ok) throw new Error("aksi seharusnya berhasil")
  assert.ok(hasil.url)
  assert.notEqual(hasil.url, URL_TERSIMPAN)
  assert.match(
    hasil.url,
    /^https:\/\/cdn\.pustakakitab\.id\/[0-9a-f]+\/pdf\/tafsir-al-jalalain-ab12cd34\.pdf\?token=[0-9a-f]{64}$/,
  )
  assert.deepEqual(D.slugDitanya, [SLUG])
  // Aksi baca tidak menulis apa pun, jadi tidak boleh ada cache halaman yang dilepas.
  assert.deepEqual(D.revalid, [])
})

test("perpanjangUrlBaca menolak slug yang tidak ada di katalog tayang", async () => {
  aturUlang()
  D.kitab = null
  const { perpanjangUrlBaca } = await aksi()

  const hasil = await denganEnv(ENV_CDN, () => perpanjangUrlBaca("kitab-yang-tidak-ada"))

  assert.deepEqual(hasil, {
    ok: false,
    pesan: "Kitab ini tidak tersedia untuk dibaca.",
  })
  assert.deepEqual(D.slugDitanya, ["kitab-yang-tidak-ada"])
})

test("perpanjangUrlBaca menolak slug cacat sebelum menyentuh database", async () => {
  aturUlang()
  const { perpanjangUrlBaca } = await aksi()

  const hasil = await denganEnv(ENV_CDN, () => perpanjangUrlBaca("Bukan Slug!"))

  assert.equal(hasil.ok, false)
  if (hasil.ok) throw new Error("slug cacat seharusnya ditolak")
  assert.equal(hasil.pesan, "Slug hanya huruf kecil, angka, dan tanda hubung.")
  assert.deepEqual(D.slugDitanya, [])
})

test("perpanjangUrlBaca mengembalikan url null untuk kitab tanpa PDF", async () => {
  aturUlang()
  D.kitab = { urlPdf: "" }
  const { perpanjangUrlBaca } = await aksi()

  const hasil = await denganEnv(ENV_CDN, () => perpanjangUrlBaca(SLUG))

  assert.deepEqual(hasil, { ok: true, url: null })
})

test("perpanjangUrlBaca menyembunyikan kegagalan teknis di balik pesan aman", async () => {
  aturUlang()
  D.lempar = Object.assign(
    new Error("password authentication failed for user \"neondb_owner\""),
    { name: "NeonDbError" },
  )
  const { perpanjangUrlBaca } = await aksi()

  const hasil = await denganEnv(ENV_CDN, () => perpanjangUrlBaca(SLUG))

  assert.equal(hasil.ok, false)
  if (hasil.ok) throw new Error("kegagalan teknis seharusnya jadi hasil gagal")
  assert.equal(hasil.pesan, PESAN_BAKU)
  assert.ok(!hasil.pesan.includes("password"), "pesan tidak boleh membocorkan detail driver")
})

test("mengembalikan url tersimpan apa adanya saat BUNNY_CDN_HOSTNAME belum diisi", async () => {
  aturUlang()
  D.kitab = { urlPdf: URL_TERSIMPAN }
  const { perpanjangUrlBaca } = await aksi()

  // denganEnv menghapus BUNNY_CDN_HOSTNAME secara eksplisit (bukan hanya tidak
  // mengisinya) karena src/db/env.ts memuat .env.local saat modul diimpor.
  // Jalur penyegaran harus menurun dengan anggun: URL yang kembali identik
  // dengan yang sudah dipegang klien, sehingga pemanggil memutuskan "diam"
  // dan tidak ada loop penyegaran tak terbatas.
  const hasil = await denganEnv({}, () => perpanjangUrlBaca(SLUG))

  assert.equal(hasil.ok, true)
  if (!hasil.ok) throw new Error("tanpa hostname CDN aksi seharusnya tetap berhasil")
  assert.equal(hasil.url, URL_TERSIMPAN)
})
```

Catatan koreksi: test keenam semula direncanakan mengassert pesan konfigurasi
"BUNNY_CDN_HOSTNAME belum diisi". Itu mustahil, karena `urlBaca` di
`src/lib/bunny.ts:167` mengembalikan URL tersimpan apa adanya saat hostname
kosong dan tidak pernah mencapai `bacaKonfigurasiCdn` yang melempar pesan itu.
Fallback tersebut sudah dikunci `tests/bunny-url.test.ts:84-95`. Test diganti
mengunci perilaku nyata, yang justru lebih berguna untuk Task 3: URL yang tidak
berubah membuat `putuskanSegarkanUrl` memutuskan "diam".

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run: `node --import tsx --experimental-test-module-mocks --test tests/aksi-baca-url.test.ts; echo "exit=$?"`

Expected: `exit=1`. Enam test gagal karena `perpanjangUrlBaca` bukan fungsi (`TypeError: perpanjangUrlBaca is not a function`). Bila yang muncul justru error tautan modul atau `ERR_MODULE_NOT_FOUND`, berhenti dan periksa ejaan specifier mock; jangan lanjut menulis implementasi sebelum kegagalannya berbentuk "fungsi belum ada".

- [ ] **Step 3: Tambah `skemaSlug` di `src/lib/validasi.ts`**

Sisipkan tepat sesudah `export const skemaId = z.uuid("Identitas data tidak dikenali.")` di baris 7, sebelum blok komentar `PESAN_TIPE`.

```ts
/**
 * Slug datang dari URL reader sekaligus dari formulir admin. Bentuknya dikunci di
 * satu tempat agar aksi publik tidak berangkat ke database dengan nilai yang pasti
 * tidak cocok dengan baris mana pun.
 */
export const skemaSlug = z
  .string({ error: PESAN_TIPE })
  .trim()
  .min(3, "Slug minimal 3 karakter.")
  .max(60, "Slug maksimal 60 karakter.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung.")
```

`PESAN_TIPE` dideklarasikan di baris 15, sesudah titik sisip ini. `const` tidak di-hoist, jadi rujukan di atas akan melempar `ReferenceError` saat modul dimuat. Pindahkan deklarasi `skemaSlug` ke SESUDAH baris 15 (`export const PESAN_TIPE = ...`) dan sebelum `skemaStatusKitab` di baris 17. Posisi akhirnya: `skemaId` (7), blok komentar `PESAN_TIPE` (9-14), `PESAN_TIPE` (15), `skemaSlug` baru, `skemaStatusKitab`.

- [ ] **Step 4: Pakai ulang `skemaSlug` di `skemaKategori`**

Ganti properti `slug` di dalam `skemaKategori` (baris 101-106) dari salinan inline menjadi rujukan ke skema bersama. Pesan dan aturannya identik, jadi tidak ada test yang boleh berubah hasil.

```ts
  slug: skemaSlug,
```

- [ ] **Step 5: Tambah tipe hasil dan aksi di `src/actions/baca.ts`**

Ubah baris 24 dari

```ts
import { gagal, sukses, type HasilAksi } from "./tipe"
```

menjadi

```ts
import { gagal, pesanAman, sukses, type HasilAksi } from "./tipe"
```

Tambah dua import baru. `skemaId` sudah diimpor dari `@/lib/validasi` di baris 23, jadi cukup perluas impor itu:

```ts
import { skemaId, skemaSlug } from "@/lib/validasi"
import { urlBaca } from "@/lib/bunny"
```

Tambah di akhir berkas, sesudah `hapusCatatanId`:

```ts
export type HasilUrlBaca =
  | { ok: true; url: string | null }
  | { ok: false; pesan: string }

const PESAN_GAGAL_URL = "Naskah belum dapat dimuat ulang. Coba lagi sebentar lagi."

/**
 * Menandatangani ulang URL baca saat sesi membaca melewati masa berlaku token CDN.
 *
 * Aksi ini tidak menuntut sesi karena reader memang boleh dibuka pengunjung
 * anonim. Penyaringnya `kitabTayangBySlug`: kitab yang belum atau tidak lagi
 * tayang menghasilkan `null`, jadi aksi ini tidak menjadi jalan belakang untuk
 * membaca naskah yang belum diterbitkan. `HasilAksi` tidak dipakai karena tidak
 * punya tempat untuk URL, dan menaruh URL di `pesan` akan menampilkannya di toast.
 */
export async function perpanjangUrlBaca(slugMentah: string): Promise<HasilUrlBaca> {
  try {
    const slug = skemaSlug.parse(slugMentah)
    const target = await kitabTayangBySlug(slug)
    if (!target) return { ok: false, pesan: "Kitab ini tidak tersedia untuk dibaca." }
    return { ok: true, url: urlBaca(target.urlPdf) }
  } catch (error) {
    return { ok: false, pesan: pesanAman(error, PESAN_GAGAL_URL) }
  }
}
```

`kitabTayangBySlug` belum diimpor di berkas ini; tambahkan ke impor dari `@/db/queries` di baris 14 sehingga menjadi:

```ts
import { kitabTayangById, kitabTayangBySlug } from "@/db/queries"
```

Jangan tambah `revalidatePath`: aksi ini tidak menulis data apa pun.

- [ ] **Step 6: Jalankan test aksi dan pastikan lulus**

Run: `node --import tsx --experimental-test-module-mocks --test tests/aksi-baca-url.test.ts; echo "exit=$?"`

Expected: `exit=0`, enam test lulus. Test terakhir (`kegagalan teknis`) mencetak satu baris `[aksi] kegagalan teknis:` ke stderr; itu perilaku `pesanAman` yang normal, bukan kegagalan.

- [ ] **Step 7: Pastikan `skemaSlug` tidak merusak validasi yang sudah ada**

Run: `node --import tsx --experimental-test-module-mocks --test tests/validasi-skema.test.ts tests/admin-validasi.test.ts tests/baca-skema.test.ts; echo "exit=$?"`

Expected: `exit=0`. Bila ada yang gagal, jangan sesuaikan test itu; periksa apakah pesan atau aturan `skemaSlug` menyimpang dari salinan inline yang digantikannya.

- [ ] **Step 8: Buktikan test slug cacat bergigi**

Test "menolak slug cacat sebelum menyentuh database" harus benar-benar membuktikan urutan, bukan hanya hasil. Lumpuhkan validasi Zod sementara dan pastikan test itu gagal:

```bash
cp src/actions/baca.ts "$TEMP/baca-cadangan.ts"
node -e "const fs=require('fs');const p='src/actions/baca.ts';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('const slug = skemaSlug.parse(slugMentah)','const slug = String(slugMentah)'))"
node --import tsx --experimental-test-module-mocks --test tests/aksi-baca-url.test.ts; echo "mutasi exit=$?"
cp "$TEMP/baca-cadangan.ts" src/actions/baca.ts
node --import tsx --experimental-test-module-mocks --test tests/aksi-baca-url.test.ts; echo "pulih exit=$?"
```

Expected: `mutasi exit=1` dengan test slug cacat ikut gagal (karena `D.slugDitanya` tidak lagi kosong), lalu `pulih exit=0`. `npx tsc --noEmit` pada keadaan termutasi akan报错 soal tipe; itu tidak relevan karena mutasi hanya hidup beberapa detik dan tidak di-commit. Laporkan kedua angka itu.

- [ ] **Step 9: Pastikan berkas `src/**` yang disentuh tetap CRLF**

```bash
node -e "const fs=require('fs');for(const p of ['src/lib/validasi.ts','src/actions/baca.ts']){const s=fs.readFileSync(p,'utf8');const n=(s.match(/\n/g)||[]).length,c=(s.match(/\r\n/g)||[]).length;console.log(c===n?'CRLF oke':'LF PERBAIKI',p)}"
node -e "const s=require('fs').readFileSync('tests/aksi-baca-url.test.ts','utf8');console.log(/\r\n/.test(s)?'CRLF PERBAIKI':'LF oke','tests/aksi-baca-url.test.ts')"
```

Expected: `CRLF oke` untuk dua berkas `src/**`, dan `LF oke` untuk berkas test. Perbaiki dengan pola yang sama seperti Task 1 Step 6 bila menyimpang.

- [ ] **Step 10: Commit (hanya bila pengguna sudah meminta commit untuk rencana ini)**

```bash
git add src/lib/validasi.ts src/actions/baca.ts tests/aksi-baca-url.test.ts
git commit -m "feat: aksi perpanjangUrlBaca menandatangani ulang URL baca"
```

---

### Task 3: Keputusan penyegaran URL sebagai logika murni

**Files:**
- Modify: `src/lib/baca-alur.ts` (tambah di akhir berkas, sesudah `teksPillProgres` yang berakhir di baris 97)
- Test: `tests/baca-alur.test.ts` (tambah di akhir berkas)

**Interfaces:**
- Consumes: tidak ada. Modul ini murni dan tidak mengimpor apa pun dari Task 1 atau Task 2.
- Produces:
  - `export type KeputusanSegarkanUrl = { tindak: "tukar"; url: string } | { tindak: "diam" }`
  - `export function putuskanSegarkanUrl(masukan: { sudahOtomatis: boolean; urlAktif: string | null; hasil: { ok: boolean; url: string | null } }): KeputusanSegarkanUrl`
  - Task 4 memanggil `putuskanSegarkanUrl` persis dengan tanda tangan itu. Parameter `hasil` sengaja berbentuk struktural, bukan `HasilUrlBaca`, supaya `src/lib/baca-alur.ts` tidak perlu mengimpor modul `"use server"`.

- [ ] **Step 1: Tulis test yang gagal**

Tambah di akhir `tests/baca-alur.test.ts`. Perluas impor dari `../src/lib/baca-alur` yang sudah ada di berkas itu dengan menambahkan `putuskanSegarkanUrl`; jangan menambah baris impor kedua dari modul yang sama.

```ts
test("putuskanSegarkanUrl menukar URL baru saat belum ada penyegaran otomatis", () => {
  // Tombol "Muat ulang" di Task 4 memanggil dengan `sudahOtomatis: false` walau
  // penjaga internal sudah terpakai, jadi permintaan manusia tidak pernah ikut
  // ditolak. Fungsi murni ini tidak bisa membedakan keduanya, dan memang tidak
  // perlu: pembedanya ada di pemanggil.
  assert.deepEqual(
    putuskanSegarkanUrl({
      sudahOtomatis: false,
      urlAktif: "https://cdn.pustakakitab.id/lama",
      hasil: { ok: true, url: "https://cdn.pustakakitab.id/baru" },
    }),
    { tindak: "tukar", url: "https://cdn.pustakakitab.id/baru" },
  )
})

test("putuskanSegarkanUrl menolak penyegaran otomatis kedua dalam satu episode", () => {
  // Tanpa penjaga ini, URL yang memang mati memicu unduh ulang tanpa henti.
  assert.deepEqual(
    putuskanSegarkanUrl({
      sudahOtomatis: true,
      urlAktif: "https://cdn.pustakakitab.id/lama",
      hasil: { ok: true, url: "https://cdn.pustakakitab.id/baru" },
    }),
    { tindak: "diam" },
  )
})

test("putuskanSegarkanUrl diam saat server menolak atau tidak mengembalikan URL", () => {
  assert.deepEqual(
    putuskanSegarkanUrl({
      sudahOtomatis: false,
      urlAktif: "https://cdn.pustakakitab.id/lama",
      hasil: { ok: false, url: null },
    }),
    { tindak: "diam" },
  )
  assert.deepEqual(
    putuskanSegarkanUrl({
      sudahOtomatis: false,
      urlAktif: "https://cdn.pustakakitab.id/lama",
      hasil: { ok: true, url: null },
    }),
    { tindak: "diam" },
  )
})

test("putuskanSegarkanUrl diam saat URL yang kembali sama dengan yang aktif", () => {
  // Menukar URL yang identik tidak memperbaiki apa pun, hanya memicu satu siklus
  // muat ulang percuma karena `url` menjadi dependensi efek pemuatan.
  assert.deepEqual(
    putuskanSegarkanUrl({
      sudahOtomatis: false,
      urlAktif: "https://cdn.pustakakitab.id/sama",
      hasil: { ok: true, url: "https://cdn.pustakakitab.id/sama" },
    }),
    { tindak: "diam" },
  )
})
```

Catatan koreksi: rencana ini semula memuat test kelima bernama
"putuskanSegarkanUrl tetap menukar saat penyegaran dipaksa pengguna". Test itu
duplikat verbatim dari test pertama (input `sudahOtomatis: false`, `urlAktif`
lama, `hasil.url` baru, dan harapan `{ tindak: "tukar" }` semuanya identik),
jadi ia tidak pernah bisa gagal sendirian dan tidak menambah perlindungan apa
pun. Kontrak yang ingin didokumentasikannya, yaitu tombol "Muat ulang" tidak
pernah ikut ditolak penjaga loop, hidup di pemanggil pada Task 4
(`sudahOtomatis: otomatis && sudahOtomatis.current`) dan tidak dapat dibedakan
oleh fungsi murni ini. Test kelima dihapus dan komentarnya dipindah ke test
pertama. Jumlah test Task 3 menjadi 4, dan total suite menjadi 290.

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run: `node --import tsx --experimental-test-module-mocks --test tests/baca-alur.test.ts; echo "exit=$?"`

Expected: `exit=1` dengan `SyntaxError` atau `TypeError` soal `putuskanSegarkanUrl` yang tidak diekspor. Test 17 yang lama tetap lulus.

- [ ] **Step 3: Tulis implementasi**

Tambah di akhir `src/lib/baca-alur.ts`:

```ts
export type KeputusanSegarkanUrl =
  | { tindak: "tukar"; url: string }
  | { tindak: "diam" }

/**
 * Menentukan apakah URL baca hasil penanda-tanganan ulang layak dipasang.
 *
 * Tiga alasan untuk diam: server menolak, kitab memang tidak punya PDF, atau URL
 * yang kembali sama dengan yang sedang aktif. Alasan keempat adalah penjaga loop:
 * penyegaran otomatis hanya boleh sekali sampai dokumen berhasil dimuat, sebab
 * pdf.js mengunduh ulang seluruh berkas setiap kali URL berganti.
 */
export function putuskanSegarkanUrl({
  sudahOtomatis,
  urlAktif,
  hasil,
}: {
  sudahOtomatis: boolean
  urlAktif: string | null
  hasil: { ok: boolean; url: string | null }
}): KeputusanSegarkanUrl {
  if (!hasil.ok || hasil.url === null) return { tindak: "diam" }
  if (hasil.url === urlAktif) return { tindak: "diam" }
  if (sudahOtomatis) return { tindak: "diam" }
  return { tindak: "tukar", url: hasil.url }
}
```

- [ ] **Step 4: Jalankan test dan pastikan lulus**

Run: `node --import tsx --experimental-test-module-mocks --test tests/baca-alur.test.ts; echo "exit=$?"`

Expected: `exit=0`, 21 test lulus (17 lama ditambah 4 baru), nol gagal.

- [ ] **Step 5: Buktikan penjaga loop bergigi**

Hapus sementara cabang `sudahOtomatis` dan pastikan tepat satu test gagal:

```bash
cp src/lib/baca-alur.ts "$TEMP/baca-alur-cadangan.ts"
node -e "const fs=require('fs');const p='src/lib/baca-alur.ts';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('  if (sudahOtomatis) return { tindak: \"diam\" }\r\n','').replace('  if (sudahOtomatis) return { tindak: \"diam\" }\n',''))"
node --import tsx --experimental-test-module-mocks --test tests/baca-alur.test.ts; echo "mutasi exit=$?"
cp "$TEMP/baca-alur-cadangan.ts" src/lib/baca-alur.ts
node --import tsx --experimental-test-module-mocks --test tests/baca-alur.test.ts; echo "pulih exit=$?"
```

Expected: `mutasi exit=1` dengan hanya `putuskanSegarkanUrl menolak penyegaran otomatis kedua dalam satu episode` yang gagal, lalu `pulih exit=0`. Bila tidak ada test yang gagal pada langkah mutasi, berarti penggantian stringnya tidak kena (periksa CRLF); ulangi sampai benar, jangan lanjut dengan bukti yang kosong.

- [ ] **Step 6: Pastikan `src/lib/baca-alur.ts` tetap di bawah 200 baris dan tetap CRLF**

```bash
node -e "const fs=require('fs');const s=fs.readFileSync('src/lib/baca-alur.ts','utf8');const n=(s.match(/\n/g)||[]).length,c=(s.match(/\r\n/g)||[]).length;console.log('baris='+s.split('\n').length,(c===n?'CRLF oke':'LF PERBAIKI'))"
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

Expected: `baris` sekitar 135 dan tidak boleh lebih dari 200; `CRLF oke`; `ratchet exit=0`.

- [ ] **Step 7: Commit (hanya bila pengguna sudah meminta commit untuk rencana ini)**

```bash
git add src/lib/baca-alur.ts tests/baca-alur.test.ts
git commit -m "feat: keputusan penyegaran URL baca sebagai logika murni"
```

---

### Task 4: Reader menyegarkan URL saat pemuatan gagal

**Files:**
- Create: `src/components/reader/use-url-pdf-segar.ts`
- Modify: `src/components/reader/halaman-pdf.tsx` (isi lengkap pengganti ada di Step 3)

**Interfaces:**
- Consumes: `perpanjangUrlBaca(slugMentah: string): Promise<HasilUrlBaca>` dari Task 2, dengan `HasilUrlBaca = { ok: true; url: string | null } | { ok: false; pesan: string }`; `putuskanSegarkanUrl` dan `KeputusanSegarkanUrl` dari Task 3.
- Produces: `export function useUrlPdfSegar(slug: string, urlAwal: string | null): { url: string | null; sedangMenyegarkan: boolean; segarkan: (otomatis: boolean) => Promise<boolean>; tandaiBerhasil: () => void }`. Prop `url` pada `HalamanPdf` tidak berubah bentuk, jadi `src/components/reader/kanvas-baca.tsx` dan `reader-shell.tsx` tidak perlu disentuh sama sekali.

- [ ] **Step 1: Buat hook baru**

Buat `src/components/reader/use-url-pdf-segar.ts` dengan isi persis berikut. Akhir baris CRLF.

```ts
"use client"

import { useCallback, useRef, useState } from "react"
import { perpanjangUrlBaca } from "@/actions/baca"
import { putuskanSegarkanUrl } from "@/lib/baca-alur"

/**
 * URL baca bertanda tangan punya masa berlaku, sedangkan pdf.js mengikat URL itu
 * sekali saja saat dokumen dibuka. Sesi membaca yang lebih panjang dari masa
 * berlaku berakhir dengan penolakan CDN pada halaman berikutnya.
 *
 * Hook ini menyimpan URL aktif dan menandatangani ulang lewat aksi server.
 * `segarkan(true)` untuk pemulihan otomatis yang dibatasi sekali per episode;
 * `segarkan(false)` untuk tombol "Muat ulang" yang tidak boleh ikut dibatasi.
 * `tandaiBerhasil` membuka penjaga itu lagi setelah dokumen selesai dimuat.
 */
export function useUrlPdfSegar(slug: string, urlAwal: string | null) {
  const [url, setUrl] = useState(urlAwal)
  const [sedangMenyegarkan, setSedangMenyegarkan] = useState(false)
  const sudahOtomatis = useRef(false)

  // Cermin `url` lewat ref supaya `segarkan` tidak bergantung pada state dan
  // identitasnya tetap stabil. Identitas yang berubah setiap penyegaran akan
  // ikut menjalankan ulang efek pemuatan di komponen pemanggil.
  const urlAktif = useRef(url)
  urlAktif.current = url

  const segarkan = useCallback(
    async (otomatis: boolean) => {
      if (urlAktif.current === null) return false
      setSedangMenyegarkan(true)
      try {
        const hasil = await perpanjangUrlBaca(slug)
        const keputusan = putuskanSegarkanUrl({
          sudahOtomatis: otomatis && sudahOtomatis.current,
          urlAktif: urlAktif.current,
          hasil: { ok: hasil.ok, url: hasil.ok ? hasil.url : null },
        })
        if (keputusan.tindak === "diam") return false

        sudahOtomatis.current = true
        urlAktif.current = keputusan.url
        setUrl(keputusan.url)
        return true
      } finally {
        setSedangMenyegarkan(false)
      }
    },
    [slug],
  )

  const tandaiBerhasil = useCallback(() => {
    sudahOtomatis.current = false
  }, [])

  return { url, sedangMenyegarkan, segarkan, tandaiBerhasil }
}
```

- [ ] **Step 2: Ganti isi `src/components/reader/halaman-pdf.tsx`**

Tulis ulang berkas itu dengan isi persis berikut. Akhir baris CRLF. Perubahan terhadap versi sebelumnya hanya: prop `url` diterima sebagai `urlAwal`, hook `useUrlPdfSegar` dipasang, helper `cobaSegarkan` ditambah, dua jalur gagal memanggilnya, `tandaiBerhasil` dipanggil saat dokumen siap, dan tombol "Muat ulang" menyegarkan sekaligus punya keadaan disabled.

```tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AlertTriangle, FileText, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUrlPdfSegar } from "@/components/reader/use-url-pdf-segar"
import { rasioKanvas, skalaHalaman } from "@/lib/baca"
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist"
import { cn } from "@/lib/utils"

GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs"

type Status = "memuat" | "siap" | "gagal"

export function HalamanPdf({
  url: urlAwal,
  slug,
  judul,
  halaman,
  zoom,
  sepia,
}: {
  url: string | null
  slug: string
  judul: string
  halaman: number
  zoom: number
  sepia: boolean
}) {
  const { url, sedangMenyegarkan, segarkan, tandaiBerhasil } = useUrlPdfSegar(slug, urlAwal)
  const kanvas = useRef<HTMLCanvasElement | null>(null)
  const wadah = useRef<HTMLDivElement | null>(null)
  const renderBerjalan = useRef<RenderTask | null>(null)
  const [dokumen, setDokumen] = useState<PDFDocumentProxy | null>(null)
  const [status, setStatus] = useState<Status>("memuat")
  const [percobaan, setPercobaan] = useState(0)

  /**
   * Satu penyegaran URL dicoba lebih dulu sebelum menyerah. Bila URL berganti,
   * efek pemuatan jalan ulang sendiri karena `url` ada di daftar dependensinya;
   * bila tidak berganti, keadaan gagal baru dipasang supaya panelnya tidak
   * berkedip untuk hasil yang nihil.
   */
  const cobaSegarkan = useCallback(
    (belumBatal: () => boolean) => {
      void segarkan(true).then((berhasil) => {
        if (!belumBatal() || berhasil) return
        setStatus("gagal")
      })
    },
    [segarkan],
  )

  useEffect(() => {
    if (!url) return
    let dibatalkan = false
    setStatus("memuat")
    const tugas = getDocument({ url })
    tugas.promise
      .then((baru) => {
        if (dibatalkan) {
          void tugas.destroy()
          return
        }
        setDokumen(baru)
        setStatus("siap")
        tandaiBerhasil()
      })
      .catch(() => {
        if (!dibatalkan) cobaSegarkan(() => !dibatalkan)
      })
    return () => {
      dibatalkan = true
      void tugas.destroy()
      setDokumen(null)
    }
  }, [url, percobaan, cobaSegarkan, tandaiBerhasil])

  useEffect(() => {
    if (!dokumen || status !== "siap") return
    let dibatalkan = false
    void (async () => {
      const nomor = Math.min(Math.max(1, halaman), dokumen.numPages)
      const halamanPdf = await dokumen.getPage(nomor)
      const kanvasEl = kanvas.current
      const wadahEl = wadah.current
      if (dibatalkan || !kanvasEl || !wadahEl) return

      const dasar = halamanPdf.getViewport({ scale: 1 })
      const tampilan = halamanPdf.getViewport({
        scale: skalaHalaman(wadahEl.clientWidth - 16, dasar.width, zoom),
      })
      const rasio = rasioKanvas(window.devicePixelRatio)
      kanvasEl.width = Math.floor(tampilan.width * rasio)
      kanvasEl.height = Math.floor(tampilan.height * rasio)
      kanvasEl.style.width = `${tampilan.width}px`
      kanvasEl.style.height = `${tampilan.height}px`

      renderBerjalan.current?.cancel()
      const tugas = halamanPdf.render({
        canvas: kanvasEl,
        viewport: tampilan,
        transform: rasio > 1 ? [rasio, 0, 0, rasio, 0, 0] : undefined,
      })
      renderBerjalan.current = tugas
      try {
        await tugas.promise
      } catch (error) {
        // Render lama sengaja dibatalkan saat halaman atau zoom berganti; penolakan
        // itu bukan kegagalan. Pemeriksaan `instanceof` dibutuhkan karena pdf.js
        // kadang menolak dengan objek yang bukan Error, dan membaca `.name` pada
        // nilai null akan melempar di dalam catch.
        const nama = error instanceof Error ? error.name : ""
        if (dibatalkan || nama === "RenderingCancelledException") return
        // Halaman yang dibuka setelah masa berlaku token habis ditolak CDN. Ini
        // jalur yang paling sering kena pada sesi panjang, karena dokumennya
        // sendiri sudah terlanjur terbuka dengan URL yang lama.
        setStatus("memuat")
        cobaSegarkan(() => !dibatalkan)
      }
    })()
    return () => {
      dibatalkan = true
    }
  }, [dokumen, halaman, zoom, status, cobaSegarkan])

  if (!url) {
    return (
      <div className="flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
        <FileText className="size-8 text-muted-foreground" strokeWidth={1.75} />
        <h2 className="font-heading text-lg font-semibold">Naskah PDF belum tersedia</h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Berkas {judul} belum dipasang di rak digital, jadi isinya belum bisa dibaca di layar.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/kitab/${slug}`}>Lihat detail kitab</Link>
        </Button>
      </div>
    )
  }

  return (
    <div ref={wadah} className="relative flex min-h-[70vh] w-full justify-center">
      <canvas
        role="img"
        aria-label={`Halaman ${halaman} kitab ${judul}`}
        className={cn(
          "rounded-xl bg-white shadow-[0_24px_60px_-24px_rgb(0_0_0/0.8)] transition-opacity duration-200",
          sepia && "page-sepia",
          status === "siap" ? "opacity-100" : "opacity-0",
        )}
      />
      {status === "memuat" && (
        <p className="absolute inset-x-0 top-1/3 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-6 animate-spin" strokeWidth={1.75} />
          {sedangMenyegarkan ? "Menyegarkan naskah…" : `Memuat halaman ${halaman}…`}
        </p>
      )}
      {status === "gagal" && (
        <div className="absolute inset-x-0 top-1/4 mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-peringatan/25 bg-peringatan/5 px-6 py-8 text-center">
          <AlertTriangle className="size-7 text-peringatan" strokeWidth={1.75} />
          <h2 className="font-heading text-base font-semibold text-peringatan">
            Halaman kitab belum dapat dimuat
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Berkas PDF-nya mungkin belum tersedia di penyimpanan atau jaringan sedang terputus.
          </p>
          <Button
            size="sm"
            disabled={sedangMenyegarkan}
            onClick={() => {
              void segarkan(false)
              setPercobaan((n) => n + 1)
            }}
          >
            Muat ulang
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-gold underline underline-offset-4"
          >
            Buka berkas PDF di tab baru
          </a>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Cek tipe, lint, dan jumlah baris**

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npx eslint src/components/reader; echo "eslint exit=$?"
node -e "const fs=require('fs');for(const f of fs.readdirSync('src/components/reader')){const n=fs.readFileSync('src/components/reader/'+f,'utf8').split('\n').length;console.log(String(n).padStart(4),f)}"
```

Expected: `tsc exit=0`; `eslint exit=0` tanpa satu pun bait keluaran; `halaman-pdf.tsx` tidak lebih dari 200 baris dan `use-url-pdf-segar.ts` sekitar 62 baris.

Bila `halaman-pdf.tsx` melewati 200 baris, jangan naikkan batas dan jangan mendaftarkannya di ratchet. Pecah blok `status === "gagal"` (dari `<div className="absolute inset-x-0 top-1/4 ...">` sampai penutupnya) menjadi komponen baru `src/components/reader/pesan-gagal-pdf.tsx` dengan prop `{ sedangMenyegarkan: boolean; url: string; onMuatUlang: () => void }`, lalu laporkan pemecahan itu.

- [ ] **Step 4: Jalankan ratchet UI**

```bash
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

Expected: `exit=0`, 13 test lulus. Berkas hook baru ikut terperiksa otomatis oleh aturan nol toleransi folder reader, dan tidak boleh ada entri baru di peta dasar ukuran maupun peta glassmorphism.

- [ ] **Step 5: Pastikan CRLF untuk dua berkas `src/**`**

```bash
node -e "const fs=require('fs');for(const p of ['src/components/reader/use-url-pdf-segar.ts','src/components/reader/halaman-pdf.tsx']){const s=fs.readFileSync(p,'utf8');const n=(s.match(/\n/g)||[]).length,c=(s.match(/\r\n/g)||[]).length;console.log(c===n?'CRLF oke':'LF PERBAIKI',p)}"
```

Expected: `CRLF oke` keduanya. Perbaiki dengan pola Task 1 Step 6 bila menyimpang.

- [ ] **Step 6: Pastikan tidak ada dash dan hex yang menyelinap**

```bash
node -e "const fs=require('fs');for(const p of ['src/components/reader/use-url-pdf-segar.ts','src/components/reader/halaman-pdf.tsx']){const s=fs.readFileSync(p,'utf8');const d=s.match(/[\u2014\u2013]/g)||[];const h=s.match(/#[0-9a-fA-F]{6}\b/g)||[];console.log(p,'dash='+d.length,'hex='+h.length)}"
```

Expected: `dash=0` dan `hex=0` untuk keduanya.

- [ ] **Step 7: Commit (hanya bila pengguna sudah meminta commit untuk rencana ini)**

```bash
git add src/components/reader/use-url-pdf-segar.ts src/components/reader/halaman-pdf.tsx
git commit -m "fix: reader menyegarkan URL PDF saat sesi baca melewati masa berlaku"
```

**Batas pembuktian task ini, wajib dilaporkan apa adanya:** repo ini tidak punya jsdom maupun testing-library, jadi hook dan komponen di atas tidak diuji render. Yang terbukti adalah tipe, lint, ratchet, dan logika murni di Task 3. Bukti bahwa penolakan 403 sungguhan dari Bunny benar-benar memicu penyegaran di browser baru bisa didapat lewat uji live task #4, yang masih terblokir `DATABASE_URL` dan kredensial Clerk.

---

### Task 5: Sapuan akhir dan laporan

**Files:** tidak ada. Task ini hanya mengukur dan melaporkan.

**Interfaces:**
- Consumes: hasil Task 1 sampai Task 4.
- Produces: laporan ke pengguna.

- [ ] **Step 1: Pastikan tidak ada berkas di luar lingkup yang berubah**

```bash
git status --short; echo "exit=$?"
```

Expected: hanya enam berkas yang muncul, yaitu `src/lib/bunny.ts`, `src/lib/validasi.ts`, `src/actions/baca.ts`, `src/lib/baca-alur.ts`, `src/components/reader/use-url-pdf-segar.ts`, `src/components/reader/halaman-pdf.tsx`, ditambah tiga berkas test `tests/bunny-url.test.ts`, `tests/aksi-baca-url.test.ts`, `tests/baca-alur.test.ts`. Bila commit per task sudah dijalankan, keluarannya kosong. `git status` selalu keluar dengan `exit=0`, jadi yang dinilai adalah keluarannya, bukan kode keluarnya. Bila ada berkas lain, berhenti dan selidiki; jangan dihapus.

- [ ] **Step 2: Pastikan `src/app/**` tidak tersentuh**

```bash
git status --short src/app; echo "exit=$?"; git diff --stat HEAD -- src/app
```

Expected: keluaran kosong untuk keduanya. Prop `HalamanPdf` dan `ReaderShell` tidak berubah bentuk, jadi tidak ada halaman yang perlu menyesuaikan.

- [ ] **Step 3: Gerbang penuh**

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npm run lint; echo "lint exit=$?"
npm test; echo "test exit=$?"
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

Expected: keempatnya `exit=0`. Baseline sebelumnya 279 test lulus; dengan 1 test Task 1, 6 test Task 2, dan 4 test Task 3 jumlahnya menjadi 290. Laporkan angka sebenarnya dari keluaran, bukan angka rencana ini.

- [ ] **Step 4: CRLF sweep untuk seluruh berkas baru di `src/**`**

```bash
node -e "const fs=require('fs'),p=require('child_process').execSync('git ls-files -o --exclude-standard src',{encoding:'utf8'}).trim().split('\n').filter(Boolean);for(const f of p){const s=fs.readFileSync(f,'utf8');const n=(s.match(/\n/g)||[]).length,c=(s.match(/\r\n/g)||[]).length;console.log(c===n?'CRLF oke':'LF PERBAIKI',f)}"
```

Expected: `CRLF oke` untuk `src/components/reader/use-url-pdf-segar.ts`, satu-satunya berkas baru di `src/**`. Berkas `tests/**` dikecualikan karena wajib LF.

- [ ] **Step 5: Tidak ada dash yang menyelinap**

```bash
node -e "const fs=require('fs'),cp=require('child_process');const files=cp.execSync('git ls-files src',{encoding:'utf8'}).trim().split('\n');let n=0;for(const f of files){const s=fs.readFileSync(f,'utf8');const d=s.match(/[\u2014\u2013]/g);if(d){n+=d.length;console.log(f,d.length)}}console.log('total dash='+n)"
```

Expected: hanya empat berkas lama yang sudah tercatat di ratchet dash (`src/db/queries.ts` 1, `src/db/seed.ts` 1, `src/lib/auth.ts` 2, `src/lib/bunny.ts` 2), total 6. Tidak boleh ada berkas reader yang muncul. Perintah `git grep` dengan kelas karakter dash tidak dipakai karena kelas byte membuat regex itu menangkap kecocokan palsu; pemindaian di atas membaca escape unicode langsung dari disk.

- [ ] **Step 6: Laporkan ke pengguna**

Isi laporan wajib:

1. Daftar berkas baru dan berkas ubah.
2. Angka test sebelum dan sesudah, dari keluaran perintah yang benar-benar dijalankan.
3. Kelima gerbang dengan exit code aslinya.
4. Hasil tiga bukti gigi: mutasi default 3600 di Task 1, mutasi `skemaSlug.parse` di Task 2, dan mutasi penjaga `sudahOtomatis` di Task 3, masing-masing dengan angka `mutasi exit` dan `pulih exit`.
5. Satu kalimat jujur bahwa kesetaraan perilaku di browser belum dibuktikan: tidak ada jsdom, dan penolakan 403 sungguhan dari Bunny hanya bisa diamati lewat uji live task #4 yang masih terblokir kredensial.
6. Keputusan yang sengaja diambil dan perlu diketahui pengguna: `.env.local` masih memasang `BUNNY_SIGNED_URL_EXPIRY_SECONDS=900` yang menimpa default 3600, jadi nilai itu harus diubah atau dihapus sendiri oleh pengguna, termasuk di environment Vercel. Aksi `perpanjangUrlBaca` sengaja publik tanpa tuntutan sesi karena reader memang boleh dibaca anonim, dan penyaring satu-satunya adalah `kitabTayangBySlug`.
7. Satu penyegaran otomatis mengunduh ulang seluruh PDF, jadi pada sesi panjang pengguna akan melihat satu jeda "Menyegarkan naskah…". Itu konsekuensi yang sudah disetujui, bukan cacat.

---

## Self-Review

**Cakupan terhadap pemicu rencana.** Empat gejala yang tercatat di bagian "Keadaan yang mendorong rencana ini" masing-masing punya task: masa berlaku terlalu pendek di Task 1, tidak ada jalur penanda-tanganan ulang di Task 2, penjaga loop di Task 3, dan tombol "Muat ulang" yang mengulang URL mati di Task 4 Step 2. Tautan "Buka berkas PDF di tab baru" ikut memakai URL aktif karena `href={url}` sekarang membaca state hook, bukan prop server.

**Pemindaian placeholder.** Tidak ada penanda pekerjaan tertunda, tidak ada "sesuaikan", "tangani edge case", atau "mirip Task N". Setiap langkah kode memuat isi lengkap, termasuk seluruh isi `halaman-pdf.tsx` pengganti dan seluruh isi berkas test baru.

**Konsistensi tipe dan nama.** `perpanjangUrlBaca(slugMentah: string): Promise<HasilUrlBaca>` dipakai identik di Task 2 (definisi) dan Task 4 (pemanggilan). `HasilUrlBaca` punya cabang `{ ok: true; url: string | null }`, dan hook di Task 4 memetakannya ke bentuk struktural `{ ok: boolean; url: string | null }` yang diminta `putuskanSegarkanUrl` di Task 3. `segarkan(otomatis: boolean): Promise<boolean>` dan `tandaiBerhasil(): void` dipakai di Task 4 Step 1 dan Step 2 dengan nama persis. `PESAN_BAKU` di test Task 2 dan `PESAN_GAGAL_URL` di implementasi Task 2 memuat string yang sama, `"Naskah belum dapat dimuat ulang. Coba lagi sebentar lagi."`; keduanya wajib tetap sinkron.

**Satu koreksi yang sudah dimasukkan ke langkah.** `skemaSlug` di Task 2 Step 3 merujuk `PESAN_TIPE`, yang baru dideklarasikan di baris 15. Langkah itu secara eksplisit memerintahkan penempatan sesudah `PESAN_TIPE`, bukan sesudah `skemaId`, supaya tidak ada `ReferenceError` saat modul dimuat.

**Yang tidak dijamin rencana ini.** Perilaku browser sungguhan. Tidak ada test render untuk hook maupun komponen, karena harness-nya tidak ada. Klaim apa pun soal "reader sudah pulih otomatis di browser" harus menunggu uji live task #4.
