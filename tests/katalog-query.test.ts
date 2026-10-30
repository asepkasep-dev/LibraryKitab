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
