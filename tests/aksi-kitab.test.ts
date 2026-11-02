import assert from "node:assert/strict"
import { mock, test } from "node:test"
import type { KitabIsian, LogIsian } from "../src/db/mutations"
import type { HasilAksi } from "../src/actions/tipe"
import { buatTandaBerkas, type MetaBerkasPdf } from "../src/lib/tanda-berkas"
import type { KitabInput } from "../src/lib/validasi"

/**
 * Test `simpanKitab` dan `gantiStatusKitab` pada level aksi: penjaga otorisasi,
 * asal nilai (bukti unggah versus formulir), dan pembersihan berkas.
 *
 * Modul database, otorisasi, Bunny, dan `next/cache` ditukar; validasi Zod,
 * `slugify`, dan tanda tangan HMAC (`src/lib/tanda-berkas`) tetap asli supaya
 * yang diuji adalah token sungguhan, bukan string karangan.
 */

const KUNCI_UJI = "kunci-hmac-uji-0123456789abcdef"
const HOST_UJI = "cdn.pesantren.uji"
const PENGELOLA_ID = "55555555-6666-4555-8555-555555555555"
const ID_KITAB = "0f1c2b3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d"
const ID_KITAB_LAIN = "22222222-3333-4222-9222-222222222222"
const ID_KATEGORI = "33333333-4444-4333-8333-333333333333"
const ID_PENGARANG = "44444444-5555-4444-9444-444444444444"

const urlUji = (path: string) => `https://${HOST_UJI}/${path}`

type BarisKitab = {
  id: string
  judulLatin: string
  slug: string
  urlPdf: string
  ukuranPdfByte: number
  jumlahHalaman: number
  status: KitabInput["status"]
}

type Tulisan = { id: string | null; input: KitabIsian; log: LogIsian }

/** mock.module berlaku untuk satu file penuh, jadi kondisinya lewat objek yang direset. */
const D = {
  tolakPengelola: null as string | null,
  kitab: null as BarisKitab | null,
  kategoriAda: true,
  pengarangAda: true,
  slugTerpakai: new Set<string>(),
  slugTanya: [] as { slug: string; kecualiId?: string }[],
  tulisError: null as Error | null,
  tulisIsi: [] as Tulisan[],
  statusIsi: [] as { id: string; status: string; log: LogIsian }[],
  hapusIsi: [] as string[],
  dipakaiKitabLain: false,
  hapusGagal: false,
}

function aturUlang() {
  D.tolakPengelola = null
  D.kitab = null
  D.kategoriAda = true
  D.pengarangAda = true
  D.slugTerpakai = new Set()
  D.slugTanya = []
  D.tulisError = null
  D.tulisIsi = []
  D.statusIsi = []
  D.hapusIsi = []
  D.dipakaiKitabLain = false
  D.hapusGagal = false
}

// Semua mock didaftarkan sekali, sebelum modul aksi diimpor, karena tsx
// mengemas file test sebagai CJS sehingga `await` di puncak tidak tersedia.
async function daftarkanMock() {
  // Bunny dipakai apa adanya kecuali penghapusan berkas, yang memanggil jaringan.
  const bunnyAsli = await import("../src/lib/bunny")
  mock.module("../src/lib/bunny", {
    namedExports: {
      ...bunnyAsli,
      hapusBerkas: async (path: string) => {
        if (D.hapusGagal) throw new Error("Bunny menolak penghapusan")
        D.hapusIsi.push(path)
        return true
      },
    },
  })

  mock.module("../src/db/mutations", {
    namedExports: {
      tulisKitab: async ({
        id,
        input,
        log,
      }: {
        id: string | null
        input: KitabIsian
        log: LogIsian
      }) => {
        if (D.tulisError) throw D.tulisError
        D.tulisIsi.push({ id, input, log })
        return id ?? ID_KITAB
      },
      ubahStatusKitab: async (id: string, status: string, log: LogIsian) => {
        D.statusIsi.push({ id, status, log })
      },
      hapusKitab: async () => undefined,
      slugKitabTerpakai: async (slug: string, kecualiId?: string) => {
        D.slugTanya.push({ slug, kecualiId })
        return D.slugTerpakai.has(slug)
      },
      urlPdfDipakaiKitabLain: async () => D.dipakaiKitabLain,
    },
  })

  mock.module("../src/db/queries", {
    namedExports: {
      kitabById: async () => D.kitab,
      adaKategori: async () => D.kategoriAda,
      adaPengarang: async () => D.pengarangAda,
    },
  })

  mock.module("../src/lib/auth", {
    namedExports: {
      butuhAdminAksi: async () => {
        if (D.tolakPengelola) throw new Error(D.tolakPengelola)
        return { id: PENGELOLA_ID }
      },
    },
  })

  mock.module("next/cache", {
    namedExports: { revalidatePath: () => undefined },
  })
}

