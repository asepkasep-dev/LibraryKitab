import assert from "node:assert/strict"
import { mock, test } from "node:test"
import { Webhook } from "svix"

/**
 * Test POST /api/webhooks/clerk pada level route. Signature dibuat dengan svix
 * asli di atas body mentah, jadi yang diperiksa benar-benar jalur yang dipakai
 * Clerk: verifikasi dulu, baru muatan dipercaya.
 *
 * Hanya `@/db/mutations` yang ditukar. Pembacaan muatan (`@/lib/webhook-clerk`)
 * dan pustaka tanda tangan dipakai apa adanya.
 */

const RAHASIA_UJI = `whsec_${Buffer.from("kunci-webhook-uji-0123456789abcdef").toString("base64")}`
const RAHASIA_PALSU = `whsec_${Buffer.from("kunci-webhook-penyerang-9876543210").toString("base64")}`
const ID_PENGGUNA_LOKAL = "11111111-2222-4333-8444-555555555555"

/** mock.module berlaku untuk seluruh file, jadi kondisi dan tangkapan direset per test. */
const situasi = {
  gagalTulis: null as Error | null,
}

const tangkapan = {
  pastikan: [] as { clerkId: string; email: string; namaLengkap: string | null }[],
  hapus: [] as string[],
}

mock.module("../src/db/mutations", {
  namedExports: {
    pastikanPengguna: async (isian: {
      clerkId: string
      email: string
      namaLengkap: string | null
    }) => {
      tangkapan.pastikan.push(isian)
      if (situasi.gagalTulis) throw situasi.gagalTulis
      return { id: ID_PENGGUNA_LOKAL }
    },
    hapusPenggunaByClerkId: async (clerkId: string) => {
      tangkapan.hapus.push(clerkId)
      return ID_PENGGUNA_LOKAL
    },
  },
})

async function route(req: Request) {
  const modul = (await import("../src/app/api/webhooks/clerk/route")) as unknown as {
    POST: (req: Request) => Promise<Response>
  }
  return modul.POST(req)
}

/** Tanda tangan Svix: `id.unixDetik.body`, header timestamp memakai detik yang sama. */
function permintaan(body: string, kunci = RAHASIA_UJI, umurDetik = 0): Request {
  const msgId = "evt_uji_01"
  const waktu = new Date(Date.now() - umurDetik * 1000)
  const signature = new Webhook(kunci).sign(msgId, waktu, body)
  return new Request("http://localhost/api/webhooks/clerk", {
    method: "POST",
    body,
    headers: {
      "svix-id": msgId,
      "svix-timestamp": String(Math.floor(waktu.getTime() / 1000)),
      "svix-signature": signature,
    },
  })
}

const EVENTO_USER = {
  type: "user.created",
  data: {
    id: "user_2AbCdEfGhIj",
    primary_email_address_id: "idn_1",
    email_addresses: [
      { id: "idn_2", email_address: "cadangan@pesantren.id" },
      { id: "idn_1", email_address: "santri@pesantren.id" },
    ],
    first_name: "Ahmad",
    last_name: "Zaki",
  },
}

async function denganRahasia<T>(rahasia: string | undefined, jalankan: () => Promise<T>) {
  const semula = process.env.CLERK_WEBHOOK_SECRET
  if (rahasia === undefined) delete process.env.CLERK_WEBHOOK_SECRET
  else process.env.CLERK_WEBHOOK_SECRET = rahasia
  try {
    return await jalankan()
  } finally {
    if (semula === undefined) delete process.env.CLERK_WEBHOOK_SECRET
    else process.env.CLERK_WEBHOOK_SECRET = semula
  }
}

async function tanpaTulis(): Promise<void> {
  assert.deepEqual(tangkapan.pastikan, [], "pastikanPengguna tidak boleh dipanggil")
  assert.deepEqual(tangkapan.hapus, [], "hapusPenggunaByClerkId tidak boleh dipanggil")
}

test("CLERK_WEBHOOK_SECRET kosong membalas 500 tanpa menyentuh database", async () => {
  tangkapan.pastikan.length = 0
  tangkapan.hapus.length = 0
  await denganRahasia(undefined, async () => {
    const respons = await route(permintaan(JSON.stringify(EVENTO_USER)))
    assert.equal(respons.status, 500)
    const isi = (await respons.json()) as { error: string }
    assert.match(isi.error, /CLERK_WEBHOOK_SECRET/)
  })
  await tanpaTulis()
})

test("header svix tidak lengkap ditolak 400", async () => {
  tangkapan.pastikan.length = 0
  const body = JSON.stringify(EVENTO_USER)
  const tanpaHeader = new Request("http://localhost/api/webhooks/clerk", {
    method: "POST",
    body,
    headers: { "svix-id": "evt_uji_01" },
  })
  await denganRahasia(RAHASIA_UJI, async () => {
    const respons = await route(tanpaHeader)
    assert.equal(respons.status, 400)
  })
  await tanpaTulis()
})

