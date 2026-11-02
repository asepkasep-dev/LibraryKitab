import assert from "node:assert/strict"
import { test } from "node:test"
import {
  formatAngka,
  formatTanggal,
  formatTanggalSingkat,
  formatTanggalWaktu,
  formatUkuranBerkas,
  hitungPersentase,
  inisialNama,
  potongTeks,
  slugify,
  waktuRelatif,
} from "../src/lib/format"
import { jalurPdf, jalurSampul, pathDariUrl } from "../src/lib/bunny"

/* ------------------------------ slugify ------------------------------ */

test("slugify menurunkan huruf besar dan menyatukan kata dengan tanda hubung", () => {
  assert.equal(slugify("Tafsir Al-Jalalain"), "tafsir-al-jalalain")
  assert.equal(slugify("FATHUL QARIB"), "fathul-qarib")
  assert.equal(slugify("Fathul  Qarib"), "fathul-qarib")
})

test("slugify membuang tanda baca dan spasi di ujung", () => {
  assert.equal(slugify("  Fathul Qarib (Edisi 2)  "), "fathul-qarib-edisi-2")
  assert.equal(slugify("Kitab *Nahwu*!!"), "kitab-nahwu")
})

test("slugify menerima string kosong dan string tanpa huruf sama sekali", () => {
  assert.equal(slugify(""), "")
  assert.equal(slugify("!!! ***"), "")
})

test("slugify mempertahankan huruf Arab tanpa sisa tanda hubung di ujung", () => {
  const hasil = slugify("الأدب المفرد")
  assert.match(hasil, /^[\p{L}\p{N}-]+$/u)
  assert.doesNotMatch(hasil, /^-|-$/)
  assert.match(hasil, /[\u0600-\u06FF]/, "Huruf Arab harus tetap ada, bukan dibuang semua.")
})

/* ----------------------------- formatAngka ---------------------------- */

test("formatAngka memakai titik sebagai pemisah ribuan gaya Indonesia", () => {
  assert.equal(formatAngka(1000), "1.000")
  assert.equal(formatAngka(150000), "150.000")
  assert.equal(formatAngka(1234567), "1.234.567")
})

test("formatAngka nol, negatif, dan desimal tetap terbawa", () => {
  assert.equal(formatAngka(0), "0")
  assert.equal(formatAngka(-1234567), "-1.234.567")
  assert.equal(formatAngka(1500.5), "1.500,5")
})

/* -------------------------- formatUkuranBerkas ------------------------ */

test("formatUkuranBerkas menahan nilai di bawah 1 KiB sebagai byte", () => {
  assert.equal(formatUkuranBerkas(0), "0 B")
  assert.equal(formatUkuranBerkas(999), "999 B")
  assert.equal(formatUkuranBerkas(1023), "1023 B")
})

test("formatUkuranBerkas memakai KB untuk berkas menengah dan MB di atasnya", () => {
  assert.equal(formatUkuranBerkas(1024), "1 KB")
  assert.equal(formatUkuranBerkas(52_428), "51,2 KB")
  assert.equal(formatUkuranBerkas(1024 * 1024), "1 MB")
  assert.equal(formatUkuranBerkas(5 * 1024 * 1024), "5 MB")
  assert.equal(formatUkuranBerkas(15 * 1024 * 1024), "15 MB")
})

test("formatUkuranBerkas memakai koma Indonesia, bukan titik", () => {
  // Aturan AGENTS.md: angka tampil dalam format Indonesia di seluruh UI.
  assert.equal(formatUkuranBerkas(1_572_864), "1,5 MB")
  assert.equal(formatUkuranBerkas(9_999_999), "9,5 MB")
})

/* ---------------------------- formatTanggal --------------------------- */

test("tiga corak format tanggal id-ID tampil benar untuk tanggal lokal", () => {
  const tanggal = new Date(2026, 9, 5)
  assert.equal(formatTanggal(tanggal), "5 Oktober 2026")
  assert.equal(formatTanggalSingkat(tanggal), "5 Okt 2026")
  assert.equal(formatTanggalWaktu(new Date(2026, 9, 5, 14, 30)), "5 Okt 2026, 14.30")
})

test("formatTanggal menerima ISO string tanpa zona waktu", () => {
  assert.equal(formatTanggal("2026-10-05T00:00:00"), "5 Oktober 2026")
})

test("tanggal tidak valid melempar RangeError (perilaku saat ini, dilaporkan)", () => {
  // Catatan audit: format tanggal tidak punya nilai fallback, jadi string
  // rusak melempar saat dirender. Sudah dilaporkan sebagai temuan audit.
  assert.throws(() => formatTanggal("bukan-tanggal"), RangeError)
  assert.throws(() => formatTanggalSingkat("bukan-tanggal"), RangeError)
  assert.throws(() => waktuRelatif("bukan-tanggal"), RangeError)
})

/* ----------------------------- waktuRelatif --------------------------- */

const SEKARANG = new Date(2026, 2, 15, 12, 0).getTime()
const mundur = (menit: number) => new Date(SEKARANG - menit * 60_000)

