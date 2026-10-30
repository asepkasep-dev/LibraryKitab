import assert from "node:assert/strict"
import { test } from "node:test"
import { skemaKitabHalaman } from "../src/lib/baca"
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
