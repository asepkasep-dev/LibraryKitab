import assert from "node:assert/strict"
import { test } from "node:test"
import {
  KUNCI_PREFERENSI_BACA,
  MAKS_ISI_CATATAN,
  MAKS_LABEL_BOOKMARK,
  ZOOM_BAKU,
  ZOOM_LANGKAH,
  ZOOM_MAX,
  ZOOM_MIN,
  batasiZoom,
  langkahZoom,
  skemaIsiCatatan,
  skemaKitabHalaman,
  skemaLabelBookmark,
} from "../src/lib/baca"
import { skemaId } from "../src/lib/validasi"

const UUID = "6f0f6f9c-3f5e-4c1a-9b7a-2d5c8e1a4b77"

test("id yang bukan uuid ditolak sebelum masuk query", () => {
  assert.equal(skemaId.safeParse("1=1").success, false)
  assert.equal(skemaId.safeParse(UUID).success, true)
})

test("kitabId pada aksi baca wajib uuid", () => {
  const hasil = skemaKitabHalaman.safeParse({ kitabId: "drop table", halaman: 4 })
  assert.equal(hasil.success, false)
})

test("nomor halaman pecahan, nol, dan negatif ditolak", () => {
  assert.equal(skemaKitabHalaman.safeParse({ kitabId: UUID, halaman: 3.5 }).success, false)
  assert.equal(skemaKitabHalaman.safeParse({ kitabId: UUID, halaman: 0 }).success, false)
  assert.equal(skemaKitabHalaman.safeParse({ kitabId: UUID, halaman: -4 }).success, false)
})

test("nomor halaman wajar diterima", () => {
  assert.equal(skemaKitabHalaman.safeParse({ kitabId: UUID, halaman: 12 }).success, true)
})

test("nomor halaman NaN dan tak hingga ditolak", () => {
  assert.equal(skemaKitabHalaman.safeParse({ kitabId: UUID, halaman: Number.NaN }).success, false)
  assert.equal(skemaKitabHalaman.safeParse({ kitabId: UUID, halaman: Number.POSITIVE_INFINITY }).success, false)
})

test("kitabId wajib ada, bukan hanya tidak valid", () => {
  assert.equal(skemaKitabHalaman.safeParse({ halaman: 3 }).success, false)
})

/* ---------------------- kontrak zoom dan preferensi ------------------- */

test("batasiZoom mengunci nilai ke rentang 50 sampai 250 dan membulatkan", () => {
  assert.equal(batasiZoom(50), 50)
  assert.equal(batasiZoom(250), 250)
  assert.equal(batasiZoom(30), ZOOM_MIN)
  assert.equal(batasiZoom(300), ZOOM_MAX)
  assert.equal(batasiZoom(97.4), 97)
})

test("batasiZoom jatuh ke ZOOM_BAKU saat nilai tidak hingga", () => {
  // Preferensi zoom dibaca ulang dari localStorage yang bisa saja berisi NaN
  // atau sisa data lama; NaN yang lolos clamp merambat ke style zoom reader.
  assert.equal(batasiZoom(Number.NaN), ZOOM_BAKU)
  assert.equal(batasiZoom(Number.POSITIVE_INFINITY), ZOOM_BAKU)
  assert.equal(batasiZoom(Number.NEGATIVE_INFINITY), ZOOM_BAKU)
})

test("langkahZoom naik mengikuti tangga dan berhenti di ZOOM_MAX", () => {
  assert.equal(langkahZoom(100, 1), 110)
  assert.equal(langkahZoom(55, 1), 60)
  assert.equal(langkahZoom(200, 1), 250)
  assert.equal(langkahZoom(250, 1), ZOOM_MAX)
  assert.equal(langkahZoom(10, 1), ZOOM_MIN, "Di bawah tangga, langkah pertama jatuh ke minimum.")
  assert.equal(langkahZoom(300, 1), ZOOM_MAX)
})

test("langkahZoom turun mengikuti tangga dan berhenti di ZOOM_MIN", () => {
  assert.equal(langkahZoom(100, -1), 90)
  assert.equal(langkahZoom(130, -1), 125)
  assert.equal(langkahZoom(50, -1), ZOOM_MIN)
  assert.equal(langkahZoom(1000, -1), ZOOM_MAX, "Satu tingkat di bawah nilai di atas tangga.")
})

test("tangga zoom memuat batas rentang dan baku, tersortir naik", () => {
  assert.ok(ZOOM_LANGKAH.includes(ZOOM_MIN))
  assert.ok(ZOOM_LANGKAH.includes(ZOOM_MAX))
  assert.ok(ZOOM_LANGKAH.includes(ZOOM_BAKU))
  const tersortir = [...ZOOM_LANGKAH].sort((a, b) => a - b)
  assert.deepEqual(ZOOM_LANGKAH, tersortir)
})

test("kunci penyimpanan preferensi baca stabil karena dipakai localStorage", () => {
  assert.equal(KUNCI_PREFERENSI_BACA, "kitabku:pembaca")
})

/* ---------------------- label bookmark dan isi catatan ----------------- */

test("label bookmark membatasi 80 karakter setelah spasi tepi dibuang", () => {
  assert.equal(skemaLabelBookmark.safeParse("Halaman hadis tentang wudu").success, true)
  assert.equal(skemaLabelBookmark.safeParse("x".repeat(MAKS_LABEL_BOOKMARK)).success, true)
  assert.equal(skemaLabelBookmark.safeParse("x".repeat(MAKS_LABEL_BOOKMARK + 1)).success, false)
  assert.equal(skemaLabelBookmark.safeParse("   label   ").data, "label")
})

test("label bookmark memuat pesan batas dalam bahasa Indonesia", () => {
  const hasil = skemaLabelBookmark.safeParse("x".repeat(MAKS_LABEL_BOOKMARK + 1))
  assert.equal(hasil.success, false)
  assert.match(String(hasil.error?.issues[0]?.message), new RegExp(String(MAKS_LABEL_BOOKMARK)))
})

test("isi catatan wajib 3 sampai 2000 karakter setelah trim", () => {
  assert.equal(skemaIsiCatatan.safeParse("ab").success, false)
  assert.equal(skemaIsiCatatan.safeParse("abc").success, true)
  assert.equal(skemaIsiCatatan.safeParse("     ").success, false, "Hanya spasi dianggap kosong.")
  assert.equal(skemaIsiCatatan.safeParse("x".repeat(MAKS_ISI_CATATAN)).success, true)
  assert.equal(skemaIsiCatatan.safeParse("x".repeat(MAKS_ISI_CATATAN + 1)).success, false)
})
