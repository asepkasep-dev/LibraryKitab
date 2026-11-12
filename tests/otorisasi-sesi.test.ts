import assert from "node:assert/strict"
import Module from "node:module"
import { pathToFileURL } from "node:url"
import { mock, test } from "node:test"
import type { PenggunaVe, Role, StatusPengguna } from "../src/db/queries"

/**
 * `server-only` melempar saat dimuat tanpa bundler Next, dan jalur CJS yang
 * dipakai loader mock menariknya lewat Clerk. Cache require diisi lebih dulu
 * supaya rantai modul bisa dibangun tanpa menjalankan isi modul itu.
 */
const BERKAS_SERVER_ONLY = require.resolve("server-only")
const modulServerOnlyKosong = new Module(BERKAS_SERVER_ONLY)
modulServerOnlyKosong.filename = BERKAS_SERVER_ONLY
modulServerOnlyKosong.loaded = true
modulServerOnlyKosong.exports = {}
require.cache[BERKAS_SERVER_ONLY] = modulServerOnlyKosong

/**
 * Penjaga dipasang lewat file URL, bukan nama paket. tsx mengemas `src/lib/auth`
 * sebagai CJS sehingga impornya menjadi require ke build `dist/cjs`, sementara
 * nama paket di sini masih menunjuk build ESM: lewat nama paket, mock tidak
 * pernah terpasang dan Clerk asli yang jalan.
 */
const urlModul = (nama: string) => pathToFileURL(require.resolve(nama)).href

/**
 * `src/lib/auth` diuji sebagai modul asli di sini, bukan lewat `mock.module`
 * seperti pada test aksi. Semua suite lain menukar penjaga itu dengan stub, jadi
 * percabangan peran dan status tidak punya satu assertion pun: aksi baru yang
 * lupa memanggil penjaga, atau penjaga yang salah membaca kolom `role`, tidak
 * membuat satu test pun merah. Yang ditukar hanya Clerk, `redirect`, dan dua
 * modul database, sehingga keputusan "boleh atau tidak" benar-benar dijalankan.
 */

const CLERK_ID = "user_2abcDEFghiJKLmnoPQRstuvwXY"
const PENGGUNA_ID = "11111111-2222-4333-8444-555555555555"

/** Pengganti `redirect()`: Next melempar objek khusus, di sini cukup tujuannya. */
class Alih extends Error {
  tujuan: string
  constructor(tujuan: string) {
    super(`alih ke ${tujuan}`)
    this.tujuan = tujuan
  }
}

const S = {
  userId: null as string | null,
  klaim: undefined as Record<string, unknown> | undefined,
  tersimpan: null as PenggunaVe | null,
  tanyaClerkId: [] as string[],
  sinkron: [] as { clerkId: string; email: string; namaLengkap: string | null }[],
}

function akun(role: Role, status: StatusPengguna): PenggunaVe {
  return {
    id: PENGGUNA_ID,
    clerkId: CLERK_ID,
    email: "santri@example.com",
    namaLengkap: "Santri Uji",
    jenisPeran: "santri",
    kelas: "10 A",
    role,
    status,
    fontSizePreferensi: 18,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  }
}

function aturUlang() {
  S.userId = CLERK_ID
  S.klaim = { email: "santri@example.com" }
  S.tersimpan = null
  S.tanyaClerkId = []
  S.sinkron = []
}

// Mock didaftarkan sekali sebelum modul diimpor: tsx mengemas file test sebagai
// CJS sehingga `await` di puncak tidak tersedia.
async function daftarkanMock() {
  // `cache()` React memo lewat dispatcher RSC per request pada build react-server,
  // dan menjadi pembungkus identitas pada build biasa. Stub identitas menjaga tiap
  // test independen tanpa bergantung pada ada tidaknya dispatcher di proses ini.
  mock.module(urlModul("react"), { namedExports: { cache: (fn: unknown) => fn } })
  mock.module(urlModul("@clerk/nextjs/server"), {
    namedExports: {
      auth: async () => ({ userId: S.userId, sessionClaims: S.klaim }),
    },
  })
  mock.module(urlModul("next/navigation"), {
    namedExports: {
      redirect: (tujuan: string) => {
        throw new Alih(tujuan)
      },
    },
  })
  mock.module("../src/db/queries", {
    namedExports: {
      penggunaByClerkId: async (clerkId: string) => {
        S.tanyaClerkId.push(clerkId)
        return S.tersimpan
      },
    },
  })
  mock.module("../src/db/mutations", {
    namedExports: {
      pastikanPengguna: async (isi: { clerkId: string; email: string; namaLengkap: string | null }) => {
        S.sinkron.push(isi)
        return akun("member", "aktif")
      },
    },
  })
}

let penyiapan: Promise<void> | null = null
async function gerbang() {
  if (!penyiapan) penyiapan = daftarkanMock()
  await penyiapan
  return import("../src/lib/auth")
}

/** Assertion untuk `redirect` yang diharapkan menuju satu alamat. */
function alihKe(tujuan: string) {
  return (error: unknown) => error instanceof Alih && error.tujuan === tujuan
}

