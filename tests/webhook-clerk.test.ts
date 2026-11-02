import assert from "node:assert/strict"
import { test } from "node:test"
import {
  rencanaDariEvento,
  type RencanaWebhook,
} from "../src/lib/webhook-clerk"

/** Menyaring hasil agar assertion field terbaca jelas di tiap test. */
function sebagaiUpsert(rencana: RencanaWebhook | null) {
  assert.ok(rencana, "Seharusnya menghasilkan rencana, bukan null.")
  if (rencana.jenis !== "upsert") {
    throw new Error(`Test setup gagal: jenis rencana "${rencana.jenis}", diharapkan upsert.`)
  }
  return rencana
}

test("email utama diambil lewat primary_email_address_id, bukan urutan pertama", () => {
  const rencana = sebagaiUpsert(
    rencanaDariEvento({
      type: "user.created",
      data: {
        id: "user_1",
        primary_email_address_id: "email_2",
        email_addresses: [
          { id: "email_1", email_address: "cadangan@pesantren.id" },
          { id: "email_2", email_address: "utama@pesantren.id" },
        ],
      },
    }),
  )
  assert.equal(rencana.email, "utama@pesantren.id")
  assert.equal(rencana.clerkId, "user_1")
})

test("tanpa email_addresses, email fallback memakai sentinel dari clerkId", () => {
  const rencana = sebagaiUpsert(
    rencanaDariEvento({ type: "user.created", data: { id: "user_9" } }),
  )
  assert.equal(rencana.email, "user_9@pengguna.kitabku")
})

test("public_metadata peran dan status diabaikan, rencana hanya berisi identitas", () => {
  const adminKarangan = sebagaiUpsert(
    rencanaDariEvento({
      type: "user.created",
      data: { id: "user_a", public_metadata: { role: "admin", status: "nonaktif" } },
    }),
  )
  // Kolomnya hilang sama sekali, bukan sekadar bernilai aman, supaya route tidak
  // pernah punya jalur untuk mengirim wewenang ke database.
  assert.equal("role" in adminKarangan, false)
  assert.equal("status" in adminKarangan, false)
})

test("bentuk rencana upsert terkunci: clerkId, email, dan nama saja", () => {
  assert.deepEqual(
    rencanaDariEvento({
      type: "user.created",
      data: {
        id: "user_b",
        first_name: "Khansa",
        last_name: "Aisyah",
        public_metadata: { role: "admin" },
      },
    }),
    {
      jenis: "upsert",
      clerkId: "user_b",
      email: "user_b@pengguna.kitabku",
      namaLengkap: "Khansa Aisyah",
    },
  )
})

test("user.deleted menghasilkan rencana hapus dengan clerkId", () => {
  assert.deepEqual(rencanaDariEvento({ type: "user.deleted", data: { id: "user_5" } }), {
    jenis: "hapus",
    clerkId: "user_5",
  })
})

test("tipe tak terkait diakui sebagai abaikan tanpa memerlukan data", () => {
  assert.deepEqual(rencanaDariEvento({ type: "organization.created" }), {
    jenis: "abaikan",
    tipe: "organization.created",
  })
})

test("muatan rusak untuk tipe yang dipakai mengembalikan null", () => {
  // data.id hilang
  assert.equal(
    rencanaDariEvento({
      type: "user.created",
      data: { email_addresses: [{ id: "email_1", email_address: "a@b.id" }] },
    }),
    null,
  )
  // muatan bukan objek
  assert.equal(rencanaDariEvento("bukan objek"), null)
  assert.equal(rencanaDariEvento(null), null)
  // email_address tidak berformat email
  assert.equal(
    rencanaDariEvento({
      type: "user.created",
      data: { id: "user_6", email_addresses: [{ id: "email_1", email_address: "bukan-email" }] },
    }),
    null,
  )
})

test("namaLengkap gabungan first dan last name; keduanya kosong menghasilkan null", () => {
  const gabungan = sebagaiUpsert(
    rencanaDariEvento({
      type: "user.created",
      data: { id: "user_7", first_name: "Umar", last_name: "Bakri" },
    }),
  )
  assert.equal(gabungan.namaLengkap, "Umar Bakri")

  const satuBagian = sebagaiUpsert(
    rencanaDariEvento({
      type: "user.created",
      data: { id: "user_8", first_name: "Fatimah", last_name: "" },
    }),
  )
  assert.equal(satuBagian.namaLengkap, "Fatimah")

  const kosong = sebagaiUpsert(
    rencanaDariEvento({
      type: "user.created",
      data: { id: "user_9", first_name: null, last_name: null },
    }),
  )
  assert.equal(kosong.namaLengkap, null)
})