test("waktuRelatif menyebut baru saja untuk kurang dari semenit dan untuk waktu di masa depan", () => {
  assert.equal(waktuRelatif(mundur(10 / 60), SEKARANG), "baru saja")
  assert.equal(waktuRelatif(new Date(SEKARANG + 3_600_000), SEKARANG), "baru saja")
})

test("waktuRelatif menata menit, jam, kemarin, dan hari", () => {
  assert.equal(waktuRelatif(mundur(5), SEKARANG), "5 menit lalu")
  assert.equal(waktuRelatif(mundur(90), SEKARANG), "2 jam lalu")
  assert.equal(waktuRelatif(mundur(20 * 60), SEKARANG), "20 jam lalu")
  assert.equal(waktuRelatif(mundur(24 * 60), SEKARANG), "kemarin")
  assert.equal(waktuRelatif(mundur(3 * 24 * 60), SEKARANG), "3 hari lalu")
})

test("waktuRelatif jatuh ke tanggal singkat setelah 30 hari", () => {
  const hasil = waktuRelatif(mundur(40 * 24 * 60), SEKARANG)
  assert.match(hasil, /^\d{1,2} \w{3,9} \d{4}$/, `Salah corak: ${hasil}`)
})

/* ------------------------------ inisialNama --------------------------- */

test("inisialNama membuang sapaan ustadz/ustadzah/kh/u. sebelum mengambil inisial", () => {
  assert.equal(inisialNama("Ustadz Abdul Somad"), "AS")
  assert.equal(inisialNama("Ustadzah Abdul Somad"), "AS")
  assert.equal(inisialNama("Kh. Ahmad Badri"), "AB")
  assert.equal(inisialNama("u. Fatimah"), "F")
  assert.equal(inisialNama("ustadz abdul somad"), "AS")
})

test("inisialNama memakai maksimal dua huruf dan K untuk nama kosong", () => {
  assert.equal(inisialNama("Ahmad Badri Ridwan"), "AB")
  assert.equal(inisialNama("Ghazali"), "G")
  assert.equal(inisialNama(null), "K")
  assert.equal(inisialNama(""), "K")
  assert.equal(inisialNama(undefined), "K")
})

/* ------------------------------ potongTeks ---------------------------- */

test("potongTeks membiarkan teks di bawah batas dan memotong yang lebih panjang", () => {
  assert.equal(potongTeks(null), "")
  assert.equal(potongTeks(""), "")
  assert.equal(potongTeks("Kitab nahwu ringkas"), "Kitab nahwu ringkas")
  assert.equal(potongTeks("a".repeat(140)), "a".repeat(140))
  const terpotong = potongTeks("a".repeat(141))
  assert.equal(terpotong.length, 140)
  assert.ok(terpotong.endsWith("…"))
})

test("potongTeks menghormati batas kustom", () => {
  assert.equal(potongTeks("Bismillah hirrahman nirrahim", 10), "Bismillah…")
})

/* --------------------------- hitungPersentase ------------------------- */

test("hitungPersentase memotong ke rentang 0 sampai 100 dan aman untuk total nol", () => {
  assert.equal(hitungPersentase(1, 3), 33)
  assert.equal(hitungPersentase(1, 800), 0)
  assert.equal(hitungPersentase(240, 240), 100)
  assert.equal(hitungPersentase(300, 240), 100)
  assert.equal(hitungPersentase(-2, 10), 0)
  assert.equal(hitungPersentase(5, 0), 0)
})

/* --------------------- jalur berkas Bunny (bunny.ts murni) ----------- */

test("jalurPdf dan jalurSampul menyusun path storage dari slug", () => {
  assert.equal(jalurPdf("tafsir-al-jalalain"), "pdf/tafsir-al-jalalain.pdf")
  assert.equal(jalurSampul("tafsir-al-jalalain"), "sampul/tafsir-al-jalalain.jpg")
})

test("pathDariUrl mengambil path dari url CDN dan melepas query tanda tangan", () => {
  assert.equal(pathDariUrl("https://cdn.pustaka.id/pdf/tafsir.pdf?token=abc123"), "pdf/tafsir.pdf")
  assert.equal(pathDariUrl("https://cdn.pustaka.id/sampul/kitab.jpg"), "sampul/kitab.jpg")
})

test("pathDariUrl membuka segmen yang ter-encode", () => {
  assert.equal(pathDariUrl("https://cdn.pustaka.id/pdf/tafsir%20al%20jalalain.pdf"), "pdf/tafsir al jalalain.pdf")
})

test("pathDariUrl tetap aman untuk url tanpa protocol dan string bukan url", () => {
  assert.equal(pathDariUrl("cdn.pustaka.id/pdf/tafsir.pdf"), "cdn.pustaka.id/pdf/tafsir.pdf")
  assert.equal(pathDariUrl("/pdf/tafsir.pdf"), "pdf/tafsir.pdf")
  assert.equal(pathDariUrl("pdf/tafsir.pdf"), "pdf/tafsir.pdf")
  assert.equal(pathDariUrl(""), "")
})

test("pathDariUrl mengembalikan string kosong untuk url tanpa path", () => {
  assert.equal(pathDariUrl("https://cdn.pustaka.id"), "")
})
