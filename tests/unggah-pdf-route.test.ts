import assert from "node:assert/strict"
import { beforeEach, mock, test } from "node:test"
import { PDFDocument } from "pdf-lib"
import { bacaTandaBerkas } from "../src/lib/tanda-berkas"

/**
 * Kunci uji. Bukan kredensial sungguhan; nilainya sengaja khas supaya test bisa
 * membuktikan ia tidak pernah muncul di respons.
 */
const KUNCI_UJI = "kunci-storage-uji-0123456789"
const HOST_UJI = "cdn.uji.example"
const ID_KITAB = "3f2a1b0c-9d8e-4777-8f66-555555555555"
const ID_KITAB_LAIN = "44444444-5555-4555-8555-666666666666"

const D = {
  /** Pengelola dianggap masuk sampai nilai ini diganti. */
  bolehAkses: true,
  /** Error yang dilempar `butuhAdminAksi`, untuk menguji pesan yang dibalast. */
  gangguan: null as Error | null,
  /** Berkas yang benar-benar naik ke penyimpanan palsu. */
  terunggah: [] as { path: string; byte: number; tipe: string }[],
  /** Error yang dilempar `unggahBerkas`. */
  gagalUnggah: null as Error | null,
}

type HasilRoute = { status: number; body: Record<string, unknown> }

let muat: Promise<(req: Request) => Promise<Response>> | null = null

async function routeUnggah() {
  if (!muat) {
    muat = (async () => {
      mock.module("../src/lib/auth", {
        namedExports: {
          butuhAdminAksi: async () => {
            if (D.gangguan) throw D.gangguan
            if (!D.bolehAkses) throw new Error("Hanya pengelola yang dapat mengubah data perpustakaan.")
            return { id: ID_KITAB }
          },
        },
      })
      const bunnyAsli = await import("../src/lib/bunny")
      mock.module("../src/lib/bunny", {
        namedExports: {
          ...bunnyAsli,
          unggahBerkas: async (path: string, isi: Uint8Array, tipe: string) => {
            if (D.gagalUnggah) throw D.gagalUnggah
            D.terunggah.push({ path, byte: isi.byteLength, tipe })
          },
        },
      })
      const modul = (await import("../src/app/api/admin/upload-pdf/route")) as unknown as {
        POST: (req: Request) => Promise<Response>
      }
      return modul.POST
    })()
  }
  return muat
}

/** PDF sungguhan, dibuat di sini supaya parser betulan punya sesuatu untuk dibaca. */
async function pdfSah(jumlahHalaman = 1) {
  const dokumen = await PDFDocument.create()
  for (let i = 0; i < jumlahHalaman; i += 1) dokumen.addPage([400, 600])
  return new Uint8Array(await dokumen.save())
}

function formulir(berkas: Blob, fields: Record<string, string> = {}) {
  const muatan = new FormData()
  muatan.append("berkas", berkas)
  for (const [nama, nilai] of Object.entries(fields)) muatan.append(nama, nilai)
  return muatan
}

const ENV_DASAR: Record<string, string | null> = {
  BUNNY_CDN_HOSTNAME: HOST_UJI,
  BUNNY_STORAGE_ACCESS_KEY: KUNCI_UJI,
  MAX_PDF_SIZE_MB: "150",
  ALLOWED_PDF_MIME: "application/pdf",
  // Dihilangkan supaya masa berlaku bukti selalu baku 3 jam, tidak ikut
  // dipengaruhi nilai yang tertinggal di shell yang menjalankan test.
  TANDA_BERKAS_MASA_DETIK: null,
}

/**
 * Kunci dan host uji juga dipasang di luar jendela request: test yang membaca
 * balik bukti memanggil `bacaTandaBerkas` setelah env per-request dikembalikan,
 * dan verifikasi itu butuh kunci yang sama dengan yang menandatangani.
 */
