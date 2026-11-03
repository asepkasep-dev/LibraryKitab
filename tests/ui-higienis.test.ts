import { test } from "node:test"
import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"

/**
 * Pemeriksa statis aturan anti-slop AGENTS.md. Aturan keras harus nol pelangaran;
 * aturan ratchet memakai daftar dasar (jumlah per berkas) supaya utang yang sudah
 * ada tercatat dan tidak bertambah tanpa disengaja. Menurunkan utang menuntut
 * daftar dasar ikut mengecil, jadi angka di bawah ini selalu mencerminkan kenyataan.
 */

function berkasSumber(ekstensi: string[]): string[] {
  const hasil: string[] = []
  const jalan = (dir: string) => {
    for (const nama of readdirSync(dir, { withFileTypes: true })) {
      const penuh = join(dir, nama.name)
      if (nama.isDirectory()) jalan(penuh)
      else if (ekstensi.some((e) => nama.name.endsWith(e))) hasil.push(penuh)
    }
  }
  jalan(join(process.cwd(), "src"))
  return hasil
    .map((p) => relative(process.cwd(), p).replace(/\\/g, "/"))
    .sort()
}

function baca(rel: string) {
  return readFileSync(join(process.cwd(), rel), "utf8")
}

/** Jumlah kecocokan per berkas, hanya berkas bernilai nol yang dibuang. */
function hitung(pola: RegExp, berkas: string[], saring?: (rel: string) => boolean) {
  const peta = new Map<string, number>()
  for (const rel of berkas) {
    if (saring && !saring(rel)) continue
    const n = (baca(rel).match(pola) || []).length
    if (n > 0) peta.set(rel, n)
  }
  return Object.fromEntries(peta)
}

const SEMUA_KOMPONEN = berkasSumber([".tsx"])
const SEMUA_SUMBER = berkasSumber([".tsx", ".ts", ".css"])

function petaTeks(peta: Record<string, number>) {
  return JSON.stringify(peta, null, 2)
}

/* --------------------------- aturan keras, nol toleransi --------------------------- */

test("transition-all tidak dipakai di luar primitif shadcn bawaan", () => {
  // AGENTS: animasi hanya transform dan opacity. Empat primitif di bawah masih
  // memakai kelas stok shadcn dan tidak ditulis ulang di proyek ini.
  const DIIZINKAN = new Set([
    "src/components/ui/badge.tsx",
    "src/components/ui/button.tsx",
    "src/components/ui/switch.tsx",
    "src/components/ui/tabs.tsx",
  ])
  const ditemukan = hitung(/transition-all/g, SEMUA_SUMBER, (rel) => !DIIZINKAN.has(rel))
  assert.deepEqual(ditemukan, {}, `Pilih properti spesifik, misalnya transition-[color,box-shadow].\n${petaTeks(ditemukan)}`)
})

test("teks bergradien bg-clip-text tidak dipakai", () => {
  const ditemukan = hitung(/bg-clip-text/g, SEMUA_SUMBER)
  assert.deepEqual(ditemukan, {}, `Satu warna brand solid, penekanan lewat ukuran.\n${petaTeks(ditemukan)}`)
})

test("setiap pemakaian framer-motion punya fallback prefers-reduced-motion", () => {
  const pemakai = SEMUA_SUMBER.filter((rel) => /from "framer-motion"/.test(baca(rel)))
  assert.ok(pemakai.length > 0, "Pemeriksaan ini kehilangan artinya bila tidak ada lagi pemakaian framer-motion.")
  const tanpaFallback = pemakai.filter((rel) => !/useReducedMotion/.test(baca(rel)))
  assert.deepEqual(
    tanpaFallback,
    [],
    `Gerakan wajib menghormati preferensi sistem.\n${tanpaFallback.join(", ")}`
  )
})

