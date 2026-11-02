import assert from "node:assert/strict"
import { test, type TestContext } from "node:test"
import { z } from "zod"
import { gagal, pesanAman } from "../src/actions/tipe"

class DrizzleQueryError extends Error {
  query: string
  params: unknown[]

  constructor(query: string, params: unknown[]) {
    super(`Failed query: ${query}`)
    this.name = "DrizzleQueryError"
    this.query = query
    this.params = params
  }
}

test("pesan milik aplikasi sendiri tetap ditampilkan", () => {
  const hasil = gagal(new Error("Hanya pengelola yang dapat mengubah data perpustakaan."))
  assert.deepEqual(hasil, {
    ok: false,
    pesan: "Hanya pengelola yang dapat mengubah data perpustakaan.",
  })
})

test("error driver tidak membocorkan SQL ke client", () => {
  const hasil = gagal(
    new DrizzleQueryError('select * from "users" where "email" = $1', ["rahasia@pesantren.id"]),
  )
  assert.equal(hasil.ok, false)
  assert.doesNotMatch(hasil.pesan, /select|users|query/i)
})

test("error Zod memakai pesan pertamanya", () => {
  const hasil = z
    .object({ nama: z.string().min(3, "Nama minimal 3 karakter.") })
    .safeParse({ nama: "ab" })
  assert.equal(hasil.success, false)
  if (hasil.success) throw new Error("Test setup gagal: seharusnya tidak valid.")

  const respons = gagal(hasil.error)
  if (respons.ok) throw new Error("Test setup gagal: seharusnya gagal validasi.")
  assert.equal(respons.pesan, "Nama minimal 3 karakter.")
  assert.deepEqual(respons.bidang, { nama: "Nama minimal 3 karakter." })
})

test("tabrakan keunikan diberi pesan yang bisa ditindaklanjuti", () => {
  const error = Object.assign(new Error("duplicate key value violates unique constraint"), {
    code: "23505",
  })
  assert.match(gagal(error).pesan, /sudah dipakai/)
})

test("database belum dikonfigurasi dijawab dengan instruksi", () => {
  const hasil = gagal(new Error("DATABASE_URL belum diisi."))
  assert.match(hasil.pesan, /\.env\.local/)
})

test("error teknis dicatat di server tanpa membocorkan data pribadi", (t) => {
  const asli = console.error
  const ditulis: string[] = []
  console.error = (...args: unknown[]) => {
    ditulis.push(args.map(String).join(" "))
  }
  t.after(() => {
    console.error = asli
  })

  const hasil = gagal(
    new DrizzleQueryError('select * from "users" where "email" = $1', ["rahasia@pesantren.id"]),
  )

  assert.equal(hasil.pesan, "Belum berhasil menyimpan. Silakan coba lagi.")
  assert.ok(ditulis.length > 0)
  assert.doesNotMatch(ditulis.join(" "), /rahasia@pesantren\.id/)
})

// ---------- kasus pesanAman (Gelombang 4: integritas data, kebisingan error) ----------

const BAKU = "Berkas belum naik ke penyimpanan."

/** Memasang penangkap console.error per test, gaya sama seperti test di atas. */
function tangkapConsoleError(t: TestContext): string[] {
  const asli = console.error
  const ditulis: string[] = []
  console.error = (...args: unknown[]) => {
    ditulis.push(args.map(String).join(" "))
  }
  t.after(() => {
    console.error = asli
  })
  return ditulis
}

test("pesanAman menyaring ECONNREFUSED ke pesan baku", (t) => {
  const ditulis = tangkapConsoleError(t)
  const hasil = pesanAman(new Error("connect ECONNREFUSED 127.0.0.1:5432"), BAKU)
  assert.equal(hasil, BAKU)
  assert.ok(ditulis.length > 0, "Jalur teknis wajib mencatat detail di server.")
})