process.env.BUNNY_STORAGE_ACCESS_KEY = KUNCI_UJI
process.env.BUNNY_CDN_HOSTNAME = HOST_UJI
delete process.env.TANDA_BERKAS_MASA_DETIK

/**
 * Setiap test mulai dari pengelola yang boleh masuk dan penyimpanan yang sehat;
 * test yang butuh kegagalan mengganti salah satu nilai ini sebelum memanggil
 * `unggah`.
 */
beforeEach(() => {
  D.bolehAkses = true
  D.gangguan = null
  D.gagalUnggah = null
  D.terunggah = []
})

async function unggah(body: FormData | string, override: Record<string, string | null> = {}): Promise<HasilRoute> {
  const post = await routeUnggah()

  const env = { ...ENV_DASAR, ...override }
  const asli: Record<string, string | undefined> = {}
  for (const [nama, nilai] of Object.entries(env)) {
    asli[nama] = process.env[nama]
    if (nilai === null) delete process.env[nama]
    else process.env[nama] = nilai
  }

  try {
    const req =
      typeof body === "string"
        ? new Request("http://localhost/api/admin/upload-pdf", {
            method: "POST",
            body,
            headers: { "content-type": "text/plain" },
          })
        : new Request("http://localhost/api/admin/upload-pdf", { method: "POST", body })
    const respons = await post(req)
    return { status: respons.status, body: (await respons.json()) as Record<string, unknown> }
  } finally {
    for (const [nama, nilai] of Object.entries(asli)) {
      if (nilai === undefined) delete process.env[nama]
      else process.env[nama] = nilai
    }
  }
}

const berkasPdf = async (nama = "Kitab Uji.pdf") =>
  new File([await pdfSah()], nama, { type: "application/pdf" })

/* ------------------------------- gerbang akses ------------------------------- */

test("tanpa pengelola, unggahan ditolak 403 dan berkas tidak naik", async () => {
  D.bolehAkses = false
  const hasil = await unggah(formulir(await berkasPdf()))
  assert.equal(hasil.status, 403)
  assert.equal(hasil.body.ok, false)
  assert.match(String(hasil.body.pesan), /pengelola/i)
  assert.deepEqual(D.terunggah, [])
})

test("kegagalan sesi tidak membocorkan detail teknis ke layar unggah", async () => {
  D.gangguan = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:5432"), { name: "NeonDbError" })
  const hasil = await unggah(formulir(await berkasPdf()))
  assert.equal(hasil.status, 403)
  assert.equal(hasil.body.pesan, "Unggahan hanya tersedia untuk pengelola yang masuk.")
  assert.doesNotMatch(JSON.stringify(hasil.body), /ECONNREFUSED|127\.0\.0\.1/)
})

test("alamat tayang belum dikonfigurasi: 501 sebelum satu byte pun diterima", async () => {
  const hasil = await unggah(formulir(await berkasPdf()), { BUNNY_CDN_HOSTNAME: "" })
  assert.equal(hasil.status, 501)
  assert.match(String(hasil.body.pesan), /BUNNY_CDN_HOSTNAME/)
  assert.deepEqual(D.terunggah, [])
})

/* ------------------------------ bentuk muatan ------------------------------ */

test("muatan bukan formulir ditolak 400, bukan 500", async () => {
  const hasil = await unggah("ini bukan multipart")
  assert.equal(hasil.status, 400)
  assert.match(String(hasil.body.pesan), /formulir/i)
})

test("tanpa field berkas, respons 400", async () => {
  const muatan = new FormData()
  muatan.append("slug", "kitab-tanpa-berkas")
  const hasil = await unggah(muatan)
  assert.equal(hasil.status, 400)
  assert.match(String(hasil.body.pesan), /PDF/i)
})

test("berkas nol byte ditolak 400", async () => {
  const hasil = await unggah(formulir(new File([], "kosong.pdf", { type: "application/pdf" })))
  assert.equal(hasil.status, 400)
  assert.match(String(hasil.body.pesan), /kosong/i)
})

