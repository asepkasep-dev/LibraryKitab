import assert from "node:assert/strict"
import { test } from "node:test"
import type { PenggunaVe } from "../src/db/queries"
import { SEMUA, hitungPengguna, saringPengguna, type BarisPengguna } from "../src/lib/admin-pengguna"

function akun(ubah: Partial<PenggunaVe>): PenggunaVe {
  return {
    id: "u1",
    clerkId: "clerk_u1",
    email: "santri@pesantren.id",
    namaLengkap: "Ahmad Fauzan",
    jenisPeran: "santri",
    kelas: "Wusto 1",
    role: "member",
    status: "aktif",
    fontSizePreferensi: 18,
    createdAt: new Date("2026-05-01T00:00:00Z"),
    ...ubah,
  } satisfies PenggunaVe
}

const baris = (pengguna: PenggunaVe, b = 0, c = 0, r = 0): BarisPengguna => ({
  pengguna,
  jumlahBookmark: b,
  jumlahCatatan: c,
  jumlahRiwayat: r,
})

const SANTRI = baris(akun({}))
const USTADZ = baris(
  akun({ id: "u2", namaLengkap: "Ustadz Sulaiman", email: "ustadz@pesantren.id", jenisPeran: "ustadz", kelas: "" }),
  4, 2, 1,
)
const PENGELOLA = baris(
  akun({
    id: "u3",
    namaLengkap: "Pengelola Masjid",
    email: "admin@pesantren.id",
    jenisPeran: null,
    kelas: "",
    role: "admin",
    status: "nonaktif",
  }),
  0, 0, 0,
)
const SEMUA_BARIS = [SANTRI, USTADZ, PENGELOLA]

test("saringPengguna default menampilkan semua tanpa mengubah urutan", () => {
  assert.deepEqual(
    saringPengguna(SEMUA_BARIS, { kata: "", peran: SEMUA, akses: SEMUA }),
    SEMUA_BARIS,
  )
})

test("saringPengguna mencari di nama, email, dan kelas", () => {
  const cek = (kata: string) =>
    saringPengguna(SEMUA_BARIS, { kata, peran: SEMUA, akses: SEMUA }).map((r) => r.pengguna.id)
  assert.deepEqual(cek("fauzan"), ["u1"])
  assert.deepEqual(cek("USTADZ@PESANTREN.ID"), ["u2"])
  assert.deepEqual(cek("wusto"), ["u1"], "Kelas ikut dicari.")
  assert.deepEqual(cek("  "), SEMUA_BARIS.map((r) => r.pengguna.id), "Spasi bukan kata kunci.")
})

test("saringPengguna memisahkan akun yang belum diisi peran", () => {
  const TANPA_PERAN = baris(akun({ id: "u4", jenisPeran: null }))
  const daftar = [SANTRI, USTADZ, TANPA_PERAN]
  assert.deepEqual(
    saringPengguna(daftar, { kata: "", peran: "belum-diisi", akses: SEMUA }).map((r) => r.pengguna.id),
    ["u4"],
  )
  assert.deepEqual(
    saringPengguna(SEMUA_BARIS, { kata: "", peran: "belum-diisi", akses: SEMUA }).map((r) => r.pengguna.id),
    ["u3"],
    "Pengelola tanpa jenis peran ikut terjaring di daftar yang juga berisi admin nonaktif.",
  )
  assert.deepEqual(
    saringPengguna(SEMUA_BARIS, { kata: "", peran: "ustadz", akses: SEMUA }).map((r) => r.pengguna.id),
    ["u2"],
  )
})

test("saringPengguna menggabungkan peran dan hak akses", () => {
  assert.deepEqual(
    saringPengguna(SEMUA_BARIS, { kata: "", peran: "santri", akses: "admin" }),
    [],
    "Santri sekaligus pengelola tidak ada di data ini.",
  )
  assert.deepEqual(
    saringPengguna(SEMUA_BARIS, { kata: "", peran: SEMUA, akses: "admin" }).map((r) => r.pengguna.id),
    ["u3"],
  )
})

test("hitungPengguna melaporkan nonaktif dan pengelola", () => {
  assert.deepEqual(hitungPengguna(SEMUA_BARIS), { total: 3, nonaktif: 1, pengelola: 1 })
  assert.deepEqual(hitungPengguna([]), { total: 0, nonaktif: 0, pengelola: 0 })
})