type ModulAksi = {
  simpanKitab: (
    id: string | null,
    data: KitabInput,
    berkas?: { tanda?: string }
  ) => Promise<HasilAksi>
  gantiStatusKitab: (id: string, status: KitabInput["status"]) => Promise<HasilAksi>
}
let penyiapan: Promise<void> | null = null
async function aksi(): Promise<ModulAksi> {
  if (!penyiapan) penyiapan = daftarkanMock()
  await penyiapan
  return (await import("../src/actions/kitab")) as unknown as ModulAksi
}

function inputKitab(ubah: Partial<KitabInput> = {}): KitabInput {
  return {
    judulLatin: "Tafsir Al-Jalalain",
    judulArab: "تفسير الجلالين",
    kategoriId: ID_KATEGORI,
    pengarangId: ID_PENGARANG,
    syarahId: "",
    tahunTerbit: "1425 M",
    jumlahHalaman: 10,
    deskripsi: "Tafsir ringkas yang menjelaskan makna ayat untuk santri pemula di pesantren.",
    status: "draft",
    ...ubah,
  }
}

function barisKitab(ubah: Partial<BarisKitab> = {}): BarisKitab {
  return {
    id: ID_KITAB,
    judulLatin: "Tafsir Al-Jalalain",
    slug: "tafsir-al-jalalain",
    urlPdf: urlUji("pdf/lama-111111.pdf"),
    ukuranPdfByte: 1_048_576,
    jumlahHalaman: 300,
    status: "published",
    ...ubah,
  }
}

function metaUji(ubah: Partial<MetaBerkasPdf> = {}): MetaBerkasPdf {
  return {
    kitabId: null,
    path: "pdf/tafsir-al-jalalain-ab12cd.pdf",
    byte: 5_242_880,
    halaman: 120,
    ...ubah,
  }
}

/** Kunci HMAC dan hostname CDN dibaca saat fungsi dipanggil, jadi diisi lebih dulu. */
process.env.BUNNY_STORAGE_ACCESS_KEY = KUNCI_UJI
process.env.BUNNY_CDN_HOSTNAME = HOST_UJI

/** Pesan driver sengaja diuji; log servernya tidak perlu memenuhi output test. */
async function tanpaLog<T>(jalankan: () => Promise<T>) {
  const semula = console.error
  console.error = () => undefined
  try {
    return await jalankan()
  } finally {
    console.error = semula
  }
}

test("bukan pengelola: ditolak sebelum satu tulisan pun terjadi", async () => {
  aturUlang()
  D.tolakPengelola = "Hanya pengelola yang dapat mengubah data perpustakaan."
  const hasil = await (await aksi()).simpanKitab(null, inputKitab())
  assert.deepEqual(hasil, {
    ok: false,
    pesan: "Hanya pengelola yang dapat mengubah data perpustakaan.",
  })
  assert.equal(D.tulisIsi.length, 0)
})

test("kitab tayang tanpa berkas tidak dapat disimpan", async () => {
  aturUlang()
  const hasil = await (await aksi()).simpanKitab(null, inputKitab({ status: "published" }))
  assert.equal(hasil.ok, false)
  assert.match(hasil.pesan, /berkas PDF-nya belum diunggah/)
  assert.equal(D.tulisIsi.length, 0)
})

test("jumlah halaman dan berkas diambil dari bukti unggah, bukan formulir", async () => {
  aturUlang()
  const meta = metaUji()
  const hasil = await (await aksi()).simpanKitab(null, inputKitab({ status: "published" }), {
    tanda: buatTandaBerkas(meta),
  })
  assert.equal(hasil.ok, true)
  const tulisan = D.tulisIsi[0]
  assert.equal(tulisan?.id, null)
  assert.equal(tulisan?.input.jumlahHalaman, 120, "Angka formulir (10) harus kalah oleh parser PDF.")
  assert.equal(tulisan?.input.urlPdf, urlUji(meta.path))
  assert.equal(tulisan?.input.ukuranPdfByte, meta.byte)
  assert.equal(tulisan?.input.slug, "tafsir-al-jalalain")
  assert.deepEqual(
    { adminId: tulisan?.log.adminId, aksi: tulisan?.log.aksi, targetTabel: tulisan?.log.targetTabel },
    { adminId: PENGELOLA_ID, aksi: "kitab_dibuat", targetTabel: "kitab" },
    "Tulis dan jejak audit harus berangkat bersama."
  )
})

test("bukti unggah milik kitab lain ditolak saat menyunting", async () => {
  aturUlang()
  D.kitab = barisKitab()
  const hasil = await (await aksi()).simpanKitab(ID_KITAB, inputKitab(), {
    tanda: buatTandaBerkas(metaUji({ kitabId: ID_KITAB_LAIN })),
  })
  assert.equal(hasil.ok, false)
  assert.match(hasil.pesan, /tidak cocok dengan kitab ini/)
  assert.equal(D.tulisIsi.length, 0)
  assert.deepEqual(D.hapusIsi, [])
})

