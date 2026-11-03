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

test("ambang geser dan batas scroll terkunci ke nilai absolut", () => {
  // Test di atas menyusun fixture relatif ke konstanta, jadi nilai konstanta itu
  // sendiri wajib dikunci. Ambang 64 px dan batas lari 90 px dijanjikan apa
  // adanya; mengganti salah satunya harus menggagalkan test ini.
  assert.equal(AMBANG_GESER_X_PX, 64, "Ambang geser horizontal wajib 64 px.")
  assert.equal(MAKS_LARI_GESER_Y_PX, 90, "Batas lari vertikal wajib 90 px.")
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