test("pengunjung anonim tidak masuk dan tidak punya hak tulis", async () => {
  aturUlang()
  S.userId = null
  const a = await gerbang()

  const sesi = await a.ambilSesi()
  assert.equal(sesi.pengguna, null)
  assert.equal(sesi.masuk, false)
  assert.equal(sesi.admin, false)
  assert.deepEqual(S.tanyaClerkId, [], "Tanpa userId, database tidak boleh ditanya.")

  await assert.rejects(() => a.butuhAdminAksi(), /Sesi Anda berakhir\. Silakan masuk kembali\./)
  await assert.rejects(
    () => a.butuhMemberAksi(),
    /Masuk dulu agar data Anda tersimpan di akun yang benar\./,
  )
})

test("peran dibaca dari baris users, bukan dari klaim token", async () => {
  aturUlang()
  S.klaim = { email: "santri@example.com", role: "admin", perangkat: "admin" }
  S.tersimpan = akun("member", "aktif")
  const a = await gerbang()

  await assert.rejects(() => a.butuhAdminAksi(), /Hanya pengelola yang dapat mengubah data perpustakaan\./)
  assert.deepEqual(S.tanyaClerkId, [CLERK_ID], "Sumber peran harus baris database milik clerkId ini.")

  const sesi = await a.ambilSesi()
  assert.equal(sesi.admin, false)
  assert.equal(sesi.masuk, true)
})

test("pengelola aktif lolos, anggota biasa lolos sebagai member", async () => {
  aturUlang()
  S.tersimpan = akun("admin", "aktif")
  const a = await gerbang()

  assert.equal((await a.butuhAdminAksi()).id, PENGGUNA_ID)
  assert.equal((await a.butuhMemberAksi()).role, "admin")
})

test("akun nonaktif ditolak sebelum perannya diperiksa", async () => {
  aturUlang()
  S.tersimpan = akun("admin", "nonaktif")
  const a = await gerbang()

  await assert.rejects(() => a.butuhAdminAksi(), /Akun Anda dinonaktifkan oleh pengelola\./)
  await assert.rejects(() => a.butuhMemberAksi(), /Akun Anda dinonaktifkan oleh pengelola\./)
  assert.equal(await a.ambilSesiOpsional(), null)
})

test("anggota aktif punya sesi opsional, anonim dan nonaktif tidak", async () => {
  aturUlang()
  S.tersimpan = akun("member", "aktif")
  const a = await gerbang()

  assert.equal((await a.ambilSesiOpsional())?.id, PENGGUNA_ID)

  aturUlang()
  S.userId = null
  assert.equal(await a.ambilSesiOpsional(), null)
})

test("butuhMember dan butuhAdmin mengalihkan, bukan melempar pesan", async () => {
  aturUlang()
  S.userId = null
  const a = await gerbang()
  await assert.rejects(() => a.butuhMember(), alihKe("/sign-in"))

  aturUlang()
  S.tersimpan = akun("member", "nonaktif")
  await assert.rejects(() => a.butuhMember(), alihKe("/akun-nonaktif"))

  aturUlang()
  S.tersimpan = akun("member", "aktif")
  await assert.rejects(() => a.butuhAdmin(), alihKe("/dashboard"))

  aturUlang()
  S.tersimpan = akun("admin", "aktif")
  assert.equal((await a.butuhAdmin()).role, "admin")
})

test("baris users disinkronkan saat webhook belum sempat membuat akun", async () => {
  aturUlang()
  S.tersimpan = null
  S.klaim = { email: "ustadz@example.com", given_name: "Ustadz", family_name: "Karim" }
  const a = await gerbang()

  const sesi = await a.ambilSesi()
  assert.deepEqual(S.sinkron, [
    { clerkId: CLERK_ID, email: "ustadz@example.com", namaLengkap: "Ustadz Karim" },
  ])
  assert.deepEqual(S.tanyaClerkId, [CLERK_ID], "Baris lama dicari dulu sebelum akun baru dibuat.")
  assert.equal(sesi.masuk, true)
})

test("baris users yang sudah ada tidak memicu pembuatan akun baru", async () => {
  aturUlang()
  S.tersimpan = akun("admin", "aktif")
  const a = await gerbang()

  const sesi = await a.ambilSesi()
  assert.deepEqual(S.sinkron, [], "Akun yang sudah ada tidak boleh ditimpa akun baru.")
  assert.equal(sesi.admin, true, "Peran pengelola dibaca dari baris yang sudah tersimpan.")
})

test("klaim tanpa email memakai sentinel dari clerkId, tanpa nama menjadi null", async () => {
  aturUlang()
  S.tersimpan = null
  S.klaim = undefined
  const a = await gerbang()

  await a.ambilSesi()
  assert.deepEqual(S.sinkron, [
    { clerkId: CLERK_ID, email: `${CLERK_ID}@pengguna.kitabku`, namaLengkap: null },
  ])
})