test("signature dari kunci lain ditolak 400", async () => {
  tangkapan.pastikan.length = 0
  const body = JSON.stringify(EVENTO_USER)
  // Header memakai id/timestamp yang sah, tapi dihitung dengan kunci penyerang.
  const respons = await denganRahasia(RAHASIA_UJI, () =>
    route(permintaan(body, RAHASIA_PALSU))
  )
  assert.equal(respons.status, 400)
  const isi = (await respons.json()) as { error: string }
  assert.equal(isi.error, "Signature webhook tidak valid.")
  await tanpaTulis()
})

test("body diubah setelah ditandatangani ditolak 400", async () => {
  tangkapan.pastikan.length = 0
  const asli = JSON.stringify(EVENTO_USER)
  const tanda = permintaan(asli)
  const header = Object.fromEntries(tanda.headers.entries())
  const palsu = new Request("http://localhost/api/webhooks/clerk", {
    method: "POST",
    body: JSON.stringify({ ...EVENTO_USER, data: { ...EVENTO_USER.data, id: "user_penyerang" } }),
    headers: header,
  })
  const respons = await denganRahasia(RAHASIA_UJI, () => route(palsu))
  assert.equal(respons.status, 400)
  await tanpaTulis()
})

test("evento berumur lewat toleransi lima menit ditolak 400", async () => {
  tangkapan.pastikan.length = 0
  const respons = await denganRahasia(RAHASIA_UJI, () =>
    route(permintaan(JSON.stringify(EVENTO_USER), RAHASIA_UJI, 6 * 60))
  )
  assert.equal(respons.status, 400)
  await tanpaTulis()
})

test("tipe evento di luar yang dipakai diakui 200 tanpa menulis", async () => {
  tangkapan.pastikan.length = 0
  const body = JSON.stringify({ type: "session.created", data: { id: "sess_1" } })
  const respons = await denganRahasia(RAHASIA_UJI, () => route(permintaan(body)))
  assert.equal(respons.status, 200)
  assert.deepEqual(await respons.json(), { received: true, diabaikan: "session.created" })
  await tanpaTulis()
})

test("muatan rusak pada tipe yang dipakai ditolak 400", async () => {
  tangkapan.pastikan.length = 0
  const body = JSON.stringify({ type: "user.created", data: { id: "" } })
  const respons = await denganRahasia(RAHASIA_UJI, () => route(permintaan(body)))
  assert.equal(respons.status, 400)
  const isi = (await respons.json()) as { error: string }
  assert.equal(isi.error, "Muatan webhook tidak valid.")
  await tanpaTulis()
})

test("user.created hanya mengirim identitas, public_metadata peran diabaikan", async () => {
  tangkapan.pastikan.length = 0
  const body = JSON.stringify({
    ...EVENTO_USER,
    data: { ...EVENTO_USER.data, public_metadata: { role: "admin", status: "aktif" } },
  })
  const respons = await denganRahasia(RAHASIA_UJI, () => route(permintaan(body)))
  assert.equal(respons.status, 200)
  assert.deepEqual(await respons.json(), { received: true, id: ID_PENGGUNA_LOKAL })

  assert.equal(tangkapan.pastikan.length, 1)
  const isian = tangkapan.pastikan[0]
  // Kunci inilah satu-satunya yang boleh sampai ke database.
  assert.deepEqual(Object.keys(isian).sort(), ["clerkId", "email", "namaLengkap"])
  assert.deepEqual(isian, {
    clerkId: "user_2AbCdEfGhIj",
    email: "santri@pesantren.id",
    namaLengkap: "Ahmad Zaki",
  })
  assert.equal(tangkapan.hapus.length, 0)
})

test("email primer dipakai walau urutannya di belakang daftar", async () => {
  tangkapan.pastikan.length = 0
  const respons = await denganRahasia(RAHASIA_UJI, () =>
    route(permintaan(JSON.stringify(EVENTO_USER)))
  )
  assert.equal(respons.status, 200)
  assert.equal(tangkapan.pastikan[0]?.email, "santri@pesantren.id")
})

test("user.deleted menghapus baris lokal lewat clerkId", async () => {
  tangkapan.pastikan.length = 0
  tangkapan.hapus.length = 0
  const body = JSON.stringify({ type: "user.deleted", data: { id: "user_2AbCdEfGhIj" } })
  const respons = await denganRahasia(RAHASIA_UJI, () => route(permintaan(body)))
  assert.equal(respons.status, 200)
  assert.deepEqual(await respons.json(), { received: true, dihapus: ID_PENGGUNA_LOKAL })
  assert.deepEqual(tangkapan.hapus, ["user_2AbCdEfGhIj"])
  assert.equal(tangkapan.pastikan.length, 0)
})

test("kegagalan database dibiarkan melewat supaya Clerk mengirim ulang", async () => {
  tangkapan.pastikan.length = 0
  situasi.gagalTulis = new Error("koneksi database terputus")
  try {
    const hasil = await denganRahasia(RAHASIA_UJI, () =>
      route(permintaan(JSON.stringify(EVENTO_USER))).then(() => "terbalas" as const)
    )
    assert.fail(`Route seharusnya melewat error, malah ${hasil}`)
  } catch (error) {
    assert.ok(
      error instanceof Error && /koneksi database/.test(error.message),
      `Route seharusnya melewat error database, malah: ${String(error)}`
    )
  } finally {
    situasi.gagalTulis = null
  }
})
