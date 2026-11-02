# Pecah Komponen Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memecah empat komponen admin yang melewati 200 baris (`tabel-kitab.tsx` 354, `kerja-pengguna.tsx` 318, `kerja-entitas.tsx` 451, `form-kitab.tsx` 585) menjadi berkas-berkas fokus di bawah 200 baris tanpa mengubah perilaku satu bit pun.

**Architecture:** Dua lapis. (1) Logika murni yang hari ini bersembunyi di dalam closure komponen (penyaringan, penghitungan, validasi berkas, pembacaan balasan unggah) pindah ke modul `.ts` di `src/lib/` dan diuji dengan `node:test`. (2) JSX pindah utuh ke komponen saudaranya di `src/components/admin/`, sementara berkas induk tinggal sebagai wadah state + `useTransition` + pemanggil server action. Nama komponen yang diekspor dan tanda tangan prop-nya tidak berubah, jadi tidak ada satu pun berkas `src/app/` yang perlu disentuh.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript, react-hook-form 7 + zod 4 (sudah terpasang), Tailwind v4 dengan token semantik, Node built-in test runner (`node:test` + `node:assert/strict`) dengan `tsx`.

**Acuan:** `C:\LibraryKitab\AGENTS.md` aturan "Komponen React maksimal sekitar 200 baris. Pecah bila lebih" dan daftar ratchet `daftarDasar` di [tests/ui-higienis.test.ts](../../../tests/ui-higienis.test.ts). Tidak ada dokumen spec terpisah untuk pekerjaan ini; rencana adalah dokumen tertingginya.

**Di luar lingkup:** `src/components/reader/reader-shell.tsx` (546), `panel-samping.tsx` (462), `toolbar-baca.tsx` (235), dan berkas non-admin lain di atas 200 baris. Reader dikerjakan belakangan karena gerakan sentuh dan zoom hanya bisa dibuktikan lewat uji live, yang masih terblokir kredensial database.

## Global Constraints

Setiap tugas di bawah implicitly mengikuti baris-baris ini, dikutip apa adanya dari `AGENTS.md`:

- "Komponen React maksimal sekitar 200 baris. Pecah bila lebih."
- "Gunakan Server Components secara default. Tambahkan `\"use client\"` hanya bila butuh state, efek, atau event browser."
- "Logika akses dan query database ditaruh di `lib/` atau `db/`, bukan langsung di komponen UI."
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

1. **Kebijakan batas 200 baris ditegakkan oleh test, bukan oleh opini.** `tests/ui-higienis.test.ts` punya ratchet `daftarDasar` berisi peta `jalur -> jumlah baris` untuk setiap `.tsx` di atas 200 baris (`split("\n").length`, jadi 1 lebih besar dari `wc -l`). Berkas yang sudah turun ke 200 atau kurang **harus dihapus dari `daftarDasar`**; kalau tidak, test gagal karena entri itu tidak muncul lagi di hasil pemindaian.
2. **Transkripsi, jangan tebak.** Angka baseline baru diambil dari output test yang gagal, disalin apa adanya.
3. **Akhiri setiap tugas dengan tiga gerbang dan exit code nyata** (jangan menyimpulkan hijau dari pipe atau notifikasi latar):

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npm run lint; echo "lint exit=$?"
npm test; echo "test exit=$?"
```

Target: ketiganya `exit=0`. Tidak ada perintah `format:check` di `package.json`, jadi jangan mengarangnya.

4. **Akhiri setiap tugas dengan checkpoint ratchet:**

```bash
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

5. **Akhiri setiap tugas dengan bukti struktur:**

```bash
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){console.log(f.split('/').pop(), fs.readFileSync(f,'utf8').split('\n').length)}" src/components/admin/<setelah-pecah>.tsx
```

6. **Baris akhir.** Semua berkas `src/**` memakai CRLF; semua berkas `tests/**` memakai LF. `Write` menghasilkan LF, jadi setiap berkas baru di `src/` dinormalisasi lalu diverifikasi:

```bash
node -e "const fs=require('fs'),p=process.argv[1];const s=fs.readFileSync(p,'utf8');fs.writeFileSync(p,s.replace(/\r\n/g,'\n').replace(/\n/g,'\r\n'))" src/lib/admin-kitab.ts
node -e "const s=require('fs').readFileSync(process.argv[1],'utf8');const n=(s.match(/\n/g)||[]).length,c=(s.match(/\r\n/g)||[]).length;console.log(n===c&&n>0?'CRLF oke':'LF: perbaiki')" src/lib/admin-kitab.ts
```

Perintah cek yang benar membandingkan jumlah `\n` dengan jumlah `\r\n`; pola `/(^|\r)\n/g` menghitung CRLF dua kali dan menandai semua berkas.

7. **Jangan pernah commit.** HEAD dibiarkan di `e9321f8` sampai pengguna meminta secara eksplisit.
8. **Jangan ubah `src/app/**`.** Kalau sebuah tugas sampai menyentuh halaman, itu tanda prop berubah bentuk dan harus dibatalkan.

---

## Peta Berkas

| Berkas | Nasib | Tanggung jawab |
|---|---|---|
| `src/lib/admin-kitab.ts` | baru | saring + urut + opsi kategori + hitung status untuk tabel kitab |
| `src/components/admin/saringan-kitab.tsx` | baru | kartu pencarian, dua Select, chip jumlah, tautan unggah |
| `src/components/admin/daftar-kitab.tsx` | baru | tabel baris kitab + status Select + EmptyState |
| `src/components/admin/dialog-hapus-kitab.tsx` | baru | Dialog konfirmasi hapus satu kitab |
| `src/components/admin/tabel-kitab.tsx` | ubah 354→±95 | wadah: state, debounce, `useTransition`, panggil aksi |
| `src/lib/admin-pengguna.ts` | baru | tipe `BarisPengguna` + saring + hitung pengguna |
| `src/components/admin/saringan-pengguna.tsx` | baru | kartu pencarian, Select peran & akses, chip |
| `src/components/admin/daftar-pengguna.tsx` | baru | tabel baris pengguna + Switch + EmptyState |
| `src/components/admin/dialog-konfirmasi-pengguna.tsx` | baru | Dialog aktif/nonaktif |
| `src/components/admin/kerja-pengguna.tsx` | ubah 318→±100 | wadah state + aksi `useTransition` |
| `src/lib/admin-entitas.ts` | baru | tipe entitas (`EntitasNilai`, `EntitasBaris`, `BidangEntitas`, `KolomEntitas`) + `saringEntitas` + `hitungSlugOtomatis` |
| `src/components/admin/formulir-entitas.tsx` | baru | `FormulirEntitas` saat ini, utuh |
| `src/components/admin/tabel-entitas.tsx` | baru | tabel generik + EmptyState |
| `src/components/admin/dialog-hapus-entitas.tsx` | baru | Dialog hapus + proteksi `terkait` |
| `src/components/admin/kerja-entitas.tsx` | ubah 451→±130 | wadah toolbar, dialog form, dialog hapus |
| `src/components/admin/kelola-kategori.tsx` | ubah impor | ambil tipe dari `@/lib/admin-entitas` |
| `src/components/admin/kelola-pengarang.tsx` | ubah impor | sama |
| `src/lib/unggah-pdf-klien.ts` | baru | validasi berkas, muatan FormData, parse balasan, persen progres |
| `src/components/admin/bagian-metadata-kitab.tsx` | baru | section metadata (judul, fan, pengarang, syarah, tahun, halaman, deskripsi) |
| `src/components/admin/bagian-berkas-pdf.tsx` | baru | section PDF (berkas lama, dropzone, baris berkas, progres, alert) |
| `src/components/admin/bagian-status-publikasi.tsx` | baru | section radio status + pesan Globe |
| `src/components/admin/form-kitab.tsx` | ubah 585→±180 | `useForm`, unggah XHR, submit, footer |
| `tests/admin-kitab.test.ts`, `tests/admin-pengguna.test.ts`, `tests/admin-entitas.test.ts`, `tests/unggah-pdf-klien.test.ts` | baru | uji logika murni hasil ekstraksi |
| `tests/ui-higienis.test.ts` | ubah | `daftarDasar` menyusut per tugas |

## Urutan Tugas dan Alasannya

`tabel-kitab` (354) → `kerja-pengguna` (318) → `kerja-entitas` (451) → `form-kitab` (585). Dua pertama adalah polanya (satu kartu saring, satu tabel, satu dialog) dan risikonya kecil. `kerja-entitas` berikutnya karena pemecahannya memaksa tipe keluar dari komponen dan menyentuh dua konsumen. `form-kitab` terakhir karena paling besar dan satu-satunya yang punya unggahan XHR.

Setiap tugas adalah satu deliverable yang bisa diterima sendiri: reviewer bisa menyetujui Task 1 dan menolak Task 3 tanpa merusak Task 1.

---

## Task 1: Pecah `tabel-kitab.tsx`

**Files:**
- Create: `src/lib/admin-kitab.ts`
- Create: `tests/admin-kitab.test.ts`
- Create: `src/components/admin/saringan-kitab.tsx`
- Create: `src/components/admin/daftar-kitab.tsx`
- Create: `src/components/admin/dialog-hapus-kitab.tsx`
- Modify: `src/components/admin/tabel-kitab.tsx` (seluruh isi, dari 354 baris)
- Modify: `tests/ui-higienis.test.ts` (baseline `daftarDasar`)

