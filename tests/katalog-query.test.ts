import assert from "node:assert/strict"
import { test } from "node:test"
import { SEMUA, bacaQuery } from "../src/lib/katalog-query"

const UUID = "6f0f6f9c-3f5e-4c1a-9b7a-2d5c8e1a4b77"

test("filter pengarang non-uuid dianggap semua", () => {
  assert.equal(bacaQuery({ pengarang: "Imam Ghazali" }).pengarang, SEMUA)
})

test("filter syarah non-uuid dianggap semua", () => {
  assert.equal(bacaQuery({ syarah: "<script>" }).syarah, SEMUA)
})

test("filter pengarang berbentuk uuid dipertahankan", () => {
  assert.equal(bacaQuery({ pengarang: UUID }).pengarang, UUID)
})

test("filter pengarang berupa array dianggap semua", () => {
  assert.equal(bacaQuery({ pengarang: [UUID, UUID] }).pengarang, SEMUA)
})

test("kata pencarian dipotong sampai 80 karakter", () => {
  assert.equal(bacaQuery({ q: "a".repeat(120) }).q.length, 80)
})

test("urutan di luar daftar putih jatuh ke terbaru", () => {
  assert.equal(bacaQuery({ urut: "dosen" }).urut, "terbaru")
})

test("nomor halaman tidak pernah di bawah satu", () => {
  assert.equal(bacaQuery({ halaman: "0" }).halaman, 1)
  assert.equal(bacaQuery({ halaman: "-7" }).halaman, 1)
  assert.equal(bacaQuery({ halaman: "satu" }).halaman, 1)
})

/* ---------------- perluasan audit: kasus batas tambahan ---------------- */

test("parameter yang hilang atau salah bentuk jatuh ke nilai baku", () => {
  const baku = bacaQuery({})
  assert.equal(baku.q, "")
  assert.equal(baku.kategori, SEMUA)
  assert.equal(baku.urut, "terbaru")
  assert.equal(baku.halaman, 1)
})

test("kata pencarian dan kategori berupa array dianggap tidak ada", () => {
  assert.equal(bacaQuery({ q: ["nahwu", "sharaf"] }).q, "")
  assert.equal(bacaQuery({ kategori: ["nahwu", "sharaf"] }).kategori, SEMUA)
})

test("slug kategori dipertahankan apa adanya", () => {
  assert.equal(bacaQuery({ kategori: "nahwu" }).kategori, "nahwu")
})

test("urutan yang sah pada daftar putih dipertahankan", () => {
  assert.equal(bacaQuery({ urut: "judul" }).urut, "judul")
  assert.equal(bacaQuery({ urut: "terpopuler" }).urut, "terpopuler")
  assert.equal(bacaQuery({ urut: "terbaru" }).urut, "terbaru")
})

test("nomor halaman angka string diterima", () => {
  assert.equal(bacaQuery({ halaman: "12" }).halaman, 12)
  assert.equal(bacaQuery({ halaman: " " }).halaman, 1)
})

test("kata pencarian lewat 80 dipotong, pas 80 utuh", () => {
  assert.equal(bacaQuery({ q: "b".repeat(80) }).q.length, 80)
  assert.equal(bacaQuery({ q: "b".repeat(81) }).q.length, 80)
})

test("nomor halaman dibulatkan ke bawah dan nilai tak hingga mundur ke satu", () => {
  // Offset query katalog dihitung dari nilai ini, jadi "2.7" tidak boleh
  // diteruskan sebagai pecahan dan "Infinity" tidak boleh jadi offset besar.
  assert.equal(bacaQuery({ halaman: "2.7" }).halaman, 2)
  assert.equal(bacaQuery({ halaman: "Infinity" }).halaman, 1)
  assert.equal(bacaQuery({ halaman: "1e999" }).halaman, 1)
  assert.equal(bacaQuery({ halaman: "999999999999" }).halaman, 999999999999)
})
