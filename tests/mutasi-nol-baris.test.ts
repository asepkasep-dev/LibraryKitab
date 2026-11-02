import assert from "node:assert/strict"
import { mock, test } from "node:test"

/**
 * UPDATE kelola harus jujur soal baris yang berubah. Neon HTTP mengirim
 * `db.batch` sebagai satu transaksi; tiap pernyataan dipetakan lewat
 * `mapResult`, yang mengembalikan isi `rows` hanya saat pernyataan itu membawa
 * RETURNING. Klien palsu di bawah meniru bentuk itu: hasil pertama selalu
 * array baris sesuai `D.baris`.
 */

const ID = "0f1c2b3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d"
const ADMIN = "55555555-6666-4555-8555-555555555555"

const LOG = { adminId: ADMIN, aksi: "uji_diperbarui", targetTabel: "uji" }

type Pernyataan = { jenis: string; adaReturning: boolean }

const D = {
  /** Baris yang dibalast oleh database untuk pernyataan pertama. */
  baris: [] as unknown[],
  /** Pernyataan yang dibangun modul, tercatat apa adanya. */
  tercatat: [] as Pernyataan[],
  jumlahBatch: 0,
  isiBatch: [] as unknown[],
}

function pernyataanPalsu(jenis: string) {
  const pernyataan: Pernyataan = { jenis, adaReturning: false }
  const rantai: Record<string, unknown> = {
    set: () => rantai,
    values: () => rantai,
    where: () => rantai,
    returning: () => {
      pernyataan.adaReturning = true
      return rantai
    },
  }
  D.tercatat.push(pernyataan)
  return { rantai, pernyataan }
}

const dbPalsu = {
  update: () => pernyataanPalsu("update").rantai,
  insert: () => pernyataanPalsu("insert").rantai,
  delete: () => pernyataanPalsu("delete").rantai,
  batch: async (pernyataan: unknown[]) => {
    D.jumlahBatch += 1
    D.isiBatch = pernyataan
    return [D.baris, [{ id: "log-1" }]]
  },
}

type ModulMutasi = {
  ubahKategori: (id: string, input: unknown, log: unknown) => Promise<string>
  ubahPengarang: (id: string, input: unknown, log: unknown) => Promise<string>
  ubahStatusKitab: (id: string, status: unknown, log: unknown) => Promise<unknown>
  ubahRolePengguna: (id: string, role: unknown, log: unknown) => Promise<unknown>
  ubahStatusPengguna: (id: string, status: unknown, log: unknown) => Promise<unknown>
  tulisKitab: (arg: unknown) => Promise<string>
}

let muat: Promise<ModulMutasi> | null = null

async function modul(): Promise<ModulMutasi> {
  if (!muat) {
    muat = (async () => {
      const schemaAsli = await import("../src/db/schema")
      mock.module("../src/db/index", { namedExports: { db: dbPalsu, schema: schemaAsli } })
      return (await import("../src/db/mutations")) as unknown as ModulMutasi
    })()
  }
  return muat
}

function reset() {
  D.baris = []
  D.tercatat = []
  D.jumlahBatch = 0
  D.isiBatch = []
}

/** Satu baris per UPDATE kelola; `panggil` memakai argumen sah tiap fungsi. */
const kasus = [
  {
    nama: "kategori",
    panggil: async (m: ModulMutasi) => m.ubahKategori(ID, { nama: "Nahwu", slug: "nahwu", deskripsi: "" }, LOG),
  },
  {
    nama: "pengarang",
    panggil: async (m: ModulMutasi) =>
      m.ubahPengarang(
        ID,
        { namaArab: "Imam An-Nawawi", namaLatin: "Imam An-Nawawi", tahunWafat: "", biografiSingkat: "" },
        LOG
      ),
  },
  {
    nama: "kitab",
    panggil: async (m: ModulMutasi) => m.ubahStatusKitab(ID, "published", LOG),
  },
  {
    nama: "pengguna",
    panggil: async (m: ModulMutasi) => m.ubahRolePengguna(ID, "admin", LOG),
  },
  {
    nama: "pengguna",
    panggil: async (m: ModulMutasi) => m.ubahStatusPengguna(ID, "nonaktif", LOG),
  },
]

test("UPDATE kelola menolak saat baris sasarannya sudah hilang", async () => {
  reset()
  const m = await modul()
  D.baris = []

  for (const { nama, panggil } of kasus) {
    await assert.rejects(
      () => panggil(m),
      (error: unknown) => {
        assert.ok(error instanceof Error, `${nama}: harus Error, bukan nilai lain.`)
        assert.match(error.message, /tidak ditemukan/i, `${nama}: pesan harus menyebut hilangnya data.`)
        assert.match(error.message, /tidak tersimpan/i, `${nama}: pesan harus menegaskan nol perubahan.`)
        return true
      },
      `${nama} seharusnya menolak walau database balas nol baris`
    )
  }
})

test("pesan tolak menyebut entitas yang hilang, bukan sekadar gagal", async () => {
  reset()
  const m = await modul()
  D.baris = []

  const pesan = await m.ubahKategori(ID, { nama: "Nahwu", slug: "nahwu", deskripsi: "" }, LOG).then(
    () => null,
    (error: unknown) => (error as Error).message
  )
  assert.ok(pesan)
  assert.match(pesan, /kategori/i)
})

test("UPDATE kelola tetap lolos saat baris sasarannya ada", async () => {
  const m = await modul()

  for (const { nama, panggil } of kasus) {
    reset()
    D.baris = [{ id: ID }]
    await panggil(m)
    assert.equal(D.jumlahBatch, 1, `${nama}: satu request tulis+audit saat barisnya ada`)
  }
})

test("bukti baris diminta lewat RETURNING agar nol baris terdeteksi", async () => {
  const m = await modul()
  for (const { nama, panggil } of kasus) {
    reset()
    D.baris = [{ id: ID }]
    await panggil(m)
    const update = D.tercatat.find((p) => p.jenis === "update")
    assert.ok(update, `${nama}: pernyataan UPDATE harus dibangun`)
    assert.ok(
      update.adaReturning,
      `${nama}: tanpa RETURNING tidak ada baris bukti, perubahan nol tak terbedakan dari sukses`
    )
  }
})

test("jejak audit dikirim satu request bersama UPDATE walau perubahannya nol baris", async () => {
  reset()
  const m = await modul()
  D.baris = []

  await m.ubahKategori(ID, { nama: "Nahwu", slug: "nahwu", deskripsi: "" }, LOG).catch(() => undefined)

  assert.equal(D.jumlahBatch, 1, "Tulis dan jejak audit harus satu request, bukan dua.")
  assert.equal(D.isiBatch.length, 2, "Batch berisi UPDATE lalu INSERT logAdmin.")
})

test("regresi: tulisKitab sudah menolak baris kosong", async () => {
  reset()
  const m = await modul()
  D.baris = []

  await assert.rejects(
    () =>
      m.tulisKitab({
        id: ID,
        input: {
          judulLatin: "Kitab Uji",
          judulArab: "",
          slug: "kitab-uji",
          urlPdf: "https://cdn.example/kitab-uji.pdf",
          ukuranPdfByte: 1000,
          kategoriId: null,
          pengarangId: null,
          syarahId: null,
          deskripsi: "",
          tahunTerbit: null,
          jumlahHalaman: 10,
          status: "draft",
        },
        log: LOG,
      }),
    /tidak ditemukan/i
  )
})