test("berkas di atas batas ditolak 413 tanpa menyentuh penyimpanan", async () => {
  const isi = new Uint8Array(1024 * 1024 + 1)
  const berkas = new File([isi], "melebihi-batas.pdf", { type: "application/pdf" })
  const hasil = await unggah(formulir(berkas), { MAX_PDF_SIZE_MB: "1" })
  assert.equal(hasil.status, 413)
  assert.match(String(hasil.body.pesan), /terlalu besar/i)
  assert.match(String(hasil.body.pesan), /1 MB/)
  assert.deepEqual(D.terunggah, [])
})

test("ukuran diperiksa lebih dulu daripada bentuk idKitab", async () => {
  // Isinya sengaja juga bukan PDF dan id-nya juga salah; yang menjawab urutan
  // route, jadi test ini tetap berdiri kalau salah satu pemeriksaan dipindah.
  const isi = new Uint8Array(2 * 1024 * 1024)
  const berkas = new File([isi], "rusak-dan-kebesaran.pdf", { type: "application/pdf" })
  const hasil = await unggah(formulir(berkas, { idKitab: "bukan-uuid" }), { MAX_PDF_SIZE_MB: "1" })
  assert.equal(hasil.status, 413, "Batas ukuran menjawab sebelum bentuk idKitab diperiksa.")
})

test("idKitab yang bukan uuid ditolak sebelum berkas diunggah", async () => {
  const hasil = await unggah(formulir(await berkasPdf(), { idKitab: "bukan-uuid" }))
  assert.equal(hasil.status, 400)
  assert.match(String(hasil.body.pesan), /tidak dikenali/i)
  assert.deepEqual(D.terunggah, [])
})

/* -------------------------------- jenis isi -------------------------------- */

test("isi bukan PDF ditolak 415 walau ekstensi dan mime mengaku PDF", async () => {
  const berkas = new File([Buffer.from("<html>bukan pdf</html>")], "tersembunyi.pdf", {
    type: "application/pdf",
  })
  const hasil = await unggah(formulir(berkas))
  assert.equal(hasil.status, 415)
  assert.deepEqual(D.terunggah, [])
})

test("mime di luar daftar masih lolos bila nama berkas .pdf dan isinya PDF sungguhan", async () => {
  const berkas = new File([await pdfSah()], "Kitabmime.pdf", { type: "application/octet-stream" })
  const hasil = await unggah(formulir(berkas))
  assert.equal(hasil.status, 200)
  assert.equal(hasil.body.ok, true)
})

test("PDF rusak di balast 422, bukan crash parser", async () => {
  const berkas = new File([Buffer.from("%PDF-1.7\n" + "x".repeat(200))], "robek.pdf", {
    type: "application/pdf",
  })
  const hasil = await unggah(formulir(berkas))
  assert.equal(hasil.status, 422)
  assert.match(String(hasil.body.pesan), /rusak/i)
  assert.deepEqual(D.terunggah, [])
})

test("slug yang tidak dapat dibentuk ditolak 400", async () => {
  const berkas = new File([await pdfSah()], "aku.pdf", { type: "application/pdf" })
  const hasil = await unggah(formulir(berkas, { slug: "???" }))
  assert.equal(hasil.status, 400)
  assert.deepEqual(D.terunggah, [])
})

/* ------------------------------ bukti terikat ------------------------------ */

