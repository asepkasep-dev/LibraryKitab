import assert from "node:assert/strict"
import { test } from "node:test"
import {
  skemaId,
  skemaKitab,
  skemaPeranAnggota,
  skemaStatusAnggota,
  skemaStatusKitab,
} from "../src/lib/validasi"

const UUID = "6f0f6f9c-3f5e-4c1a-9b7a-2d5c8e1a4b77"

function dasarKitab(ubah: Record<string, unknown> = {}) {
  return {
    judulLatin: "Al-Adab Al-Mufrad",
    judulArab: "الأدب المفرد",
    kategoriId: UUID,
    pengarangId: UUID,
    syarahId: "",
    tahunTerbit: "1311 H",
    jumlahHalaman: 240,
    deskripsi:
      "Kumpulan hadis tentang adab sehari-hari beserta penjelasan para penyusun syarah kitab.",
    status: "draft",
    ...ubah,
  }
}

test("id non-uuid ditolak dan uuid asli diterima", () => {
  assert.equal(skemaId.safeParse("1=1").success, false)
  assert.equal(skemaId.safeParse("abc").success, false)
  assert.equal(skemaId.safeParse("").success, false)
  assert.equal(skemaId.safeParse(UUID).success, true)
})

test("peran anggota hanya menerima member dan admin", () => {
  assert.equal(skemaPeranAnggota.safeParse("superadmin").success, false)
  assert.equal(skemaPeranAnggota.safeParse("owner").success, false)
  assert.equal(skemaPeranAnggota.safeParse("member").success, true)
  assert.equal(skemaPeranAnggota.safeParse("admin").success, true)
})

test("status anggota menolak nilai di luar aktif dan nonaktif", () => {
  assert.equal(skemaStatusAnggota.safeParse("pensiun").success, false)
  assert.equal(skemaStatusAnggota.safeParse("blocked").success, false)
  assert.equal(skemaStatusAnggota.safeParse("aktif").success, true)
  assert.equal(skemaStatusAnggota.safeParse("nonaktif").success, true)
})

test("status kitab menolak nilai yang tidak dikenal", () => {
  assert.equal(skemaStatusKitab.safeParse("terbit").success, false)
  assert.equal(skemaStatusKitab.safeParse("published").success, true)
  assert.equal(skemaStatusKitab.safeParse("draft").success, true)
  assert.equal(skemaStatusKitab.safeParse("archived").success, true)
})

test("form kitab yang lengkap dan sah lolos", () => {
  assert.equal(skemaKitab.safeParse(dasarKitab()).success, true)
})

test("kategori dan pengarang wajib terpilih serta berbentuk uuid", () => {
  const kosong = skemaKitab.safeParse(dasarKitab({ kategoriId: "" }))
  assert.equal(kosong.success, false)
  if (!kosong.success) assert.equal(kosong.error.issues[0].message, "Pilih kategori fan.")

  const asing = skemaKitab.safeParse(dasarKitab({ pengarangId: "nahwu" }))
  assert.equal(asing.success, false)
})

test("syarah boleh kosong tetapi nilai asing ditolak", () => {
  assert.equal(skemaKitab.safeParse(dasarKitab({ syarahId: "" })).success, true)
  assert.equal(skemaKitab.safeParse(dasarKitab({ syarahId: UUID })).success, true)
  assert.equal(skemaKitab.safeParse(dasarKitab({ syarahId: "tidak-ada" })).success, false)
})
