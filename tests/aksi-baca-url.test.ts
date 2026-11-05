import assert from "node:assert/strict"
import { mock, test } from "node:test"

/**
 * Test `perpanjangUrlBaca`: aksi publik yang menandatangani ulang URL baca saat
 * sesi membaca lebih panjang dari masa berlaku token CDN.
 *
 * `src/db/queries` dan `next/cache` ditukar. `src/lib/bunny` dan `src/lib/validasi`
 * dibiarkan asli supaya yang diuji adalah tanda tangan HMAC sungguhan dan penolakan
 * Zod sungguhan, bukan string karangan.
 */

const HOST = "cdn.pustakakitab.id"
const TOKEN = "token-cdn-dummy"
const SLUG = "tafsir-al-jalalain"
const PATH = "/pdf/tafsir-al-jalalain-ab12cd34.pdf"
const URL_TERSIMPAN = `https://${HOST}${PATH}`
const PESAN_BAKU = "Naskah belum dapat dimuat ulang. Coba lagi sebentar lagi."

const KUNCI_ENV = [
  "BUNNY_CDN_HOSTNAME",
  "BUNNY_CDN_TOKEN_KEY",
  "BUNNY_SIGNED_URL_EXPIRY_SECONDS",
] as const

/** mock.module berlaku untuk satu file penuh, jadi kondisinya lewat objek yang direset. */
const D = {
  kitab: null as { urlPdf: string } | null,
  slugDitanya: [] as string[],
  lempar: null as Error | null,
  revalid: [] as string[],
}

function aturUlang() {
  D.kitab = null
  D.slugDitanya = []
  D.lempar = null
  D.revalid = []
}

/** Kunci Bunny dibersihkan per test supaya nilai dari .env tidak ikut terpakai. */
async function denganEnv<T>(
  isi: Record<string, string>,
  jalankan: () => T | Promise<T>,
): Promise<T> {
  const semula = new Map<string, string | undefined>(
    KUNCI_ENV.map((kunci) => [kunci, process.env[kunci]]),
  )
  for (const kunci of KUNCI_ENV) delete process.env[kunci]
  Object.assign(process.env, isi)

  try {
    return await jalankan()
  } finally {
    for (const [kunci, nilai] of semula) {
      if (nilai === undefined) delete process.env[kunci]
      else process.env[kunci] = nilai
    }
  }
}

async function daftarkanMock() {
  mock.module("../src/db/queries", {
    namedExports: {
      kitabTayangBySlug: async (slug: string) => {
        D.slugDitanya.push(slug)
        if (D.lempar) throw D.lempar
        return D.kitab
      },
    },
  })

  mock.module("next/cache", {
    namedExports: {
      revalidatePath: (path: string) => {
        D.revalid.push(path)
      },
    },
  })
}

type HasilUrlBaca = { ok: true; url: string | null } | { ok: false; pesan: string }
type ModulAksi = { perpanjangUrlBaca: (slugMentah: string) => Promise<HasilUrlBaca> }

let penyiapan: Promise<void> | null = null
async function aksi(): Promise<ModulAksi> {
  if (!penyiapan) penyiapan = daftarkanMock()
  await penyiapan
  return (await import("../src/actions/baca")) as unknown as ModulAksi
}

const ENV_CDN = { BUNNY_CDN_HOSTNAME: HOST, BUNNY_CDN_TOKEN_KEY: TOKEN }