**Interfaces:**
- Consumes: `KitabVe`, `StatusKitab` dari `@/db/queries` ([src/db/queries.ts:35-56](../../../src/db/queries.ts#L35)); `gantiStatusKitab`, `hapusKitab` dari `@/actions/kitab`; `KitabCover`, `StatusKitabBadge`, `EmptyState`.
- Produces:
  - `saringKitab(awal: KitabVe[], s: SaringanKitab): KitabVe[]`
  - `opsiFilterKategori(awal: KitabVe[]): [string, string][]`
  - `hitungStatusKitab(awal: KitabVe[]): { total: number; tayang: number; draf: number; arsip: number }`
  - `SEMUA = "semua"` (ekspor dari `@/lib/admin-kitab`)
  - Komponen `SaringanKitab`, `DaftarKitab`, `DialogHapusKitab` dan `TabelKitab({ awal }: { awal: KitabVe[] })` yang tanda tangannya identik dengan hari ini.

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/admin-kitab.test.ts` (LF). Fixture memakai `satisfies KitabVe` supaya TypeScript menolak kalau bentuknya menyimpang dari skema:

```ts
import assert from "node:assert/strict"
import { test } from "node:test"
import type { KitabVe } from "../src/db/queries"
import {
  SEMUA,
  hitungStatusKitab,
  opsiFilterKategori,
  saringKitab,
} from "../src/lib/admin-kitab"

const KATEGORI_A = { id: "k1", nama: "Nahwu", slug: "nahwu", deskripsi: "a" }
const KATEGORI_B = { id: "k2", nama: "Fiqih", slug: "fiqih", deskripsi: "b" }
const PENGARANG = {
  id: "p1",
  namaArab: "السيوطي",
  namaLatin: "Imam as-Suyuthi",
  tahunWafat: "911 H",
  biografiSingkat: "b",
}

function kitabSepenuhnya(ubah: Partial<KitabVe>): KitabVe {
  return {
    id: "1",
    judulLatin: "Alfiyah",
    judulArab: "الألفية",
    slug: "alfiyah",
    deskripsi: "a",
    kategoriId: "k1",
    pengarangId: "p1",
    syarahId: null,
    tahunTerbit: "1990 M",
    jumlahHalaman: 120,
    urlSampul: null,
    urlPdf: "https://cdn/lib/alfiyah.pdf",
    ukuranPdfByte: 2048,
    status: "published",
    jumlahDibuka: 3,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    kategori: KATEGORI_A,
    pengarang: PENGARANG,
    syarah: null,
    ...ubah,
  } satisfies KitabVe
}

const ALFIYAH = kitabSepenuhnya({})
const IBN_AQIL = kitabSepenuhnya({
  id: "2",
  judulLatin: "Syarah Ibn Aqil",
  judulArab: "شرح ابن عقيل",
  slug: "syarah-ibn-aqil",
  updatedAt: new Date("2026-03-01T00:00:00Z"),
})
const FIQIH_DRAF = kitabSepenuhnya({
  id: "3",
  judulLatin: "Fathul Qarib",
  slug: "fathul-qarib",
  kategoriId: "k2",
  kategori: KATEGORI_B,
  status: "draft",
  updatedAt: new Date("2026-02-01T00:00:00Z"),
})
const SEMUA_KITAB = [ALFIYAH, IBN_AQIL, FIQIH_DRAF]

test("saringKitab memakai default semua tanpa menyaring apa pun", () => {
  assert.deepEqual(
    saringKitab(SEMUA_KITAB, { kata: "", status: SEMUA, kategori: SEMUA }),
    [IBN_AQIL, FIQIH_DRAF, ALFIYAH],
    "Hasil harus terurut dari yang paling akhir diperbarui.",
  )
})

test("saringKitab mencari di judul Arab, judul Latin, pengarang, fan, dan slug", () => {
  for (const kata of ["شرح ابن عقيل", "Ibn Aqil", "as-Suyuthi", "Nahwu", "syarah-ibn-aqil"]) {
    assert.deepEqual(
      saringKitab(SEMUA_KITAB, { kata, status: SEMUA, kategori: SEMUA }).map((k) => k.id),
      ["2"],
      `Kata kunci "${kata}" harus menemukan Syarah Ibn Aqil.`,
    )
  }
})

test("saringKitab mengabaikan besar-kecil huruf dan spasi di tepi", () => {
  assert.deepEqual(
    saringKitab(SEMUA_KITAB, { kata: "  ALFIYAH  ", status: SEMUA, kategori: SEMUA }).map((k) => k.id),
    ["1"],
  )
})

test("saringKitab membatasi pada satu status dan satu kategori", () => {
  assert.deepEqual(
    saringKitab(SEMUA_KITAB, { kata: "", status: "draft", kategori: SEMUA }).map((k) => k.id),
    ["3"],
  )
  assert.deepEqual(
    saringKitab(SEMUA_KITAB, { kata: "", status: SEMUA, kategori: "k1" }).map((k) => k.id),
    ["2", "1"],
  )
  assert.deepEqual(
    saringKitab(SEMUA_KITAB, { kata: "alfiyah", status: "draft", kategori: SEMUA }),
    [],
    "Kombinasi saringan yang saling meniadakan menghasilkan daftar kosong.",
  )
})

test("opsiFilterKategori membuang duplikat dan mengurutkan nama dengan locale Indonesia", () => {
  assert.deepEqual(opsiFilterKategori(SEMUA_KITAB), [
    ["k2", "Fiqih"],
    ["k1", "Nahwu"],
  ])
})

test("hitungStatusKitab melaporkan bilangan tiap status beserta total", () => {
  assert.deepEqual(hitungStatusKitab(SEMUA_KITAB), {
    total: 3,
    tayang: 2,
    draf: 1,
    arsip: 0,
  })
  assert.deepEqual(hitungStatusKitab([]), { total: 0, tayang: 0, draf: 0, arsip: 0 })
})
```

- [ ] **Step 2: Jalankan test, pastikan gagal karena modul belum ada**

```bash
node --import tsx --experimental-test-module-mocks --test tests/admin-kitab.test.ts; echo "exit=$?"
```

Expected: `ERR_MODULE_NOT_FOUND` menyebut `src/lib/admin-kitab`, `exit=1`. Kalau test malah lolos, fixture-nya yang salah; perbaiki test, bukan implementasinya.

- [ ] **Step 3: Tulis implementasi minimal**

Buat `src/lib/admin-kitab.ts` (normalisasi CRLF):

```ts
import type { KitabVe } from "@/db/queries"

export const SEMUA = "semua"

export type SaringanKitab = { kata: string; status: string; kategori: string }

/**
 * Penyaringan sisi klien atas daftar kitab yang sudah dibawa dari server.
 * Urut newest-first dikunci di sini supaya tabel dan test memakai aturan sama.
 */
export function saringKitab(awal: KitabVe[], s: SaringanKitab): KitabVe[] {
  const q = s.kata.trim().toLowerCase()
  return awal
    .filter((kitab) => (s.status === SEMUA ? true : kitab.status === s.status))
    .filter((kitab) => (s.kategori === SEMUA ? true : kitab.kategoriId === s.kategori))
    .filter((kitab) => {
      if (!q) return true
      return [
        kitab.judulLatin,
        kitab.judulArab,
        kitab.pengarang.namaLatin,
        kitab.kategori.nama,
        kitab.slug,
      ].some((teks) => teks.toLowerCase().includes(q))
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

/** Pasangan [id, nama] untuk pilihan fan, tanpa duplikat, urut locale Indonesia. */
export function opsiFilterKategori(awal: KitabVe[]): [string, string][] {
  const peta = new Map<string, string>()
  for (const kitab of awal) peta.set(kitab.kategoriId, kitab.kategori.nama)
  return [...peta.entries()].sort((a, b) => a[1].localeCompare(b[1], "id"))
}

export function hitungStatusKitab(awal: KitabVe[]) {
  return {
    total: awal.length,
    tayang: awal.filter((k) => k.status === "published").length,
    draf: awal.filter((k) => k.status === "draft").length,
    arsip: awal.filter((k) => k.status === "archived").length,
  }
}
```

- [ ] **Step 4: Jalankan test, pastikan lolos**

```bash
node --import tsx --experimental-test-module-mocks --test tests/admin-kitab.test.ts; echo "exit=$?"
```

Expected: seluruh test pass, `exit=0`, tanpa warning.

- [ ] **Step 5: Pindahkan kartu saringan ke `saringan-kitab.tsx`**

Salin blok [src/components/admin/tabel-kitab.tsx:122-206](../../../src/components/admin/tabel-kitab.tsx#L122) apa adanya (judul label "Cari kitab", placeholder, dua Select, lima chip, tombol "Bersihkan saringan", tautan "Unggah kitab") ke berkas baru. Ganti hanya bacaan closure menjadi prop:

```tsx
"use client"

import { Plus, Search, X } from "lucide-react"
// impor Button, Input, Label, Select*, sama seperti di tabel-kitab.tsx

export function SaringanKitab({
  kata,
  status,
  kategori,
  kategoriOpsi,
  jumlah,
  adaSaringan,
  onKata,
  onStatus,
  onKategori,
  onBersihkan,
}: {
  kata: string
  status: string
  kategori: string
  kategoriOpsi: [string, string][]
  jumlah: { total: number; tayang: number; draf: number; arsip: number }
  adaSaringan: boolean
  onKata: (nilai: string) => void
  onStatus: (nilai: string) => void
  onKategori: (nilai: string) => void
  onBersihkan: () => void
}) {
  return (
    /* isi blok :122-206 dengan: `kata` tetap, `setKata(e.target.value)` → `onKata(e.target.value)`,
       `status`/`kategori` tetap, `setStatus`→`onStatus`, `setKategori`→`onKategori`,
       `kategoriOpsion.map`→`kategoriOpsi.map`,
       chip `awal.length`→`jumlah.total`, `jumlah.tayang`→`jumlah.tayang` (nama sama),
       kondisi tombol bersihkan → `adaSaringan`, onClick-nya → `onBersihkan` */
  )
}
```

- [ ] **Step 6: Pindahkan tabel + EmptyState ke `daftar-kitab.tsx`**

Salin [tabel-kitab.tsx:208-320](../../../src/components/admin/tabel-kitab.tsx#L208) apa adanya (EmptyState "Tidak ada kitab yang cocok", `Table` dengan `KitabCover sizes="micro"`, `StatusKitabBadge`, Select status per baris, `formatUkuranBerkas`, `waktuRelatif`, tiga tombol Eye/Pencil/Trash):

```tsx
"use client"

import type { KitabVe, StatusKitab } from "@/db/queries"
// Badge, Button, Dialog tidak diperlukan di sini; Link, Eye, FileText, Pencil, Trash2,
// KitabCover, StatusKitabBadge, EmptyState, Table*, format* sesuai kebutuhan blok aslinya

export function DaftarKitab({
  hasil,
  sedangDikerjakan,
  onGantiStatus,
  onAjukanHapus,
}: {
  hasil: KitabVe[]
  sedangDikerjakan: boolean
  onGantiStatus: (target: KitabVe, berikutnya: StatusKitab) => void
  onAjukanHapus: (target: KitabVe) => void
}) {
  return hasil.length === 0 ? (
    /* EmptyState lama, tanpa perubahan teks */
  ) : (
    /* Table lama; `gantiStatus(kitab, nilai as StatusKitab)` → `onGantiStatus(kitab, nilai as StatusKitab)`,
       `setKonfirmasi(kitab)` → `onAjukanHapus(kitab)`, `disabled={isPending}` → `disabled={sedangDikerjakan}` */
  )
}
```

- [ ] **Step 7: Pindahkan Dialog hapus ke `dialog-hapus-kitab.tsx`**

Salin [tabel-kitab.tsx:322-350](../../../src/components/admin/tabel-kitab.tsx#L322) apa adanya beserta `LABEL_STATUS` yang memang hanya dipakai di situ ([:36-40](../../../src/components/admin/tabel-kitab.tsx#L36)):

```tsx
"use client"

import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { KitabVe, StatusKitab } from "@/db/queries"

const LABEL_STATUS: Record<StatusKitab, string> = {
  published: "Tayang",
  draft: "Draf",
  archived: "Arsip",
}

export function DialogHapusKitab({
  target,
  sedangDikerjakan,
  onBatal,
  onHapus,
}: {
  target: KitabVe | null
  sedangDikerjakan: boolean
  onBatal: () => void
  onHapus: (target: KitabVe) => void
}) {
  return (
    <Dialog open={target !== null} onOpenChange={(buka) => !buka && onBatal()}>
      {/* sama seperti aslinya; `konfirmasi` → `target`, `isPending` → `sedangDikerjakan`,
          `setKonfirmasi(null)` → `onBatal()`, `onClick={hapus}` → `onClick={() => target && onHapus(target)}` */}
    </Dialog>
  )
}
```

- [ ] **Step 8: Rongangkan wadah `tabel-kitab.tsx`**

Berkas induk tinggal orkestrasi. Ganti seluruh isi [tabel-kitab.tsx](../../../src/components/admin/tabel-kitab.tsx) dengan:

```tsx
"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { gantiStatusKitab, hapusKitab } from "@/actions/kitab"
import { DaftarKitab } from "@/components/admin/daftar-kitab"
import { DialogHapusKitab } from "@/components/admin/dialog-hapus-kitab"
import { SaringanKitab } from "@/components/admin/saringan-kitab"
import {
  SEMUA,
  hitungStatusKitab,
  opsiFilterKategori,
  saringKitab,
} from "@/lib/admin-kitab"
import type { KitabVe, StatusKitab } from "@/db/queries"

export function TabelKitab({ awal }: { awal: KitabVe[] }) {
  const [kata, setKata] = useState("")
  const [kataDiterapkan, setKataDiterapkan] = useState("")
  const [status, setStatus] = useState<string>(SEMUA)
  const [kategori, setKategori] = useState<string>(SEMUA)
  const [konfirmasi, setKonfirmasi] = useState<KitabVe | null>(null)
  const [isPending, jalankan] = useTransition()

  useEffect(() => {
    const jeda = setTimeout(() => setKataDiterapkan(kata.trim().toLowerCase()), 300)
    return () => clearTimeout(jeda)
  }, [kata])

  const kategoriOpsi = useMemo(() => opsiFilterKategori(awal), [awal])
  const hasil = useMemo(
    () => saringKitab(awal, { kata: kataDiterapkan, status, kategori }),
    [awal, kataDiterapkan, status, kategori],
  )
  const jumlah = useMemo(() => hitungStatusKitab(awal), [awal])

  /** Daftar dibaca ulang lewat `revalidatePath` pada aksi, jadi tidak ada salinan lokal. */
  function hapus(target: KitabVe) {
    setKonfirmasi(null)
    jalankan(async () => {
      const respons = await hapusKitab(target.id)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      toast.success(respons.pesan)
    })
  }

  function gantiStatus(target: KitabVe, berikutnya: StatusKitab) {
    if (berikutnya === target.status) return
    jalankan(async () => {
      const respons = await gantiStatusKitab(target.id, berikutnya)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      toast.success(respons.pesan)
    })
  }

  return (
    <div className="space-y-5">
      <SaringanKitab
        kata={kata}
        status={status}
        kategori={kategori}
        kategoriOpsi={kategoriOpsi}
        jumlah={jumlah}
        adaSaringan={Boolean(kataDiterapkan) || status !== SEMUA || kategori !== SEMUA}
        onKata={setKata}
        onStatus={setStatus}
        onKategori={setKategori}
        onBersihkan={() => {
          setKata("")
          setStatus(SEMUA)
          setKategori(SEMUA)
        }}
      />
      <DaftarKitab
        hasil={hasil}
        sedangDikerjakan={isPending}
        onGantiStatus={gantiStatus}
        onAjukanHapus={setKonfirmasi}
      />
      <DialogHapusKitab
        target={konfirmasi}
        sedangDikerjakan={isPending}
        onBatal={() => setKonfirmasi(null)}
        onHapus={hapus}
      />
    </div>
  )
}
```

Catatan bentuk: `saringKitab` menerima `kata` yang sudah di-lowercase dari state debounce, jadi `trim().toLowerCase()` di dalam modul tetap aman (idempoten) dan tidak mengubah hasil.

- [ ] **Step 9: Gerbang**

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npm run lint; echo "lint exit=$?"
node --import tsx --experimental-test-module-mocks --test tests/ui-higienis.test.ts; echo "ratchet exit=$?"
```

Ratchet **diharapkan gagal** di langkah ini dengan `actual` yang tidak lagi memuat `src/components/admin/tabel-kitab.tsx`. Salin peta `ditemukan` dari output, hapus entri tabel-kitab dari `daftarDasar` di [tests/ui-higienis.test.ts](../../../tests/ui-higienis.test.ts), jalankan lagi sampai `exit=0`.

- [ ] **Step 10: Bukti struktur**

```bash
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){console.log(f.split('/').pop(), fs.readFileSync(f,'utf8').split('\n').length)}" src/components/admin/tabel-kitab.tsx src/components/admin/saringan-kitab.tsx src/components/admin/daftar-kitab.tsx src/components/admin/dialog-hapus-kitab.tsx
```

Expected: keempatnya ≤ 200. Kalau `daftar-kitab.tsx` lewat 200, sel "Judul" (tiga baris teks + cover) dipecah jadi `SelJudulKitab` di berkas yang sama; jangan memindahkan tabel ke berkas lain.

- [ ] **Step 11: CRLF untuk berkas `src/**` baru, lalu LF check test**

Keempat berkas `src/` baru dinormalisasi ke CRLF lalu diverifikasi dengan perintah pada Aturan teknis #6 (target keluaran: `CRLF oke`). Berkas `tests/admin-kitab.test.ts` harus tetap LF; verifikasi dengan perintah yang sama dan target keluaran `LF: perbaiki` berarti benar untuk berkas test (jangan menormalkannya). Terakhir, pastikan `git status --short` hanya menampilkan berkas yang benar-benar berubah isi.

- [ ] **Step 12: `npm test` penuh**

```bash
npm test; echo "test exit=$?"
```

Expected: `exit=0`. Jumlah test naik dari 215 menjadi 221.

---

## Task 2: Pecah `kerja-pengguna.tsx`

**Files:**
- Create: `src/lib/admin-pengguna.ts`
- Create: `tests/admin-pengguna.test.ts`
- Create: `src/components/admin/saringan-pengguna.tsx`
- Create: `src/components/admin/daftar-pengguna.tsx`
- Create: `src/components/admin/dialog-konfirmasi-pengguna.tsx`
- Modify: `src/components/admin/kerja-pengguna.tsx`
- Modify: `tests/ui-higienis.test.ts` (baseline)

**Interfaces:**
- Consumes: `PenggunaVe`, `Role`, `StatusPengguna` dari `@/db/queries` ([src/db/queries.ts:20-22,58-69](../../../src/db/queries.ts#L20)); `ubahPeranAnggota`, `ubahStatusAnggota` dari `@/actions/pengguna`; `Avatar`, `Switch`, `StatusPenggunaBadge`, `formatTanggal`, `inisialNama`.
- Produces: `BarisPengguna`, `SaringanPengguna`, `saringPengguna(awal, s): BarisPengguna[]`, `hitungPengguna(awal): { total: number; nonaktif: number; pengelola: number }`, `SEMUA` (impor ulang dari `@/lib/admin-kitab` tidak perlu; ekspor konstanta yang sama dari modul pengguna agar tidak saling bergantung), `SaringanPengguna` dan `DaftarPengguna` serta `DialogKonfirmasiPengguna`.

- [ ] **Step 1: Tulis test yang gagal**

`tests/admin-pengguna.test.ts`:

```ts
import assert from "node:assert/strict"
import { test } from "node:test"
import type { PenggunaVe } from "../src/db/queries"
import { SEMUA, hitungPengguna, saringPengguna, type BarisPengguna } from "../src/lib/admin-pengguna"

function akun(ubah: Partial<PenggunaVe>): PenggunaVe {
  return {
    id: "u1",
    clerkId: "clerk_u1",
    email: "santri@pesantren.id",
    namaLengkap: "Ahmad Fauzan",
    jenisPeran: "santri",
    kelas: "Wusto 1",
    role: "member",
    status: "aktif",
    fontSizePreferensi: 18,
    createdAt: new Date("2026-05-01T00:00:00Z"),
    ...ubah,
  } satisfies PenggunaVe
}

const baris = (pengguna: PenggunaVe, b = 0, c = 0, r = 0): BarisPengguna => ({
  pengguna,
  jumlahBookmark: b,
  jumlahCatatan: c,
  jumlahRiwayat: r,
})

const SANTRI = baris(akun({}))
const USTADZ = baris(
  akun({ id: "u2", namaLengkap: "Ustadz Sulaiman", email: "ustadz@pesantren.id", jenisPeran: "ustadz", kelas: "" }),
  4, 2, 1,
)
const PENGELOLA = baris(
  akun({ id: "u3", namaLengkap: "Pengelola Masjid", email: "admin@pesantren.id", role: "admin", status: "nonaktif" }),
  0, 0, 0,
)
const SEMUA_BARIS = [SANTRI, USTADZ, PENGELOLA]

test("saringPengguna default menampilkan semua tanpa mengubah urutan", () => {
  assert.deepEqual(
    saringPengguna(SEMUA_BARIS, { kata: "", peran: SEMUA, akses: SEMUA }),
    SEMUA_BARIS,
  )
})

test("saringPengguna mencari di nama, email, dan kelas", () => {
  const cek = (kata: string) =>
    saringPengguna(SEMUA_BARIS, { kata, peran: SEMUA, akses: SEMUA }).map((r) => r.pengguna.id)
  assert.deepEqual(cek("fauzan"), ["u1"])
  assert.deepEqual(cek("USTADZ@PESANTREN.ID"), ["u2"])
  assert.deepEqual(cek("wusto"), ["u1"], "Kelas ikut dicari.")
  assert.deepEqual(cek("  "), SEMUA_BARIS.map((r) => r.pengguna.id), "Spasi bukan kata kunci.")
})

test("saringPengguna memisahkan akun yang belum diisi peran", () => {
  const TANPA_PERAN = baris(akun({ id: "u4", jenisPeran: null }))
  const daftar = [...SEMUA_BARIS, TANPA_PERAN]
  assert.deepEqual(
    saringPengguna(daftar, { kata: "", peran: "belum-diisi", akses: SEMUA }).map((r) => r.pengguna.id),
    ["u4"],
  )
  assert.deepEqual(
    saringPengguna(SEMUA_BARIS, { kata: "", peran: "ustadz", akses: SEMUA }).map((r) => r.pengguna.id),
    ["u2"],
  )
})

test("saringPengguna menggabungkan peran dan hak akses", () => {
  assert.deepEqual(
    saringPengguna(SEMUA_BARIS, { kata: "", peran: "santri", akses: "admin" }),
    [],
    "Santri sekaligus pengelola tidak ada di data ini.",
  )
  assert.deepEqual(
    saringPengguna(SEMUA_BARIS, { kata: "", peran: SEMUA, akses: "admin" }).map((r) => r.pengguna.id),
    ["u3"],
  )
})

test("hitungPengguna melaporkan nonaktif dan pengelola", () => {
  assert.deepEqual(hitungPengguna(SEMUA_BARIS), { total: 3, nonaktif: 1, pengelola: 1 })
  assert.deepEqual(hitungPengguna([]), { total: 0, nonaktif: 0, pengelola: 0 })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal**

```bash
node --import tsx --experimental-test-module-mocks --test tests/admin-pengguna.test.ts; echo "exit=$?"
```
Expected: `ERR_MODULE_NOT_FOUND` untuk `src/lib/admin-pengguna`, `exit=1`.

- [ ] **Step 3: Implementasi minimal**

`src/lib/admin-pengguna.ts` (CRLF):

```ts
import type { PenggunaVe } from "@/db/queries"

export const SEMUA = "semua"

export type BarisPengguna = {
  pengguna: PenggunaVe
  jumlahBookmark: number
  jumlahCatatan: number
  jumlahRiwayat: number
}

export type SaringanPengguna = { kata: string; peran: string; akses: string }

export function saringPengguna(awal: BarisPengguna[], s: SaringanPengguna): BarisPengguna[] {
  const q = s.kata.trim().toLowerCase()
  return awal.filter((baris) => {
    if (s.peran !== SEMUA) {
      const nilai = baris.pengguna.jenisPeran ?? "belum-diisi"
      if (nilai !== s.peran) return false
    }
    if (s.akses !== SEMUA && baris.pengguna.role !== s.akses) return false
    if (!q) return true
    return [baris.pengguna.namaLengkap, baris.pengguna.email, baris.pengguna.kelas].some((teks) =>
      teks.toLowerCase().includes(q),
    )
  })
}

export function hitungPengguna(awal: BarisPengguna[]) {
  return {
    total: awal.length,
    nonaktif: awal.filter((b) => b.pengguna.status === "nonaktif").length,
    pengelola: awal.filter((b) => b.pengguna.role === "admin").length,
  }
}
```

- [ ] **Step 4: Jalankan, pastikan lolos** (`exit=0`).

- [ ] **Step 5: Pindahkan kartu saringan**

Salin [kerja-pengguna.tsx:112-173](../../../src/components/admin/kerja-pengguna.tsx#L112) ke `saringan-pengguna.tsx`. Ganti bacaan closure: `setKata`→`onKata`, `setPeran`→`onPeran`, `setAkses`→`onAkses`, `awal.length`→`jumlah.total`, `jumlahNonaktif`→`jumlah.nonaktif`, filter `admin` inline→`jumlah.pengelola`. Catatan kaki "Menonaktifkan akun tidak menghapus bookmark dan catatan." tetap utuh (tidak ada dash).

```tsx
export function SaringanPengguna({
  kata,
  peran,
  akses,
  jumlah,
  onKata,
  onPeran,
  onAkses,
}: {
  kata: string
  peran: string
  akses: string
  jumlah: { total: number; nonaktif: number; pengelola: number }
  onKata: (nilai: string) => void
  onPeran: (nilai: string) => void
  onAkses: (nilai: string) => void
}) { /* … */ }
```

- [ ] **Step 6: Pindahkan tabel + EmptyState**

Salin [kerja-pengguna.tsx:175-276](../../../src/components/admin/kerja-pengguna.tsx#L175) ke `daftar-pengguna.tsx`. Ganti: `isPending`→`sedangDikerjakan`, `pengelolaId` tetap (prop, dipakai untuk men-disable kontrol diri sendiri), `ubahPeran(row, nilai)`→`onUbahPeran(row, nilai)`, `setKonfirmasi(row)`→`onAjukanUbahStatus(row)`. Percabakan teks EmptyState (`awal.length === 0` vs hasil kosong) menjadi satu prop `adaData: boolean`.

```tsx
export function DaftarPengguna({
  hasil,
  adaData,
  sedangDikerjakan,
  pengelolaId,
  onUbahPeran,
  onAjukanUbahStatus,
}: {
  hasil: BarisPengguna[]
  adaData: boolean
  sedangDikerjakan: boolean
  pengelolaId: string
  onUbahPeran: (target: BarisPengguna, role: string) => void
  onAjukanUbahStatus: (target: BarisPengguna) => void
}) { /* … */ }
```

- [ ] **Step 7: Pindahkan Dialog konfirmasi**

Salin [kerja-pengguna.tsx:278-314](../../../src/components/admin/kerja-pengguna.tsx#L278) ke `dialog-konfirmasi-pengguna.tsx`. `konfirmasi`→`target`, `isPending`→`sedangDikerjakan`, `ubahStatus(konfirmasi)`→`onKonfirmasi(target)`, `setKonfirmasi(null)`→`onBatal()`. Teks deskripsi "Akun tidak dapat masuk..." tetap di wadah (sudah ada di handler toast), dialog hanya membawa kalimatnya sendiri.

```tsx
export function DialogKonfirmasiPengguna({
  target,
  sedangDikerjakan,
  onBatal,
  onKonfirmasi,
}: {
  target: BarisPengguna | null
  sedangDikerjakan: boolean
  onBatal: () => void
  onKonfirmasi: (target: BarisPengguna) => void
}) { /* … */ }
```

- [ ] **Step 8: Rongangkan wadah `kerja-pengguna.tsx`**

```tsx
"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { ubahPeranAnggota, ubahStatusAnggota } from "@/actions/pengguna"import { DaftarPengguna } from "@/components/admin/daftar-pengguna"
import { DialogKonfirmasiPengguna } from "@/components/admin/dialog-konfirmasi-pengguna"
import { SaringanPengguna } from "@/components/admin/saringan-pengguna"
import { SEMUA, hitungPengguna, saringPengguna, type BarisPengguna } from "@/lib/admin-pengguna"
import type { Role } from "@/db/queries"

export type { BarisPengguna } from "@/lib/admin-pengguna"
```

Baris terakhir (`export type`) bukan shim untuk kode: `BarisPengguna` hanya dipakai halaman lain lewat impor tipe, dan mengekspornya kembali menjaga [admin/pengguna/page.tsx](../../../src/app/(admin)/admin/pengguna/page.tsx) serta impor masa depan tidak pecah sementara implementasinya tinggal satu tempat. Kalau reviewer menolak baris ini, hapus dan pindahkan impor ke `@/lib/admin-pengguna`.

Isi wadah: state `kata/peran/akses/konfirmasi`, `useTransition`, `hasil = useMemo(() => saringPengguna(awal, { kata, peran, akses }), ...)`, `jumlah = useMemo(() => hitungPengguna(awal), [awal])`, lalu `ubahStatus(target)` dan `ubahPeran(target, role)` persis seperti [kerja-pengguna.tsx:83-108](../../../src/components/admin/kerja-pengguna.tsx#L83) termasuk deskripsi toast `Akun tidak dapat masuk atau membuka bookmark sampai diaktifkan lagi.` dan `Akun kembali memperoleh akses penuh sebagai member.`. JSX return hanya tiga komponen saudaranya.

- [ ] **Step 9-12: Gerbang, bukti baris, CRLF, `npm test`**

Perintah sama seperti Task 1 Step 9-12. Ratchet: hapus `src/components/admin/kerja-pengguna.tsx` dari `daftarDasar`. `npm test` naik menjadi 226 test.

---

## Task 3: Pecah `kerja-entitas.tsx`

**Files:**
- Create: `src/lib/admin-entitas.ts`
- Create: `tests/admin-entitas.test.ts`
- Create: `src/components/admin/formulir-entitas.tsx`
- Create: `src/components/admin/tabel-entitas.tsx`
- Create: `src/components/admin/dialog-hapus-entitas.tsx`
- Modify: `src/components/admin/kerja-entitas.tsx`
- Modify: `src/components/admin/kelola-kategori.tsx:5-9`
- Modify: `src/components/admin/kelola-pengarang.tsx:5-9`
- Modify: `tests/ui-higienis.test.ts` (baseline)

**Interfaces:**
- Consumes: `ZodType<EntitasNilai, EntitasNilai>` dari `zod`; `HasilAksi` dari `@/actions/tipe`; `slugify` dari `@/lib/format`; `Alert`, `Dialog*`, `Table*`, `EmptyState`, `Button`, `Input`, `Label`, `Textarea`.
- Produces: tipe `EntitasNilai`, `EntitasBaris`, `BidangEntitas`, `KolomEntitas` **berpindah rumah** ke `@/lib/admin-entitas`; `saringEntitas(barisAwal, kata): EntitasBaris[]`; `hitungSlugOtomatis(bidang, nilaiSumber): { kunci: string; nilai: string } | null`; `FormulirEntitas` dengan prop yang sama seperti versi privat hari ini; `TabelEntitas`; `DialogHapusEntitas`; `KerjaEntitas` dengan props yang tidak berubah sama sekali.

- [ ] **Step 1: Tulis test yang gagal**

`tests/admin-entitas.test.ts`:

```ts
import assert from "node:assert/strict"
import { test } from "node:test"
import {
  hitungSlugOtomatis,
  saringEntitas,
  type EntitasBaris,
} from "../src/lib/admin-entitas"

const NAHWU: EntitasBaris = {
  id: "k1",
  nilai: { nama: "Nahwu", slug: "nahwu", deskripsi: "Ilmu tentang irab." },
  terkait: 4,
}
const FIQIH: EntitasBaris = {
  id: "k2",
  nilai: { nama: "Ushul Fiqih", slug: "ushul-fiqih", deskripsi: "Sumber hukum." },
  terkait: 0,
}
const ARAB: EntitasBaris = {
  id: "k3",
  nilai: { nama: "Shorof", namaArab: "الصرف", slug: "shorof", deskripsi: "Perubahan kata." },
  terkait: 2,
}
const SEMUA_BARIS = [NAHWU, FIQIH, ARAB]

test("saringEntitas mencari di semua bidang nilai, termasuk field Arab", () => {
  assert.deepEqual(saringEntitas(SEMUA_BARIS, ""), SEMUA_BARIS)
  assert.deepEqual(saringEntitas(SEMUA_BARIS, "ushul").map((b) => b.id), ["k2"])
  assert.deepEqual(saringEntitas(SEMUA_BARIS, "الصرف").map((b) => b.id), ["k3"])
  assert.deepEqual(saringEntitas(SEMUA_BARIS, "sumber hukum").map((b) => b.id), ["k2"])
  assert.deepEqual(saringEntitas(SEMUA_BARIS, "   "), SEMUA_BARIS, "Spasi bukan kata kunci.")
})

test("saringEntitas mengabaikan besar-kecil huruf", () => {
  assert.deepEqual(saringEntitas(SEMUA_BARIS, "SHOROF").map((b) => b.id), ["k3"])
})

test("hitungSlugOtomatis menurunkan slug dari bidang sumber", () => {
  const bidang = [
    { kunci: "nama", label: "Nama", jenis: "teks" as const },
    { kunci: "slug", label: "Slug", jenis: "slug" as const, slugDari: "nama" },
  ]
  assert.deepEqual(hitungSlugOtomatis(bidang, "Ushul Fiqih"), { kunci: "slug", nilai: "ushul-fiqih" })
})

test("hitungSlugOtomatis netral untuk nilai yang slug-nya sudah sama", () => {
  const bidang = [
    { kunci: "nama", label: "Nama", jenis: "teks" as const },
    { kunci: "slug", label: "Slug", jenis: "slug" as const, slugDari: "nama" },
  ]
  assert.deepEqual(hitungSlugOtomatis(bidang, "nahwu"), { kunci: "slug", nilai: "nahwu" })
})

test("hitungSlugOtomatis mengembalikan null bila tidak ada bidang slug", () => {
  const bidang = [{ kunci: "nama", label: "Nama", jenis: "teks" as const }]
  assert.equal(hitungSlugOtomatis(bidang, "Nahwu"), null)
})

test("hitungSlugOtomatis mengembalikan null bila bidang slug tidak menunjuk sumber", () => {
  const bidang = [{ kunci: "slug", label: "Slug", jenis: "slug" as const }]
  assert.equal(hitungSlugOtomatis(bidang, "Nahwu"), null)
})
```

- [ ] **Step 2: Jalankan, pastikan gagal** `ERR_MODULE_NOT_FOUND` untuk `src/lib/admin-entitas`, `exit=1`.

- [ ] **Step 3: Implementasi minimal**

`src/lib/admin-entitas.ts` (CRLF). Tipe dipindah apa adanya dari [kerja-entitas.tsx:42-58](../../../src/components/admin/kerja-entitas.tsx#L42):

```ts
import type { ReactNode } from "react"
import { slugify } from "@/lib/format"

export type EntitasNilai = Record<string, string>

export type EntitasBaris = {
  id: string
  nilai: EntitasNilai
  /** Jumlah kitab yang masih memakai entitas ini; dipakai untuk proteksi hapus. */
  terkait?: number
}

export type BidangEntitas = {
  kunci: string
  label: string
  jenis: "teks" | "arab" | "textarea" | "slug"
  petunjuk?: string
  /** Kunci bidang sumber otomatis untuk bidang slug. */
  slugDari?: string
  baris?: number
}

export type KolomEntitas = {
  label: string
  sel: (baris: EntitasBaris) => ReactNode
  className?: string
}

export function saringEntitas(barisAwal: EntitasBaris[], kata: string): EntitasBaris[] {
  const q = kata.trim().toLowerCase()
  if (!q) return barisAwal
  return barisAwal.filter((baris) =>
    Object.values(baris.nilai).some((nilai) => nilai.toLowerCase().includes(q)),
  )
}

/**
 * Bidang slug mengikuti bidang sumber selama pengelola belum mengetik slug sendiri.
 * Mengembalikan kunci target plus nilai hasil slugify, atau null bila tidak ada bidang slug.
 */
export function hitungSlugOtomatis(
  bidang: BidangEntitas[],
  nilaiSumber: unknown,
): { kunci: string; nilai: string } | null {
  const target = bidang.find((item) => item.jenis === "slug")
  if (!target?.slugDari) return null
  return { kunci: target.kunci, nilai: slugify(String(nilaiSumber ?? "")) }
}
```

- [ ] **Step 4: Jalankan, pastikan lolos** (`exit=0`).

- [ ] **Step 5: Pindahkan `FormulirEntitas` ke berkasnya sendiri**

Salin [kerja-entitas.tsx:312-450](../../../src/components/admin/kerja-entitas.tsx#L312) utuh ke `src/components/admin/formulir-entitas.tsx`, tambahkan `"use client"` di baris 1, ubah `function FormulirEntitas(` menjadi `export function FormulirEntitas(`, dan ganti efek slug manual dengan helper baru:

```tsx
  const kunciSlug = bidang.find((item) => item.jenis === "slug")
  const [slugDimanual, setSlugDimanual] = useState(
    Boolean(nilai && kunciSlug && nilai[kunciSlug.kunci]),
  )
  const nilaiSumber = watch(kunciSlug?.slugDari ?? "__tanpa_sumber")

  useEffect(() => {
    if (slugDimanual) return
    const hasil = hitungSlugOtomatis(bidang, nilaiSumber)
    if (hasil) setValue(hasil.kunci, hasil.nilai, { shouldDirty: true })
  }, [bidang, nilaiSumber, slugDimanual, setValue])
```

Perilaku sama: tanpa bidang slug, `hitungSlugOtomatis` mengembalikan `null` dan efek tidak menulis apa pun. Impor tipe diambil dari `@/lib/admin-entitas`, bukan dari `kerja-entitas`.

- [ ] **Step 6: Pindahkan tabel generik**

Salin [kerja-entitas.tsx:171-242](../../../src/components/admin/kerja-entitas.tsx#L171) ke `tabel-entitas.tsx` dengan tanda tangan:

```tsx
"use client"

import { Layers, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/site/primitives"
import { cn } from "@/lib/utils"
import type { EntitasBaris, KolomEntitas } from "@/lib/admin-entitas"

export function TabelEntitas({
  namaEntitas,
  kolom,
  hasil,
  adaData,
  sedangDikerjakan,
  onUbah,
  onHapus,
}: {
  namaEntitas: string
  kolom: KolomEntitas[]
  hasil: EntitasBaris[]
  adaData: boolean
  sedangDikerjakan: boolean
  onUbah: (target: EntitasBaris) => void
  onHapus: (target: EntitasBaris) => void
}) { /* blok :171-242 dengan setFormTerbuka→onUbah, setKonfirmasiHapus→onHapus, isPending→sedangDikerjakan */ }
```

Dua pesan EmptyState tetap seperti aslinya, termasuk `Tambahkan ${namaEntitas.toLowerCase()} pertama lewat tombol di atas agar kitab dapat memakai data ini.`

- [ ] **Step 7: Pindahkan Dialog hapus**

Salin [kerja-entitas.tsx:264-307](../../../src/components/admin/kerja-entitas.tsx#L264) ke `dialog-hapus-entitas.tsx`:

```tsx
export function DialogHapusEntitas({
  namaEntitas,
  target,
  sedangDikerjakan,
  onBatal,
  onKonfirmasi,
}: {
  namaEntitas: string
  target: EntitasBaris | null
  sedangDikerjakan: boolean
  onBatal: () => void
  onKonfirmasi: (target: EntitasBaris) => void
}) { /* … `konfirmasiHapus`→`target`, `isPending`→`sedangDikerjakan` */ }
```

Perhatian: teks "Barisnya dihapus dari database dan tindakannya dicatat pada log_admin." wajib dipertahankan; dia adalah bukti audit trail yang sudah diverifikasi Keamanan 3.

- [ ] **Step 8: Rongangkan `kerja-entitas.tsx`**

```tsx
"use client"

import { useMemo, useState, useTransition } from "react"
import { Plus, Search, X } from "lucide-react"
import type { ZodType } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DialogHapusEntitas } from "@/components/admin/dialog-hapus-entitas"
import { FormulirEntitas } from "@/components/admin/formulir-entitas"
import { TabelEntitas } from "@/components/admin/tabel-entitas"
import { saringEntitas, type EntitasBaris, type EntitasNilai, type BidangEntitas, type KolomEntitas } from "@/lib/admin-entitas"
import { toast } from "sonner"
import type { HasilAksi } from "@/actions/tipe"
```

Wadah mempertahankan: `kata`, `formTerbuka`, `sedangUbah`, `konfirmasiHapus`, `errorBidang`, `isPending/jalankan`, `bukaForm`, `tutupForm`, `simpan`, `hapus` (semua dari [kerja-entitas.tsx:80-137](../../../src/components/admin/kerja-entitas.tsx#L80) tanpa perubahan), plus JSX toolbar pencarian (:141-169) yang memanggil `saringEntitas(barisAwal, kata)` di `useMemo`, lalu `<TabelEntitas>`, `<Dialog>` form (:244-262), `<DialogHapusEntitas>`.

- [ ] **Step 9: Perbarui dua konsumen tipe**

[kelola-kategori.tsx:5-9](../../../src/components/admin/kelola-kategori.tsx#L5) dan [kelola-pengarang.tsx:5-9](../../../src/components/admin/kelola-pengarang.tsx#L5) berubah menjadi:

```tsx
import { KerjaEntitas } from "@/components/admin/kerja-entitas"
import type {
  BidangEntitas,
  EntitasBaris,
  KolomEntitas,
} from "@/lib/admin-entitas"
```

Tanpa shim, tanpa re-export. Sisa isi kedua berkas tidak disentuh.

- [ ] **Step 10-13: Gerbang, baseline ratchet, bukti baris, `npm test`**

Perintah Task 1 Step 9-12. Ratchet: hapus `src/components/admin/kerja-entitas.tsx` dari `daftarDasar`. Expected akhir: `tsc exit=0`, `lint exit=0`, `npm test` 232 test lolos.

---

## Task 4: Pecah `form-kitab.tsx`

**Files:**
- Create: `src/lib/unggah-pdf-klien.ts`
- Create: `tests/unggah-pdf-klien.test.ts`
- Create: `src/components/admin/bagian-metadata-kitab.tsx`
- Create: `src/components/admin/bagian-berkas-pdf.tsx`
- Create: `src/components/admin/bagian-status-publikasi.tsx`
- Modify: `src/components/admin/form-kitab.tsx`
- Modify: `tests/ui-higienis.test.ts` (baseline)

**Interfaces:**
- Consumes: `KitabInput` + `skemaKitab` dari `@/lib/validasi`; `MAKS_PDF_MB` dari `@/lib/site`; `formatUkuranBerkas`, `slugify`, `waktuRelatif` dari `@/lib/format`; `simpanKitab` dari `@/actions/kitab`; `OpsiPilhan` **dari `@/db/queries`** ([src/db/queries.ts:799](../../../src/db/queries.ts#L799)) sehingga duplikat lokal di [form-kitab.tsx:40](../../../src/components/admin/form-kitab.tsx#L40) dihapus; `ProgresBar`, `Alert*`, `Badge`, `Button`, `Input`, `Label`, `Select*`, `Textarea`.
- Produces: `type BerkasTersimpan`, `type ResponsUnggah`, `validasiBerkasPdf(file, maksMb): { judul: string; deskripsi?: string } | null`, `buatMuatanPdf(file, slug, idKitab): FormData`, `persenProgres(loaded, total, lengthComputable): number | null`, `bacaResponsUnggah(teks, status, byteCadangan): { ok: true; berkas: BerkasTersimpan } | { ok: false; pesan: string }`, tiga komponen `Bagian*`, dan `FormKitab` dengan props yang tidak berubah.

- [ ] **Step 1: Tulis test yang gagal**

`tests/unggah-pdf-klien.test.ts`:

```ts
import assert from "node:assert/strict"
import { test } from "node:test"
import {
  bacaResponsUnggah,
  buatMuatanPdf,
  persenProgres,
  validasiBerkasPdf,
} from "../src/lib/unggah-pdf-klien"

const pdf = (nama = "alfiyah.pdf", byte = 1024) =>
  new File([new Uint8Array(byte)], nama, { type: "application/pdf" })

test("validasiBerkasPdf menerima PDF berdasarkan mime", () => {
  assert.equal(validasiBerkasPdf(pdf(), 150), null)
})

test("validasiBerkasPdf menerima berkas tanpa mime PDF tetapi berekstensi .pdf", () => {
  const aneh = new File([new Uint8Array(10)], "KITAB.PDF", { type: "" })
  assert.equal(validasiBerkasPdf(aneh, 150), null)
})

test("validasiBerkasPdf menolak format lain dengan pesan Indonesia", () => {
  const salah = new File([new Uint8Array(10)], "kitab.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
  assert.deepEqual(validasiBerkasPdf(salah, 150), {
    judul: "Format berkas tidak didukung",
    deskripsi: "Unggah berkas berformat PDF.",
  })
})

test("validasiBerkasPdf menolak berkas di atas batas ukuran", () => {
  const besar = pdf("gede.pdf", 3 * 1024 * 1024)
  assert.deepEqual(validasiBerkasPdf(besar, 2), {
    judul: "Berkas terlalu besar",
    deskripsi: "Maksimal 2 MB, ukuran berkas ini 3 MB.",
  })
})

test("validasiBerkasPdf menerima berkas tepat di batas", () => {
  assert.equal(validasiBerkasPdf(pdf("pas.pdf", 2 * 1024 * 1024), 2), null)
})

test("buatMuatanPdf mengirim berkas, slug, dan id kitab target", () => {
  const berkas = pdf()
  const muatan = buatMuatanPdf(berkas, "Alfiyah", "k-1")
  assert.equal(muatan.get("slug"), "Alfiyah")
  assert.equal(muatan.get("idKitab"), "k-1")
  assert.equal(muatan.get("berkas"), berkas)
})

test("buatMuatanPdf mengirim string kosong untuk kitab baru", () => {
  assert.equal(buatMuatanPdf(pdf(), "Alfiyah", "").get("idKitab"), "")
})

test("persenProgres membulatkan dan menahan diri saat total tidak diketahui", () => {
  assert.equal(persenProgres(512, 1024, true), 50)
  assert.equal(persenProgres(1, 3, true), 33)
  assert.equal(persenProgres(512, 0, false), null)
})

test("bacaResponsUnggah menerima balasan sehat dan memakai byte cadangan", () => {
  const hasil = bacaResponsUnggah(
    JSON.stringify({ ok: true, path: "kitab/alfiyah.pdf", halaman: 120, tanda: "sig" }),
    200,
    2048,
  )
  assert.deepEqual(hasil, {
    ok: true,
    berkas: { path: "kitab/alfiyah.pdf", byte: 2048, halaman: 120, tanda: "sig" },
  })
})

test("bacaResponsUnggah memakai byte dari server bila dikirim", () => {
  const hasil = bacaResponsUnggah(
    JSON.stringify({ ok: true, path: "p", byte: 4096, halaman: 9, tanda: "t" }),
    200,
    2048,
  )
  assert.deepEqual(hasil, { ok: true, berkas: { path: "p", byte: 4096, halaman: 9, tanda: "t" } })
})

for (const [label, teks, status] of [
  ["bukan JSON", "<html>502</html>", 502],
  ["ok false", JSON.stringify({ ok: false, pesan: "Maks 150 MB." }), 400],
  ["tanpa tanda tangan", JSON.stringify({ ok: true, path: "p", halaman: 3 }), 200],
  ["tanpa path", JSON.stringify({ ok: true, tanda: "t", halaman: 3 }), 200],
  ["tanpa halaman", JSON.stringify({ ok: true, tanda: "t", path: "p" }), 200],
  ["status 500 tetapi body ok", JSON.stringify({ ok: true, path: "p", tanda: "t", halaman: 3 }), 500],
] as const) {
  test(`bacaResponsUnggah menolak balasan ${label} tanpa membocorkan detail teknis`, () => {
    const hasil = bacaResponsUnggah(teks, status, 10)
    assert.equal(hasil.ok, false)
    if (!hasil.ok) {
      assert.equal(typeof hasil.pesan, "string")
      assert.match(hasil.pesan, /[a-z]/)
    }
  })
}

test("bacaResponsUnggah memakai pesan server saat tersedia", () => {
  const hasil = bacaResponsUnggah(JSON.stringify({ ok: false, pesan: "Kunci Bunny belum diisi." }), 500, 1)
  assert.deepEqual(hasil, { ok: false, pesan: "Kunci Bunny belum diisi." })
})

test("bacaResponsUnggah memberi pesan status untuk balasan yang tidak bisa dibaca", () => {
  const hasil = bacaResponsUnggah("<html>502</html>", 502, 1)
  assert.deepEqual(hasil, { ok: false, pesan: "Unggahan gagal (502)." })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal** `ERR_MODULE_NOT_FOUND` untuk `src/lib/unggah-pdf-klien`, `exit=1`.

- [ ] **Step 3: Implementasi minimal**

`src/lib/unggah-pdf-klien.ts` (CRLF). Aturan validasi dan syarat keberhasilan harus sama persis dengan [form-kitab.tsx:129-146](../../../src/components/admin/form-kitab.tsx#L129) dan [:170-186](../../../src/components/admin/form-kitab.tsx#L170):

```ts
import { formatUkuranBerkas } from "@/lib/format"

export type BerkasTersimpan = { path: string; byte: number; halaman: number; tanda: string }

/** Bentuk balasan /api/admin/upload-pdf. */
export type ResponsUnggah = {
  ok: boolean
  path?: string
  byte?: number
  halaman?: number
  tanda?: string
  pesan?: string
}

export type GalatBerkas = { judul: string; deskripsi?: string }

export function validasiBerkasPdf(file: File, maksMb: number): GalatBerkas | null {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { judul: "Format berkas tidak didukung", deskripsi: "Unggah berkas berformat PDF." }
  }
  if (file.size > maksMb * 1024 * 1024) {
    return {
      judul: "Berkas terlalu besar",
      deskripsi: `Maksimal ${maksMb} MB, ukuran berkas ini ${formatUkuranBerkas(file.size)}.`,
    }
  }
  return null
}

/** `idKitab` kosong berarti kitab baru; server menolaknya saat memverifikasi bukti unggah. */
export function buatMuatanPdf(file: File, slug: string, idKitab: string): FormData {
  const muatan = new FormData()
  muatan.append("berkas", file)
  muatan.append("slug", slug)
  muatan.append("idKitab", idKitab)
  return muatan
}

export function persenProgres(loaded: number, total: number, lengthComputable: boolean): number | null {
  return lengthComputable ? Math.round((loaded / total) * 100) : null
}

/**
 * Bukti unggah hanya sah bila server mengembalikan keempatnya dengan status sukses.
 * Bentuk lain dianggap gagal; pesan mentah dari server diteruskan apa adanya karena
 * route handler sudah menyaringnya lewat pesanAman.
 */
export function bacaResponsUnggah(
  teks: string,
  status: number,
  byteCadangan: number,
): { ok: true; berkas: BerkasTersimpan } | { ok: false; pesan: string } {
  let data: ResponsUnggah | null = null
  try {
    data = JSON.parse(teks) as ResponsUnggah
  } catch {
    data = null
  }

  if (status < 300 && data?.ok && data.tanda && data.path && data.halaman) {
    return {
      ok: true,
      berkas: {
        path: data.path,
        tanda: data.tanda,
        byte: data.byte ?? byteCadangan,
        halaman: data.halaman,
      },
    }
  }

  return { ok: false, pesan: data?.pesan ?? `Unggahan gagal (${status}).` }
}
```

- [ ] **Step 4: Jalankan, pastikan lolos** (`exit=0`). Batasan: `formatUkuranBerkas(3 * 1024 * 1024)` sudah diverifikasi menghasilkan `3 MB` dan `slugify("Ushul Fiqih")` menghasilkan `ushul-fiqih`, jadi kedua fixture itu sudah sesuai implementasi yang dikunci `tests/format.test.ts`; kalau tetap gagal, yang salah adalah modul baru, bukan fixture.

- [ ] **Step 5: Pindahkan section metadata**

Salin [form-kitab.tsx:227-384](../../../src/components/admin/form-kitab.tsx#L227) ke `bagian-metadata-kitab.tsx`. Pindahkan `const TIDAK_ADA = "tidak-ada"` ([ :42](../../../src/components/admin/form-kitab.tsx#L42)) ke berkas ini karena hanya Select syarah yang memakainya. Tanda tangan:

```tsx
"use client"

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form"
import type { KitabInput } from "@/lib/validasi"
import type { OpsiPilhan } from "@/db/queries"
// Input, Label, Select*, Textarea, cn, Controller sesuai blok asli

export function BagianMetadataKitab({
  register,
  control,
  errors,
  kategori,
  pengarang,
  syarah,
  slugPratinjau,
  punyaPdf,
}: {
  register: UseFormRegister<KitabInput>
  control: Control<KitabInput>
  errors: FieldErrors<KitabInput>
  kategori: OpsiPilhan[]
  pengarang: OpsiPilhan[]
  syarah: OpsiPilhan[]
  slugPratinjau: string
  punyaPdf: boolean
}) { /* … */ }
```

`readOnly={punyaPdf}` pada input `jumlahHalaman` tetap dari prop, karena berkas PDF adalah satu-satunya sumber bilangan halaman yang sah (Gelombang 4.2).

- [ ] **Step 6: Pindahkan section berkas PDF**

Salin [form-kitab.tsx:386-512](../../../src/components/admin/form-kitab.tsx#L386) ke `bagian-berkas-pdf.tsx`:

```tsx
export function BagianBerkasPdf({
  berkas,
  tersimpan,
  progres,
  berkasDitampilkan,
  awal,
  inputRef,
  onPilihBerkas,
  onUnggah,
  onBuang,
}: {
  berkas: File | null
  tersimpan: BerkasTersimpan | null
  progres: number | null
  berkasDitampilkan: string | null
  awal: KitabVe | null
  inputRef: RefObject<HTMLInputElement | null>
  onPilihBerkas: (file: File | undefined | null) => void
  onUnggah: () => void
  onBuang: () => void
}) { /* … */ }
```

Dropzone (`onDragOver`, `onDrop`, `input type="file" className="sr-only"`), `ProgresBar` saat `progres < 100`, `Alert` sukses ber-token `border-sukses/25 bg-sukses/15`, dan `Alert` "Belum ada berkas PDF" dipindah apa adanya. `inputRef` diperlukan karena `buangBerkas` mengosongkan `input.value` di wadah.

- [ ] **Step 7: Pindahkan section status publikasi**

Salin [form-kitab.tsx:514-557](../../../src/components/admin/form-kitab.tsx#L514) dan `STATUS_OPSI` ([ :58-72](../../../src/components/admin/form-kitab.tsx#L58)) ke `bagian-status-publikasi.tsx`:

```tsx
export function BagianStatusPublikasi({
  register,
  status,
  galatStatus,
}: {
  register: UseFormRegister<KitabInput>
  status: StatusKitab
  galatStatus?: string
}) { /* … */ }
```

Pesan `<Globe /> Kitab akan langsung dapat dibaca publik melalui tautan reader.` tetap di sini (ikon Globe, bukan Sparkles).

- [ ] **Step 8: Rongangkan `form-kitab.tsx`**

Wadah baru berisi: `useForm<KitabInput>` dengan `defaultValues` yang sama ([ :95-108](../../../src/components/admin/form-kitab.tsx#L95)), `watch`, `slugPratinjau`, `berkasDitampilkan`, `punyaPdf`, dan empat fungsi yang sudah dirampingkan:

```tsx
function pilihBerkas(file: File | undefined | null) {
  if (!file) return
  const galat = validasiBerkasPdf(file, MAKS_PDF_MB)
  if (galat) {
    toast.error(galat.judul, galat.deskripsi ? { description: galat.deskripsi } : undefined)
    return
  }
  setBerkas(file)
  setTersimpan(null)
  setProgres(null)
}

/**
 * XHR dipakai karena `fetch` tidak memberi progres unggahan, padahal bilangan
 * halaman dan berkas besar butuh indikator berjalan.
 */
function unggahSekarang() {
  if (!berkas) {
    toast.error("Pilih berkas PDF terlebih dahulu.")
    return
  }
  const muatan = buatMuatanPdf(berkas, judulLatin.trim() || berkas.name.replace(/\.pdf$/i, ""), awal?.id ?? "")
  const xhr = new XMLHttpRequest()
  xhr.open("POST", "/api/admin/upload-pdf")
  xhr.upload.addEventListener("progress", (event) => {
    const nilai = persenProgres(event.loaded, event.total, event.lengthComputable)
    if (nilai !== null) setProgres(nilai)
  })
  xhr.addEventListener("load", () => {
    const hasil = bacaResponsUnggah(xhr.responseText, xhr.status, berkas.size)
    if (!hasil.ok) {
      setProgres(null)
      toast.error(hasil.pesan)
      return
    }
    setTersimpan(hasil.berkas)
    setProgres(100)
    setValue("jumlahHalaman", hasil.berkas.halaman, { shouldDirty: true, shouldValidate: true })
    toast.success("Berkas tersimpan di Bunny Storage", {
      description: `Parser membaca ${hasil.berkas.halaman} halaman; kolom jumlah halaman terisi otomatis.`,
    })
  })
  xhr.addEventListener("error", () => {
    setProgres(null)
    toast.error("Koneksi unggahan terputus", {
      description: "Periksa jaringan Anda, lalu unggah berkas ulang.",
    })
  })
  setProgres(0)
  xhr.send(muatan)
}
```

`buangBerkas` dan `onSubmit` ([ :207-224](../../../src/components/admin/form-kitab.tsx#L207)) dipindah tanpa perubahan. JSX wadah:

```tsx
<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
  <BagianMetadataKitab
    register={register}
    control={control}
    errors={errors}
    kategori={kategori}
    pengarang={pengarang}
    syarah={syarah}
    slugPratinjau={slugPratinjau}
    punyaPdf={punyaPdf}
  />
  <BagianBerkasPdf
    berkas={berkas}
    tersimpan={tersimpan}
    progres={progres}
    berkasDitampilkan={berkasDitampilkan}
    awal={awal}
    inputRef={berkasInput}
    onPilihBerkas={pilihBerkas}
    onUnggah={unggahSekarang}
    onBuang={buangBerkas}
  />
  <BagianStatusPublikasi register={register} status={status} galatStatus={errors.status?.message} />
  {/* footer :559-581 tetap di wadah: tombol simpan dengan LoaderCircle/Save, tautan batal, waktuRelatif(awal.updatedAt) */}
</form>
```

Hapus `export type OpsiPilhan` lokal ([ :40](../../../src/components/admin/form-kitab.tsx#L40)) dan impor `OpsiPilhan` dari `@/db/queries`. Kalau `npx tsc --noEmit` kemudian menegur halaman `baru/page.tsx` atau `edit/page.tsx` karena impor tipe itu, kembalikan sebagai **impor-ulang eksplisit satu baris** `export type { OpsiPilhan } from "@/db/queries"` di `form-kitab.tsx`; sampai kini grep menunjukkan tidak ada konsumen luar yang mengimpornya, jadi kemungkinan besar tidak perlu.

- [ ] **Step 9-12: Gerbang, baseline ratchet, bukti baris, `npm test`**

Perintah Task 1 Step 9-12. Ratchet: hapus `src/components/admin/form-kitab.tsx` dari `daftarDasar`. Perhatian ganda: ratchet dash `daftarDasar` saat ini memuat `"src/components/admin/form-kitab.tsx": 1` (em dash di komentar [:156](../../../src/components/admin/form-kitab.tsx#L156)). Setelah pemecahan, komentar itu ikut berpindah ke berkas `form-kitab.tsx` wadah atau `bagian-berkas-pdf.tsx`; transkripsi ulang peta dash dari output test, jangan dihapus dari baseline kecuali komentarnya benar-benar sudah tidak ada.

---

## Task 5: Sapuan akhir dan laporan

**Files:**
- Modify: `tests/ui-higienis.test.ts` hanya bila baseline masih menyimpan berkas admin

- [ ] **Step 1: Pastikan tidak ada satu pun `src/app/**` yang berubah**

```bash
git status --short src/app; echo "exit=$?"
```
Expected: keluaran kosong untuk empat rute admin (`admin/kitab/page.tsx`, `admin/kitab/baru/page.tsx`, `admin/kitab/[id]/edit/page.tsx`, `admin/pengguna/page.tsx`) plus `admin/kategori|pengarang|syarah`. Kalau ada, pemecahan mengubah tanda tangan publik dan harus diperbaiki, bukan halamannya.

- [ ] **Step 2: Ukur ulang semua komponen admin**

```bash
node -e "const fs=require('fs');for(const f of fs.readdirSync('src/components/admin')){const s=fs.readFileSync('src/components/admin/'+f,'utf8').split('\n').length;console.log(String(s).padStart(4),f)}"
```
Expected: tidak ada `.tsx` di atas 200.

- [ ] **Step 3: Gerbang penuh**

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npm run lint; echo "lint exit=$?"
npm test; echo "test exit=$?"
```
Expected: `tsc exit=0`, `lint exit=0`, `test exit=0` (215 menjadi 250 test; angka pastinya dari output, laporkan apa adanya).

- [ ] **Step 4: CRLF sweep untuk seluruh `src/**` baru**

```bash
node -e "const fs=require('fs'),p=require('child_process').execSync('git ls-files -o --exclude-standard src').toString().trim().split('\n');for(const f of p){const s=fs.readFileSync(f,'utf8');const n=(s.match(/\n/g)||[]).length,c=(s.match(/\r\n/g)||[]).length;console.log(c===n?'CRLF oke':'LF PERBAIKI',f)}"
```
Expected: `CRLF oke` untuk setiap berkas. Berkas `tests/**` dikecualikan (harus LF).

- [ ] **Step 5: Laporkan ke pengguna**

Daftar file baru + file ubah, jumlah baris tiap komponen sebelum/sesudah, perintah gerbang dengan exit code-nya, dan satu kalimat jujur bahwa kesetaraan visual pasca-pemecahan **belum** bisa dibuktikan lewat uji live sampai kredensial database nyata tersedia; yang dibuktikan adalah kompilasi TypeScript, lint, 250 test, dan struktur baris.

---

## Verifikasi Mandiri atas Rencana Ini

1. **Cakupan.** Empat berkas admin di `daftarDasar` yang melewati 200 baris dan termasuk lingkup (#27) masing-masing punya satu tugas: `tabel-kitab` (Task 1), `kerja-pengguna` (Task 2), `kerja-entitas` (Task 3), `form-kitab` (Task 4). Entri ratchet lain (`reader-shell`, `panel-samping`, `toolbar-baca`, `form-profil`, `kerja-catatan`, `katalog-explorer`, `kontak-form`, `sidebar-shell`, empat halaman `(public)` dan dua halaman dashboard) sengaja tidak masuk; rencana ini hanya menyangkut formulir/daftar admin sesuai permintaan "form admin dulu".
2. **Placeholder.** Tidak ada "TODO" atau "serupa Task N". Blok JSX dinyatakan sebagai "salin rentang baris X sampai Y apa adanya" plus tabel penggantian identifier per closure; itu memang instruksi lengkapnya karena JSX-nya sudah ada di repo dan menyalin ulang 600 baris ke dokumen rencana hanya membuka peluang deviasi. Setiap bagian yang ditandai `{ /* … */ }` merujuk ke rentang baris konkret di file sumber yang sama.
3. **Konsistensi tipe.** `BerkasTersimpan` didefinisikan sekali di `src/lib/unggah-pdf-klien.ts` dan diimpor oleh `form-kitab.tsx` serta `bagian-berkas-pdf.tsx`. `BarisPengguna` didefinisikan sekali di `src/lib/admin-pengguna.ts`. Empat tipe entitas didefinisikan sekali di `src/lib/admin-entitas.ts`. `SEMUA` diekspor dari `admin-kitab.ts` dan `admin-pengguna.ts` secara terpisah agar kedua modul tidak saling bergantung; nilainya sama dan tidak pernah dibandingkan silang.
4. **Risiko yang sudah diantisipasi.** Ratchet dash dan ratchet ukuran saling menegur bila salah transkripsi (Task 4 Step 9-12); CRLF menandai berkas "bersih" sebagai berubah (Task 5 Step 4); `git status src/app` membuktikan tidak ada kebocoran perubahan ke halaman (Task 5 Step 1).