test("bukti dari kitab baru tidak berlaku saat menyunting kitab lama", async () => {
  aturUlang()
  D.kitab = barisKitab()
  const hasil = await (await aksi()).simpanKitab(ID_KITAB, inputKitab(), {
    tanda: buatTandaBerkas(metaUji({ kitabId: null })),
  })
  assert.equal(hasil.ok, false)
  assert.match(hasil.pesan, /tidak dikenali/)
  assert.equal(D.tulisIsi.length, 0)
})

test("bukti kedaluwarsa ditolak", async () => {
  aturUlang()
  const empatJamLalu = Date.now() - 4 * 60 * 60 * 1000
  const hasil = await (await aksi()).simpanKitab(null, inputKitab({ status: "published" }), {
    tanda: buatTandaBerkas(metaUji(), empatJamLalu),
  })
  assert.equal(hasil.ok, false)
  assert.match(hasil.pesan, /lewat masa berlaku/)
  assert.equal(D.tulisIsi.length, 0)
})

test("draf tanpa berkas baru memakai nilai tersimpan, bukan angka formulir", async () => {
  aturUlang()
  D.kitab = barisKitab()
  const hasil = await (await aksi()).simpanKitab(ID_KITAB, inputKitab({ jumlahHalaman: 10 }))
  assert.equal(hasil.ok, true)
  assert.equal(D.tulisIsi[0]?.input.jumlahHalaman, 300)
  assert.equal(D.tulisIsi[0]?.input.urlPdf, urlUji("pdf/lama-111111.pdf"))
})

test("tayang ditolak selama jumlah halaman belum terbaca", async () => {
  aturUlang()
  D.kitab = barisKitab({ jumlahHalaman: 0 })
  const hasil = await (await aksi()).simpanKitab(ID_KITAB, inputKitab({ status: "published" }))
  assert.equal(hasil.ok, false)
  assert.match(hasil.pesan, /Jumlah halaman belum terbaca dari PDF/)
  assert.equal(D.tulisIsi.length, 0)
})

test("id kitab wajib berbentuk uuid sebelum menyentuh database", async () => {
  aturUlang()
  const hasil = await (await aksi()).simpanKitab("bukan-uuid", inputKitab())
  assert.equal(hasil.ok, false)
  assert.equal(hasil.pesan, "Identitas data tidak dikenali.")
  assert.equal(D.tulisIsi.length, 0)
})

test("validasi Zod menolak kiriman yang tidak masuk akal", async () => {
  aturUlang()
  const pendek = await (await aksi()).simpanKitab(null, inputKitab({ judulLatin: "ab" }))
  assert.equal(pendek.ok, false)
  assert.equal(pendek.pesan, "Judul Latin minimal 3 karakter.")

  const kategoriAsing = await (await aksi()).simpanKitab(null, inputKitab({ kategoriId: "123" }))
  assert.equal(kategoriAsing.ok, false)
  assert.equal(kategoriAsing.pesan, "Kategori tidak dikenali.")
})

test("fan atau pengarang yang tidak terdaftar ditolak", async () => {
  aturUlang()
  D.kategoriAda = false
  const hasil = await (await aksi()).simpanKitab(null, inputKitab())
  assert.equal(hasil.ok, false)
  assert.equal(hasil.pesan, "Pilih fan yang masih terdaftar.")

  aturUlang()
  D.pengarangAda = false
  const lain = await (await aksi()).simpanKitab(null, inputKitab())
  assert.equal(lain.ok, false)
  assert.equal(lain.pesan, "Pilih pengarang yang masih terdaftar.")
})

test("slug bentrok dinomori dan kitab sendiri tidak memblokir", async () => {
  aturUlang()
  D.kitab = barisKitab()
  D.slugTerpakai = new Set(["tafsir-al-jalalain"])
  const hasil = await (await aksi()).simpanKitab(ID_KITAB, inputKitab())
  assert.equal(hasil.ok, true)
  assert.deepEqual(
    D.slugTanya.map((tanya) => tanya.slug),
    ["tafsir-al-jalalain", "tafsir-al-jalalain-2"]
  )
  assert.equal(D.slugTanya[0]?.kecualiId, ID_KITAB)
  assert.equal(D.tulisIsi[0]?.input.slug, "tafsir-al-jalalain-2")
})

test("perubahan nol baris dilaporkan sebagai kegagalan", async () => {
  aturUlang()
  D.kitab = barisKitab()
  D.tulisError = new Error("Kitab tidak ditemukan di database, perubahan tidak tersimpan.")
  const hasil = await (await aksi()).simpanKitab(ID_KITAB, inputKitab())
  assert.equal(hasil.ok, false)
  assert.equal(hasil.pesan, "Kitab tidak ditemukan di database, perubahan tidak tersimpan.")
})

