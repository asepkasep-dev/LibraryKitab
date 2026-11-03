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