test("animasi CSS punya fallback prefers-reduced-motion", () => {
  // AGENTS: setiap animasi menghormati preferensi hemat gerak. Keyframe di luar
  // framer-motion (shimmer skeleton) dan `scroll-behavior: smooth` tidak bisa
  // dijangkau hook useReducedMotion, jadi fallback-nya wajib ada di stylesheet.
  const css = baca("src/app/globals.css")
  const mulai = css.search(/@media[^{]*prefers-reduced-motion:\s*reduce/)
  assert.notEqual(mulai, -1, "globals.css belum punya blok prefers-reduced-motion: reduce.")

  const blok = css.slice(mulai)
  assert.match(blok, /animation-duration/, "Animasi CSS harus dipangkas jadi instan.")
  assert.match(blok, /animation-iteration-count/, "Animasi berulang harus berhenti, bukan diperlambat.")
  assert.match(blok, /transition-duration/, "Transisi harus dipangkas jadi instan.")
  assert.match(blok, /scroll-behavior/, "Gulir halus harus kembali otomatis.")
})

test("footer tidak lagi menjanjikan mode demo", () => {
  // Area member dan pengelola kini butuh akun nyata; copy lama mengacu ke Tahap 1.
  const footer = baca("src/components/site/footer.tsx")
  assert.doesNotMatch(footer, /Mode Demo/i, "Copy footer harus mencerminkan akses nyata, bukan tahap awal proyek.")
  assert.doesNotMatch(footer, /data dummy/i)
})

test("kelas warna palet Tailwind tidak dipakai, hanya token", () => {
  // Status nyata memakai warna sendiri lewat token (sukses, peringatan,
  // destructive), bukan kelas palet langsung seperti text-emerald-300 yang
  // membuat nilai tidak terpusat. Semua pemakai lama sudah dipindah, jadi
  // aturan ini keras: pemakaian baru langsung menggagalkan test.
  const POLA =
    /\b(bg|text|border|ring|shadow|from|via|to|stroke|fill|accent|decoration|outline)-(amber|slate|zinc|gray|neutral|stone|red|rose|orange|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink)-\d+/g
  const ditemukan = hitung(POLA, SEMUA_SUMBER)
  assert.deepEqual(ditemukan, {}, `Kelas warna palet harus pindah ke token.\n${petaTeks(ditemukan)}`)
})

test("warna aksen kedua (teal) tidak dipakai", () => {
  // AGENTS: satu warna brand emas beserta turunannya. Teal dari PRD tidak jadi
  // aksen, termasuk lapisan glow radial di latar halaman. Nilai hue ditulis
  // langsung sebagai hsl(17x ...); angka 172 di dalam peta warna sampul tidak
  // kena pola ini karena memakai template literal.
  const ditemukan = hitung(/\bteal\b|hsl\(\s*17[0-9]\b/gi, SEMUA_SUMBER)
  assert.deepEqual(ditemukan, {}, "Satu aksen emas; hapus pemakaian teal dan hue 170an.\n" + petaTeks(ditemukan))
})

test("ikon Sparkles tidak dipakai sebagai penanda fitur", () => {
  // AGENTS: satu set ikon Lucide dengan makna yang sesuai; ikon sparkle cuma
  // perhiasan. Ganti dengan ikon yang menjelaskan isinya (riwayat, publik,
  // penemuan).
  const ditemukan = hitung(/\bSparkles\b/g, SEMUA_KOMPONEN)
  assert.deepEqual(ditemukan, {}, `Pilih ikon yang punya makna.\n${petaTeks(ditemukan)}`)
})

/* ------------------------------ ratchet utang ------------------------------ */

test("em dash dan en dash tidak bertambah dari daftar dasar", () => {
  // AGENTS melarang dash di teks UI. Semua pemakai yang tersisa sekarang ada di
  // komentar kode, bukan di teks yang tampil di layar; jumlah totalnya dikunci
  // supaya copy baru tidak menyelinap membawa dash.
  const ditemukan = hitung(/[—–]/g, SEMUA_SUMBER)
  // Semua butir di daftar dasar adalah komentar kode, hasil pemindaian:
  // 6 tanda di 4 berkas.
  const daftarDasar: Record<string, number> = {
    "src/db/queries.ts": 1,
    "src/db/seed.ts": 1,
    "src/lib/auth.ts": 2,
    "src/lib/bunny.ts": 2,
  }
  assert.deepEqual(
    ditemukan,
    daftarDasar,
    `Pakai tanda hubung, koma, titik dua, atau pecah jadi dua kalimat.\n${petaTeks(ditemukan)}`
  )
})

test("jumlah komponen di atas 200 baris tidak bertambah dari daftar dasar", () => {
  // AGENTS: komponen maksimal sekitar 200 baris. Pecah berkas berarti menulis
  // ulang alur reader dan form kitab, jadi daftar dasar dikunci sampai uji live
  // bisa membandingkan hasilnya. Menambah komponen baru yang panjang, atau
  // membuat salah satu berkas di bawah ini makin panjang, menggagalkan test.
  // src/components/ui/ dikecualikan karena berisi primitif bawaan shadcn.
  const ditemukan: Record<string, number> = {}
  for (const rel of SEMUA_KOMPONEN) {
    if (rel.startsWith("src/components/ui/")) continue
    const baris = baca(rel).split("\n").length
    if (baris > 200) ditemukan[rel] = baris
  }
  const daftarDasar: Record<string, number> = {
    "src/app/(admin)/admin/dashboard/page.tsx": 276,
    "src/app/(member)/dashboard/page.tsx": 305,
    "src/app/(public)/kitab/[slug]/page.tsx": 273,
    "src/app/(public)/page.tsx": 343,
    "src/app/(public)/tentang/page.tsx": 203,
    "src/components/member/form-profil.tsx": 356,
    "src/components/member/kerja-catatan.tsx": 317,
    "src/components/reader/panel-samping.tsx": 462,
    "src/components/reader/reader-shell.tsx": 546,
    "src/components/reader/toolbar-baca.tsx": 235,
    "src/components/shell/sidebar-shell.tsx": 329,
    "src/components/site/katalog-explorer.tsx": 354,
    "src/components/site/kontak-form.tsx": 217,
  }
  assert.deepEqual(
    ditemukan,
    daftarDasar,
    `Komponen baru di atas 200 baris harus dipecah, jangan ditumpuk.\n${petaTeks(ditemukan)}`
  )
})

test("warna literal di komponen tidak bertambah dari daftar dasar", () => {
  // Warna komponen hanya lewat token. Nilai hsl yang dibangun dari angka hasil
  // hitungan (sampul kitab memakai hue kategori) tidak kena pola ini karena
  // setelah kurung buka tidak langsung diikuti digit.
  // Tiga berkas di daftar dasar adalah latar glow radial halaman publik; warnanya
  // ikut diganti saat keputusan permukaan solid (aturan anti-slop) dieksekusi.
  const daftarDasar: Record<string, number> = {
    "src/app/(auth)/layout.tsx": 2,
    "src/app/(public)/page.tsx": 5,
    "src/app/(public)/tentang/page.tsx": 1,
  }
  const ditemukan = hitung(/#[0-9a-fA-F]{3,8}\b|hsl\(\s*\d/g, SEMUA_KOMPONEN)
  assert.deepEqual(ditemukan, daftarDasar, `Ganti dengan token warna atau var(--...).\n${petaTeks(ditemukan)}`)
})

test("utang permukaan glassmorphism tidak bertambah dari daftar dasar", () => {
  const daftarDasar: Record<string, number> = {
    "src/app/(auth)/layout.tsx": 1,
    "src/app/(public)/tentang/page.tsx": 1,
    "src/app/globals.css": 1,
    "src/app/not-found.tsx": 1,
    "src/components/reader/reader-shell.tsx": 1,
    "src/components/shell/sidebar-shell.tsx": 3,
    "src/components/site/faq-accordion.tsx": 1,
    "src/components/site/footer.tsx": 1,
    "src/components/site/katalog-explorer.tsx": 1,
    "src/components/site/kitab-card.tsx": 1,
    "src/components/site/navbar.tsx": 2,
    "src/components/site/search-bar.tsx": 1,
    "src/components/ui/card.tsx": 1,
    "src/components/ui/dialog.tsx": 1,
    "src/components/ui/sheet.tsx": 1,
    "src/lib/clerk-theme.ts": 1,
  }
  const ditemukan = hitung(/backdrop-blur/g, SEMUA_SUMBER)
  assert.deepEqual(ditemukan, daftarDasar, "Permukaan solid lebih dulu; blur hanya untuk elemen melayang.\n" + petaTeks(ditemukan))
})