test("bukti unggah lahir dari hitungan server dan terikat ke kitab sasaran", async () => {
  const isi = await pdfSah(2)
  const hasil = await unggah(formulir(new File([isi], "Kitab Dua Halaman.pdf", { type: "application/pdf" }), {
    idKitab: ID_KITAB,
    slug: "Kitab Dua Halaman",
    // Klien mencoba mengarang angka; route tidak pernah membacanya.
    halaman: "9999",
    byte: "1",
  }))

  assert.equal(hasil.status, 200)
  const meta = bacaTandaBerkas(String(hasil.body.tanda), ID_KITAB)
  assert.ok(meta, "Bukti harus lolos verifikasi untuk kitab yang dituju.")
  assert.equal(meta.halaman, 2, "Jumlah halaman berasal dari parser, bukan dari formulir.")
  assert.equal(meta.byte, isi.byteLength)
  assert.equal(meta.kitabId, ID_KITAB)
  assert.deepEqual(D.terunggah, [{ path: String(hasil.body.path), byte: isi.byteLength, tipe: "application/pdf" }])
})

test("bukti milik kitab A tidak bisa dipakai menempelkan berkas ke kitab B", async () => {
  const hasil = await unggah(
    formulir(await berkasPdf(), { idKitab: ID_KITAB, slug: "kitab-uji" })
  )
  assert.equal(hasil.status, 200)
  // Sah untuk A diperiksa lebih dulu; tanpa itu penolakan untuk B bisa lolos
  // kosong walau tanda tangannya tidak terikat ke siapa pun.
  assert.ok(bacaTandaBerkas(String(hasil.body.tanda), ID_KITAB), "Bukti harus berlaku untuk kitab A.")
  assert.equal(bacaTandaBerkas(String(hasil.body.tanda), ID_KITAB_LAIN), null)
})

test("unggah sebelum kitab dibuat menghasilkan bukti tanpa id sasaran", async () => {
  const hasil = await unggah(formulir(await berkasPdf(), { slug: "belum ada kitabnya" }))
  assert.equal(hasil.status, 200)
  const meta = bacaTandaBerkas(String(hasil.body.tanda), null)
  assert.ok(meta)
  assert.equal(meta.kitabId, null)
})

test("dua unggahan dengan slug sama tidak saling menimpa", async () => {
  const pertama = await unggah(formulir(await berkasPdf(), { slug: "Kitab Kembar" }))
  const kedua = await unggah(formulir(await berkasPdf(), { slug: "Kitab Kembar" }))

  assert.equal(pertama.status, 200)
  assert.equal(kedua.status, 200)
  assert.notEqual(pertama.body.path, kedua.body.path)
  assert.match(String(pertama.body.path), /^pdf\/kitab-kembar-[0-9a-f-]{8}\.pdf$/)
  assert.equal(D.terunggah.length, 2)
})

/* ------------------------------ kegagalan Bunny ------------------------------ */

test("penyimpanan menolak dengan pesan konfigurasi: 502 dan bukti tidak dikirim", async () => {
  D.gagalUnggah = new Error("Bunny menolak unggahan dengan status 403. Periksa konfigurasi storage zone.")
  const hasil = await unggah(formulir(await berkasPdf(), { slug: "kitab-uji" }))
  assert.equal(hasil.status, 502)
  assert.equal(hasil.body.ok, false)
  assert.match(String(hasil.body.pesan), /storage zone/)
  assert.equal(hasil.body.tanda, undefined, "Bukti tidak boleh lahir dari berkas yang tidak naik.")
  assert.equal(hasil.body.path, undefined)
})

test("kegagalan jaringan dibalast pesan baku, balasan vendor tidak ikut ke klien", async () => {
  D.gagalUnggah = new TypeError("fetch failed")
  const hasil = await unggah(formulir(await berkasPdf(), { slug: "kitab-uji" }))
  assert.equal(hasil.status, 502)
  assert.equal(hasil.body.pesan, "Berkas belum naik ke penyimpanan. Coba unggah ulang.")
})

test("kunci penyimpanan tidak pernah muncul di respons unggah", async () => {
  const hasil = await unggah(formulir(await berkasPdf(), { slug: "kitab-uji" }))
  assert.equal(hasil.status, 200)
  assert.ok(!JSON.stringify(hasil.body).includes(KUNCI_UJI), "Nilai kunci dilarang ada di muatan respons.")
})