test("perpanjangUrlBaca menandatangani ulang url_pdf kitab yang tayang", async () => {
  aturUlang()
  D.kitab = { urlPdf: URL_TERSIMPAN }
  const { perpanjangUrlBaca } = await aksi()

  const hasil = await denganEnv(ENV_CDN, () => perpanjangUrlBaca(SLUG))

  assert.equal(hasil.ok, true)
  if (!hasil.ok) throw new Error("aksi seharusnya berhasil")
  assert.ok(hasil.url)
  assert.notEqual(hasil.url, URL_TERSIMPAN)
  assert.match(
    hasil.url,
    /^https:\/\/cdn\.pustakakitab\.id\/[0-9a-f]+\/pdf\/tafsir-al-jalalain-ab12cd34\.pdf\?token=[0-9a-f]{64}$/,
  )
  assert.deepEqual(D.slugDitanya, [SLUG])
  // Aksi baca tidak menulis apa pun, jadi tidak boleh ada cache halaman yang dilepas.
  assert.deepEqual(D.revalid, [])
})

test("perpanjangUrlBaca menolak slug yang tidak ada di katalog tayang", async () => {
  aturUlang()
  D.kitab = null
  const { perpanjangUrlBaca } = await aksi()

  const hasil = await denganEnv(ENV_CDN, () => perpanjangUrlBaca("kitab-yang-tidak-ada"))

  assert.deepEqual(hasil, {
    ok: false,
    pesan: "Kitab ini tidak tersedia untuk dibaca.",
  })
  assert.deepEqual(D.slugDitanya, ["kitab-yang-tidak-ada"])
})

test("perpanjangUrlBaca menolak slug cacat sebelum menyentuh database", async () => {
  aturUlang()
  const { perpanjangUrlBaca } = await aksi()

  const hasil = await denganEnv(ENV_CDN, () => perpanjangUrlBaca("Bukan Slug!"))

  assert.equal(hasil.ok, false)
  if (hasil.ok) throw new Error("slug cacat seharusnya ditolak")
  assert.equal(hasil.pesan, "Slug hanya huruf kecil, angka, dan tanda hubung.")
  assert.deepEqual(D.slugDitanya, [])
})

test("perpanjangUrlBaca mengembalikan url null untuk kitab tanpa PDF", async () => {
  aturUlang()
  D.kitab = { urlPdf: "" }
  const { perpanjangUrlBaca } = await aksi()

  const hasil = await denganEnv(ENV_CDN, () => perpanjangUrlBaca(SLUG))

  assert.deepEqual(hasil, { ok: true, url: null })
})

test("perpanjangUrlBaca menyembunyikan kegagalan teknis di balik pesan aman", async () => {
  aturUlang()
  D.lempar = Object.assign(
    new Error("password authentication failed for user \"neondb_owner\""),
    { name: "NeonDbError" },
  )
  const { perpanjangUrlBaca } = await aksi()

  const hasil = await denganEnv(ENV_CDN, () => perpanjangUrlBaca(SLUG))

  assert.equal(hasil.ok, false)
  if (hasil.ok) throw new Error("kegagalan teknis seharusnya jadi hasil gagal")
  assert.equal(hasil.pesan, PESAN_BAKU)
  assert.ok(!hasil.pesan.includes("password"), "pesan tidak boleh membocorkan detail driver")
})

test("mengembalikan url tersimpan apa adanya saat BUNNY_CDN_HOSTNAME belum diisi", async () => {
  aturUlang()
  D.kitab = { urlPdf: URL_TERSIMPAN }
  const { perpanjangUrlBaca } = await aksi()

  // denganEnv menghapus BUNNY_CDN_HOSTNAME secara eksplisit (bukan hanya tidak
  // mengisinya) karena src/db/env.ts memuat .env.local saat modul diimpor.
  // Jalur penyegaran harus menurun dengan anggun: URL yang kembali identik
  // dengan yang sudah dipegang klien, sehingga pemanggil memutuskan "diam"
  // dan tidak ada loop penyegaran tak terbatas.
  const hasil = await denganEnv({}, () => perpanjangUrlBaca(SLUG))

  assert.equal(hasil.ok, true)
  if (!hasil.ok) throw new Error("tanpa hostname CDN aksi seharusnya tetap berhasil")
  assert.equal(hasil.url, URL_TERSIMPAN)
})
