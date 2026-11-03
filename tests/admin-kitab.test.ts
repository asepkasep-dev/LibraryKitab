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
const PENGARANG_MALIK = {
  id: "p2",
  namaArab: "ابن مالك",
  namaLatin: "Ibn Malik",
  tahunWafat: "672 H",
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
    pengarangId: "p2",
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
    pengarang: PENGARANG_MALIK,
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
  pengarangId: "p1",
  pengarang: PENGARANG,
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
  for (const kata of ["شرح ابن عقيل", "Ibn Aqil", "as-Suyuthi", "syarah-ibn-aqil"]) {
    assert.deepEqual(
      saringKitab(SEMUA_KITAB, { kata, status: SEMUA, kategori: SEMUA }).map((k) => k.id),
      ["2"],
      `Kata kunci "${kata}" harus menemukan Syarah Ibn Aqil.`,
    )
  }
  assert.deepEqual(
    saringKitab(SEMUA_KITAB, { kata: "Fiqih", status: SEMUA, kategori: SEMUA }).map((k) => k.id),
    ["3"],
    'Kata kunci "Fiqih" harus menemukan Fathul Qarib lewat nama fan.',
  )
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