test("tabrakan slug jadi pesan Indonesia, bukan kutipan SQL", async () => {
  aturUlang()
  const error = new Error(
    'insert into "kitab" ... duplicate key value violates unique constraint "kitab_slug_key"'
  )
  error.name = "NeonDbError"
  D.tulisError = error
  const hasil = await tanpaLog(async () => (await aksi()).simpanKitab(null, inputKitab()))
  assert.equal(hasil.ok, false)
  assert.equal(hasil.pesan, "Nama atau slug ini sudah dipakai data lain. Gunakan kombinasi lain.")
})

test("kegagalan teknis tidak membocorkan nama tabel ke layar", async () => {
  aturUlang()
  const error = new Error('relation "kitab" does not exist')
  error.name = "NeonDbError"
  D.tulisError = error
  const hasil = await tanpaLog(async () => (await aksi()).simpanKitab(null, inputKitab()))
  assert.equal(hasil.ok, false)
  assert.equal(hasil.pesan, "Belum berhasil menyimpan. Silakan coba lagi.")
  assert.doesNotMatch(hasil.pesan, /relation|kitab|SQL/i)
})

test("berkas lama dihapus begitu path berganti", async () => {
  aturUlang()
  D.kitab = barisKitab()
  const meta = metaUji({ kitabId: ID_KITAB })
  const hasil = await (await aksi()).simpanKitab(ID_KITAB, inputKitab(), {
    tanda: buatTandaBerkas(meta),
  })
  assert.equal(hasil.ok, true)
  assert.deepEqual(D.hapusIsi, ["pdf/lama-111111.pdf"])
})

test("berkas yang masih dipakai kitab lain tidak dihapus", async () => {
  aturUlang()
  D.kitab = barisKitab()
  D.dipakaiKitabLain = true
  const hasil = await (await aksi()).simpanKitab(ID_KITAB, inputKitab(), {
    tanda: buatTandaBerkas(metaUji({ kitabId: ID_KITAB })),
  })
  assert.equal(hasil.ok, true)
  assert.deepEqual(D.hapusIsi, [])
})

test("path berkas tidak berubah berarti tidak ada yang dihapus", async () => {
  aturUlang()
  D.kitab = barisKitab({ urlPdf: urlUji("pdf/tafsir-al-jalalain-ab12cd.pdf") })
  const hasil = await (await aksi()).simpanKitab(ID_KITAB, inputKitab(), {
    tanda: buatTandaBerkas(metaUji({ kitabId: ID_KITAB })),
  })
  assert.equal(hasil.ok, true)
  assert.deepEqual(D.hapusIsi, [])
})

test("hapus berkas yang gagal tidak membatalkan kitab tersimpan", async () => {
  aturUlang()
  D.kitab = barisKitab()
  D.hapusGagal = true
  const hasil = await tanpaLog(async () =>
    (await aksi()).simpanKitab(ID_KITAB, inputKitab(), {
      tanda: buatTandaBerkas(metaUji({ kitabId: ID_KITAB })),
    })
  )
  assert.equal(hasil.ok, true)
  assert.equal(hasil.pesan, "Perubahan kitab tersimpan.")
})

test("ganti status: kitab tanpa berkas tidak dapat ditayangkan", async () => {
  aturUlang()
  D.kitab = barisKitab({ urlPdf: "" })
  const hasil = await (await aksi()).gantiStatusKitab(ID_KITAB, "published")
  assert.equal(hasil.ok, false)
  assert.match(hasil.pesan, /tanpa berkas PDF tidak dapat ditayangkan/)
  assert.equal(D.statusIsi.length, 0)
})

test("ganti status: jumlah halaman belum terbaca menahankan tayang", async () => {
  aturUlang()
  D.kitab = barisKitab({ jumlahHalaman: 0 })
  const hasil = await (await aksi()).gantiStatusKitab(ID_KITAB, "published")
  assert.equal(hasil.ok, false)
  assert.match(hasil.pesan, /belum dapat ditayangkan/)
  assert.equal(D.statusIsi.length, 0)
})

test("ganti status sah tercatat dengan jejak admin", async () => {
  aturUlang()
  D.kitab = barisKitab({ status: "draft" })
  const hasil = await (await aksi()).gantiStatusKitab(ID_KITAB, "published")
  assert.equal(hasil.ok, true)
  assert.match(hasil.pesan, /tayang di katalog/)
  assert.deepEqual(D.statusIsi, [
    {
      id: ID_KITAB,
      status: "published",
      log: {
        adminId: PENGELOLA_ID,
        aksi: "kitab_status_diubah",
        targetTabel: "kitab",
        detail: "draft → published",
      },
    },
  ])
})
