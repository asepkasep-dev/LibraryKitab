import assert from "node:assert/strict"
import { test } from "node:test"
import { z } from "zod"
import { gagal } from "../src/actions/tipe"

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