test("pesanAman menyaring error berbunyi pustaka ke pesan baku", (t) => {
  const ditulis = tangkapConsoleError(t)
  const bunyiPustaka = [
    'relation "kitab" does not exist',
    "Unexpected token < in JSON",
    "password authentication failed for user 'neondb'",
  ]
  for (const pesan of bunyiPustaka) {
    const hasil = pesanAman(new Error(pesan), BAKU)
    assert.equal(hasil, BAKU, `Seharusnya disaring, bukan diteruskan: ${pesan}`)
  }
  // Tepat satu catatan per error teknis, tidak dobel, tidak hilang.
  assert.equal(ditulis.length, bunyiPustaka.length)
})

test("pesanAman meloloskan pesan aplikasi apa adanya", (t) => {
  const ditulis = tangkapConsoleError(t)
  const pesanAplikasi = "Hanya pengelola yang dapat mengubah data perpustakaan."
  const hasil = pesanAman(new Error(pesanAplikasi), BAKU)
  assert.equal(hasil, pesanAplikasi)
  // Pesan aplikasi bukan kegagalan teknis, jangan menambah kebisingan log.
  assert.deepEqual(ditulis, [])
})

test("pesanAman memakai baku untuk nilai non-Error", () => {
  assert.equal(pesanAman(undefined, "Baku."), "Baku.")
  assert.equal(pesanAman("teks kasar", "Baku."), "Baku.")
  assert.equal(pesanAman(null, "Baku."), "Baku.")
})

test("pesanAman tetap memberi instruksi saat DATABASE_URL belum diisi", () => {
  const hasil = pesanAman(new Error("DATABASE_URL belum diisi."), BAKU)
  assert.notEqual(hasil, BAKU)
  assert.match(hasil, /DATABASE_URL/)
  assert.match(hasil, /\.env\.local/)
})

test("pesanAman tetap memberi pesan tabrakan keunikan", () => {
  const error = Object.assign(
    new Error('duplicate key value violates unique constraint "kitab_slug_key"'),
    { code: "23505" },
  )
  const hasil = pesanAman(error, BAKU)
  assert.match(hasil, /sudah dipakai/)
  // Urutan pemeriksaan penting: pesannya berbunyi teknis (memuat "violates"
  // dan "constraint") tetapi kasus keunikan harus menang agar pengguna
  // mendapat teks yang bisa ditindaklanjuti, bukan pesan baku.
  assert.notEqual(hasil, BAKU)

  const lewatPgcode = Object.assign(new Error("gagal menyimpan data"), { pgcode: "23505" })
  assert.match(pesanAman(lewatPgcode, BAKU), /sudah dipakai/)
})

test("pesanAman memakai pesan issue pertama saat ZodError", () => {
  const hasilParse = z
    .object({
      slug: z.string().min(3, "Slug minimal 3 karakter."),
      judul: z.string().min(1, "Judul wajib diisi."),
    })
    .safeParse({ slug: "ab", judul: "" })
  assert.equal(hasilParse.success, false)
  if (hasilParse.success) throw new Error("Test setup gagal: seharusnya tidak valid.")

  assert.equal(pesanAman(hasilParse.error, BAKU), "Slug minimal 3 karakter.")
})

test("jalur teknis pesanAman mengembalikan pesan baku walau pesan aslinya memuat email", (t) => {
  const ditulis = tangkapConsoleError(t)
  const hasil = pesanAman(
    new Error("password authentication failed for user 'rahasia@pesantren.id'"),
    BAKU,
  )
  assert.equal(hasil, BAKU)
  assert.doesNotMatch(hasil, /rahasia@pesantren\.id/)
  assert.ok(ditulis.length > 0, "Jalur teknis wajib mencatat detail di server.")
  // Log server ikut disamarkan: alamat email tidak boleh ikut tersimpan.
  assert.doesNotMatch(ditulis.join(" "), /rahasia@pesantren\.id/)
  assert.match(ditulis.join(" "), /\[email\]/)
})

